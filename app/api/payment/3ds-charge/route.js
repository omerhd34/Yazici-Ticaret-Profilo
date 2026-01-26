import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createIyzicoClient } from '@/lib/iyzico';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Product from '@/models/Product';
import { sendAdminNewOrderEmail, sendUserOrderConfirmationEmail } from '@/lib/notifications';

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
  const { paymentId, conversationId, conversationData, orderId } = body || {};

  if (!paymentId || !orderId) {
   return NextResponse.json(
    { success: false, message: 'Eksik bilgi (paymentId ve orderId gerekli)' },
    { status: 400 }
   );
  }

  // iyzico client'ı oluştur
  let iyzico;
  try {
   iyzico = createIyzicoClient();
  } catch (error) {
   return NextResponse.json(
    { success: false, message: error.message || 'İyzico yapılandırma hatası' },
    { status: 500 }
   );
  }

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

  // iyzico Auth 3DS request
  const iyzicoRequest = {
   locale: 'tr',
   paymentId: paymentId,
   conversationId: conversationId || orderId,
   conversationData: conversationData || ''
  };

  // iyzico Auth 3DS API çağrısı
  const result = await iyzico.threedsAuth(iyzicoRequest);

  // Kullanıcıyı tekrar bul ve siparişi güncelle
  const userRefresh = await User.findById(session.id);
  if (!userRefresh) {
   return NextResponse.json(
    { success: false, message: 'Kullanıcı bulunamadı' },
    { status: 404 }
   );
  }

  // Siparişi tekrar bul
  const orderRefresh = userRefresh.orders?.find(o => o.orderId === orderId);
  if (!orderRefresh) {
   return NextResponse.json(
    { success: false, message: 'Sipariş bulunamadı' },
    { status: 404 }
   );
  }

  if (result.status === 'success') {
   // Ödeme başarılı - durumu güncelle
   const updateData = {
    $set: {
     'orders.$.status': 'Beklemede',
     'orders.$.payment': {
      type: '3dsecure',
      transactionId: result.paymentId,
      paymentId: result.paymentId,
      conversationId: result.conversationId,
      cardType: result.cardType,
      cardAssociation: result.cardAssociation,
      cardFamily: result.cardFamily,
      binNumber: result.binNumber,
      lastFourDigits: result.lastFourDigits,
      paidAt: new Date(),
     },
     'orders.$.updatedAt': new Date(),
    },
   };

   await User.updateOne(
    { _id: userRefresh._id, 'orders.orderId': orderId },
    updateData
   );

   // Ödeme başarılı olduğuna göre stokları azalt
   try {
    for (const item of orderRefresh.items) {
     const productId = item.productId;
     const quantity = item.quantity || 1;

     if (productId) {
      // Önce ürünü getir
      const product = await Product.findById(productId);
      if (!product) continue;

      // Ana ürünün stokunu azalt
      const updateData = {
       $inc: {
        soldCount: quantity,
        stock: -quantity
       }
      };

      // Ana ürün stokunu güncelle
      await Product.findByIdAndUpdate(
       productId,
       updateData,
       { new: true }
      );

      // Eğer renk seçilmişse, o rengin stokunu da azalt
      if (item.color && product.colors && Array.isArray(product.colors)) {
       const colorName = String(item.color).trim();
       // Renk bazlı stok güncellemesi - positional operator kullan
       await Product.updateOne(
        {
         _id: productId,
         'colors.name': colorName
        },
        {
         $inc: { 'colors.$.stock': -quantity }
        }
       );
      }
     }
    }
   } catch (stockUpdateError) {
    console.error('Stok güncelleme hatası:', stockUpdateError);
    // Stok güncelleme hatası - sessizce handle et
   }

   // Admin'e e-posta gönder
   try {
    const adminEmail = process.env.EMAIL_USER;
    const addrSummary = orderRefresh.addressSummary || '';
    const pmText = 'Kart ile Ödeme (3D Secure)';

    if (adminEmail) {
     await sendAdminNewOrderEmail({
      adminEmail,
      orderId: orderRefresh.orderId,
      userName: userRefresh.name,
      userEmail: userRefresh.email,
      userPhone: userRefresh.phone,
      total: orderRefresh.total,
      paymentMethod: pmText,
      addressSummary: addrSummary,
      items: orderRefresh.items,
     });
    }
   } catch (e) {
    console.error('Admin e-posta gönderme hatası:', e);
   }

   // Müşteriye e-posta gönder
   try {
    const emailNotificationsEnabled = userRefresh.notificationPreferences?.emailNotifications !== false;

    if (emailNotificationsEnabled && userRefresh.email) {
     const addrSummary = orderRefresh.addressSummary || '';
     const pmText = 'Kart ile Ödeme (3D Secure)';

     await sendUserOrderConfirmationEmail({
      userEmail: userRefresh.email,
      userName: userRefresh.name,
      orderId: orderRefresh.orderId,
      orderDate: orderRefresh.date,
      total: orderRefresh.total,
      paymentMethod: pmText,
      addressSummary: addrSummary,
      items: orderRefresh.items,
     });
    }
   } catch (e) {
    console.error('Kullanıcı e-posta gönderme hatası:', e);
   }

   return NextResponse.json({
    success: true,
    message: 'Ödeme başarıyla tamamlandı',
    transactionId: result.paymentId,
    orderId: orderId,
   });
  } else {
   // Ödeme başarısız
   const updateData = {
    $set: {
     'orders.$.status': 'Ödeme Başarısız',
     'orders.$.payment': {
      type: '3dsecure',
      error: result.errorMessage || 'Ödeme işlemi başarısız',
      errorCode: result.errorCode,
      failedAt: new Date(),
     },
     'orders.$.updatedAt': new Date(),
    },
   };

   await User.updateOne(
    { _id: userRefresh._id, 'orders.orderId': orderId },
    updateData
   );

   console.error('iyzico 3D Secure auth başarısız:', result);
   return NextResponse.json(
    {
     success: false,
     message: result.errorMessage || 'Ödeme işlemi başarısız',
     errorCode: result.errorCode
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
