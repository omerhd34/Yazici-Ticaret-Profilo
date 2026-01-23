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

  // Kullanıcıyı veritabanından al
  const user = await User.findById(session.id);
  if (!user) {
   return NextResponse.json(
    { success: false, message: 'Kullanıcı bulunamadı' },
    { status: 404 }
   );
  }

  const body = await request.json();
  const { amount, referenceNo, cardData, address, items } = body || {};

  if (!amount || !referenceNo || !cardData || !address) {
   return NextResponse.json(
    { success: false, message: 'Eksik bilgi' },
    { status: 400 }
   );
  }

  const paynetSecretKey = process.env.PAYNET_API_SECRET_KEY;
  const paynetBaseUrl = process.env.PAYNET_API_BASE_URL || 'https://pts-api.paynet.com.tr';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  if (!paynetSecretKey || paynetSecretKey === 'your_secret_key_here') {
   return NextResponse.json(
    { success: false, message: 'Ödeme sistemi yapılandırılmamış. Lütfen PAYNET_API_SECRET_KEY değerini .env.local dosyasına ekleyin.' },
    { status: 500 }
   );
  }

  // Net Tahsilat API için istek hazırla
  const requestData = {
   amount: amount.toString().replace('.', ','), // Paynet virgül kullanıyor
   reference_no: referenceNo,
   return_url: `${baseUrl}/odeme-callback`,
   domain: new URL(baseUrl).hostname,
   card_holder: cardData.cardHolder || '',
   pan: cardData.cardNumber || '',
   month: parseInt(cardData.month) || 0,
   year: parseInt(cardData.year) || 0,
   cvc: cardData.cvc || '',
   card_holder_phone: address.phone || '',
   card_holder_mail: user.email || address.email || '',
   description: `Sipariş: ${referenceNo}`,
  };

  // Paynet API Basic Authentication için secret key'i base64 encode et
  const authHeader = Buffer.from(paynetSecretKey).toString('base64');

  // API isteği gönder
  const apiUrl = `${paynetBaseUrl}/v2/transaction/tds_initial`;

  const response = await axios.post(apiUrl, requestData, {
   headers: {
    'Accept': 'application/json; charset=UTF-8',
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': `Basic ${authHeader}`,
   },
  });

  const responseData = response.data;

  if (responseData.code === 0 && responseData.post_url) {
   return NextResponse.json({
    success: true,
    postUrl: responseData.post_url,
    htmlContent: responseData.html_content,
    tokenId: responseData.token_id,
    sessionId: responseData.session_id,
   });
  } else {
   return NextResponse.json(
    {
     success: false,
     message: responseData.message || '3D Secure başlatılamadı',
     code: responseData.code
    },
    { status: 400 }
   );
  }
 } catch (error) {
  console.error('3D Secure başlatma hatası:', error);
  return NextResponse.json(
   {
    success: false,
    message: error.response?.data?.message || 'Ödeme işlemi başlatılamadı',
    error: error.message
   },
   { status: 500 }
  );
 }
}
