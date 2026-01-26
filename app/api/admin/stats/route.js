import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Product from "@/models/Product";
import Contact from "@/models/Contact";
import ProductRequest from "@/models/ProductRequest";

async function requireAdmin() {
 const cookieStore = await cookies();
 const session = cookieStore.get("admin-session");
 return session && session.value === "authenticated";
}

// GET - Admin: kullanıcı sayısı, sipariş sayısı, ürün sayısı
export async function GET() {
 try {
  if (!(await requireAdmin())) {
   return NextResponse.json({ success: false, message: "Yetkisiz" }, { status: 401 });
  }

  await dbConnect();

  const [userCount, productCount, inStockProductCount, totalContacts, unreadContacts, totalProductRequests] = await Promise.all([
   User.countDocuments(),
   Product.countDocuments(),
   Product.countDocuments({ stock: { $gt: 0 } }),
   Contact.countDocuments(),
   Contact.countDocuments({ read: false }),
   ProductRequest.countDocuments(),
  ]);

  // Tüm kullanıcıları ve siparişlerini al
  const users = await User.find({}, 'orders').lean();

  // Tüm siparişleri topla ve filtrele
  let totalOrders = 0;
  let pendingOrders = 0;
  let shippedOrders = 0;
  let deliveredOrders = 0;
  let cancelledOrders = 0;

  users.forEach(user => {
   if (!user.orders || !Array.isArray(user.orders)) return;

   user.orders.forEach(order => {
    if (!order || !order.orderId) return;

    const status = order.status || '';
    const hasPaidAt = order.payment && (order.payment.paidAt || order.payment.transactionId);

    // Geçersiz siparişleri atla
    if (status === 'Ödeme Bekleniyor' || status === 'Ödeme Başarısız') {
     return;
    }

    // Beklemede ama ödeme bilgisi yoksa atla
    if (status === 'Beklemede' && !hasPaidAt) {
     return;
    }

    // Geçerli sipariş - say
    totalOrders++;

    // Durum bazlı sayım
    if (status === 'Beklemede') pendingOrders++;
    else if (status.includes('Kargoya')) shippedOrders++;
    else if (status.includes('Teslim')) deliveredOrders++;
    else if (status.includes('İptal') || status.includes('iptal')) cancelledOrders++;
   });
  });

  return NextResponse.json({
   success: true,
   stats: {
    userCount,
    productCount,
    inStockProductCount,
    totalOrders,
    pendingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalContacts,
    unreadContacts,
    totalProductRequests,
   },
  });
 } catch (error) {
  return NextResponse.json(
   { success: false, message: "İstatistikler getirilemedi", error: error.message },
   { status: 500 }
  );
 }
}

