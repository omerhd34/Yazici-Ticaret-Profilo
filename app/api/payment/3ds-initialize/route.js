import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Iyzipay from 'iyzipay';
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

  const iyzicoApiKey = process.env.IYZICO_API_KEY;
  const iyzicoSecretKey = process.env.IYZICO_SECRET_KEY;
  const iyzicoUri = process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr';

  if (!iyzicoApiKey || !iyzicoSecretKey || iyzicoApiKey === 'your_api_key_here' || iyzicoSecretKey === 'your_secret_key_here') {
   return NextResponse.json(
    { success: false, message: 'iyzipay API key ve secret key ayarları yapılmadı' },
    { status: 500 }
   );
  }

  // iyzico client'ı oluştur
  const iyzipay = new Iyzipay({
   apiKey: iyzicoApiKey,
   secretKey: iyzicoSecretKey,
   uri: iyzicoUri
  });

  // Kart bilgilerini hazırla
  const cardNumber = cardData.cardNumber?.replace(/\s/g, '') || '';
  const cardHolderName = cardData.cardHolder || '';
  const expireMonth = String(cardData.month || '').padStart(2, '0');
  const expireYear = String(cardData.year || '').slice(-2);
  const cvc = cardData.cvc || '';

  // Sepet öğelerini hazırla
  const basketItems = (items || []).map((item, index) => ({
   id: String(item.productId || index),
   name: item.name || 'Ürün',
   category1: 'Genel',
   itemType: 'PHYSICAL',
   price: (item.price || 0).toFixed(2)
  }));

  // Alıcı bilgilerini hazırla
  const buyerName = address.fullName?.split(' ')[0] || user.name?.split(' ')[0] || 'Müşteri';
  const buyerSurname = address.fullName?.split(' ').slice(1).join(' ') || user.name?.split(' ').slice(1).join(' ') || '';

  // Client IP adresini al
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
   request.headers.get('x-real-ip') ||
   '127.0.0.1';

  // iyzico Init 3DS request
  const iyzicoRequest = {
   locale: 'tr',
   conversationId: referenceNo,
   price: amount.toFixed(2),
   paidPrice: amount.toFixed(2),
   currency: 'TRY',
   installment: '1',
   paymentCard: {
    cardHolderName: cardHolderName,
    cardNumber: cardNumber,
    expireMonth: expireMonth,
    expireYear: expireYear,
    cvc: cvc,
    registerCard: '0'
   },
   buyer: {
    id: String(user._id || user.id || ''),
    name: buyerName,
    surname: buyerSurname,
    gsmNumber: address.phone || '',
    email: user.email || address.email || '',
    identityNumber: '',
    lastLoginDate: new Date().toISOString().split('T')[0],
    registrationDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    registrationAddress: address.address || '',
    ip: clientIp,
    city: address.city || '',
    country: 'Turkey',
    zipCode: ''
   },
   shippingAddress: {
    contactName: address.fullName || `${buyerName} ${buyerSurname}`,
    city: address.city || '',
    country: 'Turkey',
    address: address.address || '',
    zipCode: ''
   },
   billingAddress: {
    contactName: address.fullName || `${buyerName} ${buyerSurname}`,
    city: address.city || '',
    country: 'Turkey',
    address: address.address || '',
    zipCode: ''
   },
   basketItems: basketItems.length > 0 ? basketItems : [{
    id: '1',
    name: 'Sipariş',
    category1: 'Genel',
    itemType: 'PHYSICAL',
    price: amount.toFixed(2)
   }],
   callbackUrl: `${baseUrl}/odeme-callback?orderId=${referenceNo}`
  };

  // iyzico Init 3DS API çağrısı (Promise wrapper)
  return new Promise((resolve) => {
   iyzipay.threedsInitialize.create(iyzicoRequest, (err, result) => {
    if (err) {
     console.error('iyzico 3D Secure başlatma hatası:', err);
     resolve(NextResponse.json(
      {
       success: false,
       message: err.message || '3D Secure başlatılamadı',
       error: err
      },
      { status: 400 }
     ));
     return;
    }

    if (result.status === 'success' && result.htmlContent) {
     resolve(NextResponse.json({
      success: true,
      htmlContent: result.htmlContent,
      conversationId: result.conversationId,
      paymentId: result.paymentId
     }));
    } else {
     resolve(NextResponse.json(
      {
       success: false,
       message: result.errorMessage || '3D Secure başlatılamadı',
       errorCode: result.errorCode
      },
      { status: 400 }
     ));
    }
   });
  });
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
