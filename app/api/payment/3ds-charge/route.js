import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request) {
 try {
  await dbConnect();

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('user-session');

  if (!sessionCookie || !sessionCookie.value) {
   return NextResponse.json(
    { success: false, message: 'Oturum bulunamadı' },
    { status: 401 }
   );
  }

  let session;
  try {
   session = JSON.parse(sessionCookie.value);
  } catch {
   return NextResponse.json(
    { success: false, message: 'Oturum hatası. Lütfen tekrar giriş yapın.' },
    { status: 401 }
   );
  }

  if (!session?.id) {
   return NextResponse.json(
    { success: false, message: 'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.' },
    { status: 401 }
   );
  }

  const body = await request.json();
  const { sessionId, tokenId, orderId } = body || {};

  if (!sessionId || !tokenId || !orderId) {
   return NextResponse.json(
    { success: false, message: 'Eksik bilgi' },
    { status: 400 }
   );
  }

  const paynetSecretKey = process.env.PAYNET_API_SECRET_KEY;
  const paynetBaseUrl = process.env.PAYNET_API_BASE_URL || 'https://pts-api.paynet.com.tr';

  if (!paynetSecretKey) {
   return NextResponse.json(
    { success: false, message: 'Ödeme sistemi yapılandırılmamış' },
    { status: 500 }
   );
  }

  // 3D Secure charge isteği
  const requestData = {
   session_id: sessionId,
   token_id: tokenId,
  };

  // Paynet API Basic Authentication için secret key'i base64 encode et
  const authHeader = Buffer.from(paynetSecretKey).toString('base64');

  // API isteği gönder
  const apiUrl = `${paynetBaseUrl}/v2/transaction/tds_charge`;

  const response = await axios.post(apiUrl, requestData, {
   headers: {
    'Accept': 'application/json; charset=UTF-8',
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': `Basic ${authHeader}`,
   },
  });

  const responseData = response.data;

  // Kullanıcıyı bul ve siparişi güncelle
  const user = await User.findById(session.id);
  if (!user) {
   return NextResponse.json(
    { success: false, message: 'Kullanıcı bulunamadı' },
    { status: 404 }
   );
  }

  // Siparişi bul
  const order = user.orders?.find(o => o.orderId === orderId);
  if (!order) {
   return NextResponse.json(
    { success: false, message: 'Sipariş bulunamadı' },
    { status: 404 }
   );
  }

  if (responseData.code === 0 && responseData.is_succeed) {
   // Ödeme başarılı
   const updateData = {
    $set: {
     'orders.$.status': 'Ödeme Alındı',
     'orders.$.payment': {
      type: '3dsecure',
      transactionId: responseData.xact_id,
      bankAuthorizationCode: responseData.bank_authorization_code,
      bankReferenceCode: responseData.bank_reference_code,
      cardNoMasked: responseData.card_no_masked,
      paidAt: new Date(),
     },
     'orders.$.updatedAt': new Date(),
    },
   };

   await User.updateOne(
    { _id: user._id, 'orders.orderId': orderId },
    updateData
   );

   return NextResponse.json({
    success: true,
    message: 'Ödeme başarıyla tamamlandı',
    transactionId: responseData.xact_id,
    orderId: orderId,
   });
  } else {
   // Ödeme başarısız
   const updateData = {
    $set: {
     'orders.$.status': 'Ödeme Başarısız',
     'orders.$.payment': {
      type: '3dsecure',
      error: responseData.bank_error_message || responseData.message,
      failedAt: new Date(),
     },
     'orders.$.updatedAt': new Date(),
    },
   };

   await User.updateOne(
    { _id: user._id, 'orders.orderId': orderId },
    updateData
   );

   return NextResponse.json(
    {
     success: false,
     message: responseData.bank_error_message || responseData.message || 'Ödeme işlemi başarısız',
     code: responseData.code
    },
    { status: 400 }
   );
  }
 } catch (error) {
  console.error('3D Secure charge hatası:', error);
  return NextResponse.json(
   {
    success: false,
    message: error.response?.data?.message || 'Ödeme işlemi tamamlanamadı',
    error: error.message
   },
   { status: 500 }
  );
 }
}
