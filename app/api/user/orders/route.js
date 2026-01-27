import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Product from '@/models/Product';
import { sendAdminNewOrderEmail, sendUserOrderConfirmationEmail } from '@/lib/notifications';

// GET - Kullanıcının siparişlerini getir
export async function GET() {
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
  } catch (parseError) {
   return NextResponse.json(
    { success: false, message: 'Oturum hatası. Lütfen tekrar giriş yapın.' },
    { status: 401 }
   );
  }

  if (!session || !session.id) {
   return NextResponse.json(
    { success: false, message: 'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.' },
    { status: 401 }
   );
  }

  const userId = session.id;

  const user = await User.findById(userId);

  if (!user) {
   return NextResponse.json(
    { success: false, message: 'Kullanıcı bulunamadı' },
    { status: 404 }
   );
  }

  // Siparişleri tarihe göre sırala (yeniden eskiye)
  let ordersList = user.orders || [];

  // "Ödeme Bekleniyor" ve "Ödeme Başarısız" durumundaki siparişleri filtrele
  // Ayrıca "Beklemede" olsa bile ödeme bilgisi (paidAt) yoksa gösterme
  ordersList = ordersList.filter(o => {
   const hasPaidAt = o.payment && (o.payment.paidAt || o.payment.transactionId);
   return o.status !== 'Ödeme Bekleniyor' &&
    o.status !== 'Ödeme Başarısız' &&
    (o.status !== 'Beklemede' || hasPaidAt);
  });

  if (ordersList.length > 0) {
   try {
    ordersList = ordersList.sort((a, b) => {
     const dateA = a.date ? new Date(a.date).getTime() : 0;
     const dateB = b.date ? new Date(b.date).getTime() : 0;
     return dateB - dateA;
    });
   } catch (sortError) {
    // Sıralama hatası varsa orijinal sırayla döndür
   }
  }

  // İade onaylandıysa ve 5 gün geçtiyse otomatik iptal (UI tutarlılığı için GET'te best-effort)
  try {
   const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
   for (const o of ordersList) {
    const rrStatusRaw = String(o?.returnRequest?.status || "").trim();
    const rrNorm = rrStatusRaw
     .replace(/\s*\(.*?\)\s*/g, " ")
     .replace(/\s+/g, " ")
     .trim()
     .toLowerCase()
     .normalize("NFKD")
     .replace(/[\u0300-\u036f]/g, "");
    const approvedAt = o?.returnRequest?.approvedAt ? new Date(o.returnRequest.approvedAt) : null;
    const completedAt = o?.returnRequest?.completedAt ? new Date(o.returnRequest.completedAt) : null;
    const isApproved = rrNorm.includes("onay");
    const isCompleted = rrNorm.includes("tamam") || (completedAt && !isNaN(completedAt.getTime()));
    const isAlreadyCancelled = rrNorm.includes("iptal");
    if (isApproved && !isCompleted && !isAlreadyCancelled && approvedAt && !isNaN(approvedAt.getTime())) {
     if (Date.now() - approvedAt.getTime() > fiveDaysMs) {
      const now = new Date();
      await User.updateOne(
       { _id: user._id, "orders.orderId": String(o.orderId) },
       {
        $set: {
         "orders.$.returnRequest.status": "İptal Edildi",
         "orders.$.returnRequest.cancelledAt": now,
         "orders.$.returnRequest.cancelReason": "Ürün 5 gün içinde satıcıya ulaşmadığı için iade iptal edildi.",
         "orders.$.updatedAt": now,
        },
       }
      );
      if (o.returnRequest) {
       o.returnRequest.status = "İptal Edildi";
       o.returnRequest.cancelledAt = now;
       o.returnRequest.cancelReason = "Ürün 5 gün içinde satıcıya ulaşmadığı için iade iptal edildi.";
      }
     }
    }
   }
  } catch {
   // sessiz geç
  }

  return NextResponse.json({
   success: true,
   orders: ordersList,
  });
 } catch (error) {
  return NextResponse.json(
   { success: false, message: 'Siparişler getirilemedi', error: error.message },
   { status: 500 }
  );
 }
}

