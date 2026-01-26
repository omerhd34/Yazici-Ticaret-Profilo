import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

async function requireAdmin() {
 const cookieStore = await cookies();
 const session = cookieStore.get("admin-session");
 return session && session.value === "authenticated";
}

// GET - Admin: tüm siparişleri (kullanıcı bilgisiyle) getir
export async function GET() {
 try {
  if (!(await requireAdmin())) {
   return NextResponse.json({ success: false, message: "Yetkisiz" }, { status: 401 });
  }

  await dbConnect();

  const users = await User.find({}).select("name email phone orders").lean();

  const orders = [];
  for (const u of users) {
   const userOrders = Array.isArray(u.orders) ? u.orders : [];
   for (const o of userOrders) {
    // İade onaylandıysa ve 5 gün geçtiyse otomatik iptal (ürün satıcıya ulaşmadı varsayımı)
    try {
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
      const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
      if (Date.now() - approvedAt.getTime() > fiveDaysMs) {
       const now = new Date();
       await User.updateOne(
        { _id: u._id, "orders.orderId": String(o.orderId) },
        {
         $set: {
          "orders.$.returnRequest.status": "İptal Edildi",
          "orders.$.returnRequest.cancelledAt": now,
          "orders.$.returnRequest.cancelReason": "Ürün 5 gün içinde satıcıya ulaşmadığı için iade iptal edildi.",
          "orders.$.updatedAt": now,
         },
        }
       );
       // response'a da güncel göster
       if (o.returnRequest) {
        o.returnRequest.status = "İptal Edildi";
        o.returnRequest.cancelledAt = now;
        o.returnRequest.cancelReason = "Ürün 5 gün içinde satıcıya ulaşmadığı için iade iptal edildi.";
       }
      }
     }
    } catch {
     // sessiz geç (best-effort)
    }

    // "Ödeme Bekleniyor" ve "Ödeme Başarısız" durumundaki siparişleri admin panelinde gösterme
    // Bunlar henüz ödeme yapılmamış veya başarısız olan siparişlerdir
    // Ayrıca "Beklemede" olsa bile ödeme bilgisi (paidAt) yoksa gösterme
    const hasPaidAt = o.payment && (o.payment.paidAt || o.payment.transactionId);
    const isValidOrder = o.status !== 'Ödeme Bekleniyor' &&
     o.status !== 'Ödeme Başarısız' &&
     (o.status !== 'Beklemede' || hasPaidAt);

    if (isValidOrder) {
     orders.push({
      user: {
       id: u._id,
       name: u.name,
       email: u.email,
       phone: u.phone || "",
      },
      order: o,
     });
    }
   }
  }

  orders.sort((a, b) => {
   const da = a.order?.date ? new Date(a.order.date).getTime() : 0;
   const db = b.order?.date ? new Date(b.order.date).getTime() : 0;
   return db - da;
  });

  return NextResponse.json({ success: true, orders });
 } catch (error) {
  return NextResponse.json(
   { success: false, message: "Siparişler getirilemedi", error: error.message },
   { status: 500 }
  );
 }
}