// POST - Kullanıcı sipariş oluştur
export async function POST(request) {
 try {
  await dbConnect();

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('user-session');

  if (!sessionCookie || !sessionCookie.value) {
   return NextResponse.json({ success: false, message: 'Oturum bulunamadı' }, { status: 401 });
  }

  let session;
  try {
   session = JSON.parse(sessionCookie.value);
  } catch {
   return NextResponse.json({ success: false, message: 'Oturum hatası. Lütfen tekrar giriş yapın.' }, { status: 401 });
  }

  if (!session?.id) {
   return NextResponse.json({ success: false, message: 'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.' }, { status: 401 });
  }

  const body = await request.json();
  const { items, total, paymentMethod, address } = body || {};

  if (!Array.isArray(items) || items.length === 0) {
   return NextResponse.json({ success: false, message: 'Sepet boş' }, { status: 400 });
  }
  if (!address?.id) {
   return NextResponse.json({ success: false, message: 'Adres seçilmedi' }, { status: 400 });
  }

  const normalizedItems = items.map((it) => ({
   ...it,
   productId: String(it?.productId || it?._id || it?.id || ""),
   quantity: Number(it?.quantity || 1) || 1,
  }));
  const productIds = Array.from(new Set(normalizedItems.map((it) => it.productId).filter(Boolean)));
  const products = await Product.find({ _id: { $in: productIds } }).select("price discountPrice name slug images serialNumber").lean();
  const productById = new Map(products.map((p) => [String(p._id), p]));

  const repricedItems = normalizedItems.map((it) => {
   const p = productById.get(String(it.productId));
   if (!p) return { ...it, _missingProduct: true };

   // İstemciden gelen fiyatı kullan
   // Eğer istemciden fiyat gelmemişse, ürünün normal fiyatını kullan
   let price = it.price;
   if (!price || price === 0) {
    price = p.discountPrice && p.discountPrice < p.price ? p.discountPrice : p.price;
   }

   return {
    ...it,
    name: it.name || p.name,
    slug: it.slug || p.slug,
    image: it.image || p?.images?.[0] || "",
    price: Number(price || 0),
    serialNumber: p.serialNumber || "",
   };
  });
  const missing = repricedItems.find((it) => it._missingProduct);
  if (missing) {
   return NextResponse.json(
    { success: false, message: "Sepetinizdeki ürünlerden bazıları artık bulunamadı. Lütfen sepeti güncelleyin." },
    { status: 404 }
   );
  }

  const itemsTotal = repricedItems.reduce((sum, it) => sum + (Number(it.price || 0) * (Number(it.quantity || 1) || 1)), 0);
  const shippingCost = itemsTotal >= 500 ? 0 : 29.99;
  const serverGrandTotal = Math.round((itemsTotal + shippingCost) * 100) / 100;
  const clientTotal = Number(total || 0) || 0;
  const priceUpdated = Math.abs(serverGrandTotal - clientTotal) > 0.01;

  const user = await User.findById(session.id);
  if (!user) {
   return NextResponse.json({ success: false, message: 'Kullanıcı bulunamadı' }, { status: 404 });
  }

  // Çift sipariş koruması: Son 3 saniye içinde sipariş varsa reddet
  if (Array.isArray(user.orders) && user.orders.length > 0) {
   const lastOrder = user.orders[0];
   const lastOrderDate = lastOrder?.createdAt || lastOrder?.date;
   if (lastOrderDate) {
    const now = new Date();
    const lastOrderTime = new Date(lastOrderDate);
    const diffSeconds = (now - lastOrderTime) / 1000;
    if (diffSeconds < 3) {
     return NextResponse.json(
      { success: false, message: 'Lütfen birkaç saniye bekleyip tekrar deneyin.' },
      { status: 429 }
     );
    }
   }
  }

  const orderId = `YZT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  // Sipariş başlangıçta "Ödeme Bekleniyor" durumunda oluşturuluyor
  // Ödeme başarılı olduğunda 3ds-charge API'si durumu güncelleyecek
  const orderStatus = 'Ödeme Bekleniyor';

  const order = {
   orderId,
   date: new Date(),
   status: orderStatus,
   total: serverGrandTotal,
   items: repricedItems,
   payment: paymentMethod || { type: '3dsecure' },
   addressId: String(address.id),
   addressSummary: address.summary || '',
   shippingAddress: address.shippingAddress || null,
   billingAddress: address.billingAddress || null,
   createdAt: new Date(),
  };

  if (!Array.isArray(user.orders)) user.orders = [];
  user.orders.unshift(order);
  await user.save();

  return NextResponse.json({
   success: true,
   message: 'Sipariş oluşturuldu',
   orderId,
   priceUpdated,
   totals: { itemsTotal: Math.round(itemsTotal * 100) / 100, shippingCost, grandTotal: serverGrandTotal },
  });
 } catch (error) {
  return NextResponse.json({ success: false, message: 'Sipariş oluşturulamadı', error: error.message }, { status: 500 });
 }
}
