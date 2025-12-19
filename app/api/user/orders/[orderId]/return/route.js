import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { sendAdminReturnRequestEmail } from "@/lib/notifications";
import normalizeText from "@/lib/normalizeText";

export async function POST(request, { params }) {
 try {
  await dbConnect();

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("user-session");
  if (!sessionCookie?.value) {
   return NextResponse.json({ success: false, message: "Giriş yapmanız gerekiyor" }, { status: 401 });
  }

  let session;
  try {
   session = JSON.parse(sessionCookie.value);
  } catch {
   return NextResponse.json({ success: false, message: "Oturum hatası. Lütfen tekrar giriş yapın." }, { status: 401 });
  }

  if (!session?.id) {
   return NextResponse.json({ success: false, message: "Kullanıcı bilgisi bulunamadı" }, { status: 401 });
  }

  const resolvedParams = await params;
  const { orderId } = resolvedParams;
  if (!orderId) {
   return NextResponse.json({ success: false, message: "Sipariş bulunamadı" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const note = body?.note ? String(body.note).slice(0, 500) : "";

  const user = await User.findById(session.id);
  if (!user) {
   return NextResponse.json({ success: false, message: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  const idx = (user.orders || []).findIndex((o) => o.orderId === String(orderId));
  if (idx === -1) {
   return NextResponse.json({ success: false, message: "Sipariş bulunamadı" }, { status: 404 });
  }

  const statusNorm = normalizeText(user.orders[idx]?.status);
  const isDelivered = statusNorm.includes("teslim") || statusNorm.includes("delivered") || statusNorm.includes("completed");
  if (!isDelivered) {
   return NextResponse.json(
    { success: false, message: "İade talebi sadece teslim edilen siparişlerde oluşturulabilir." },
    { status: 403 }
   );
  }

  // 7 gün kuralı (teslim tarihinden itibaren)
  const deliveredAt = user.orders[idx]?.deliveredAt
   ? new Date(user.orders[idx].deliveredAt)
   : (user.orders[idx]?.updatedAt ? new Date(user.orders[idx].updatedAt) : null);
  if (!deliveredAt || isNaN(deliveredAt.getTime())) {
   return NextResponse.json(
    { success: false, message: "Teslim tarihi bulunamadı. İade talebi oluşturulamadı." },
    { status: 400 }
   );
  }

  const diffMs = Date.now() - deliveredAt.getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  if (diffMs > sevenDaysMs) {
   return NextResponse.json(
    { success: false, message: "İade süresi doldu. Ürün teslim edildikten sonra 7 gün içinde iade talebi oluşturabilirsiniz." },
    { status: 403 }
   );
  }

  const existing = user.orders[idx]?.returnRequest;
  if (existing?.status) {
   const existingStatusNorm = normalizeText(existing.status);
   // Eğer iade talebi iptal edildiyse, tekrar iade talebi oluşturulamaz
   if (existingStatusNorm.includes("iptal")) {
    return NextResponse.json(
     { success: false, message: "Bu sipariş için iade talebi daha önce iptal edilmiş. Tekrar iade talebi oluşturulamaz." },
     { status: 403 }
    );
   }
   return NextResponse.json(
    { success: false, message: "Bu sipariş için zaten bir iade talebi oluşturulmuş." },
    { status: 409 }
   );
  }

  const now = new Date();

  // Kaydetmeyi garantiye almak için positional update kullan
  const upd = await User.updateOne(
   { _id: user._id, "orders.orderId": String(orderId) },
   {
    $set: {
     "orders.$.returnRequest": {
      status: "Talep Edildi",
      requestedAt: now,
      note,
     },
     "orders.$.updatedAt": now,
    },
   }
  );

  // Güncel siparişi tekrar oku (response + UI senkronu için)
  const freshUser = await User.findById(user._id).select("orders").lean();
  const freshOrder = (freshUser?.orders || []).find((o) => o.orderId === String(orderId)) || null;
  const persisted = Boolean(freshOrder?.returnRequest?.status);
  if (!persisted || (upd?.matchedCount ?? 0) === 0) {
   return NextResponse.json(
    { success: false, message: "İade talebi kaydedilemedi. Lütfen tekrar deneyin." },
    { status: 500 }
   );
  }

  // Admin'e e-posta bildirimi (best-effort)
  try {
   const adminEmail = process.env.ADMIN_EMAIL;
   const order = user.orders[idx];
   await sendAdminReturnRequestEmail({
    adminEmail,
    orderId: String(orderId),
    userName: user.name,
    userEmail: user.email,
    userPhone: user.phone,
    total: order?.total,
    deliveredAt,
    note,
   });
  } catch {
  }

  return NextResponse.json({
   success: true,
   message: "İade talebi oluşturuldu",
   returnRequest: freshOrder?.returnRequest || null,
  });
 } catch (error) {
  console.error("Return request error:", error);
  return NextResponse.json(
   { success: false, message: "İade talebi oluşturulamadı", error: error.message },
   { status: 500 }
  );
 }
}

export async function DELETE(request, { params }) {
 try {
  await dbConnect();

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("user-session");
  if (!sessionCookie?.value) {
   return NextResponse.json({ success: false, message: "Giriş yapmanız gerekiyor" }, { status: 401 });
  }

  let session;
  try {
   session = JSON.parse(sessionCookie.value);
  } catch {
   return NextResponse.json({ success: false, message: "Oturum hatası. Lütfen tekrar giriş yapın." }, { status: 401 });
  }

  if (!session?.id) {
   return NextResponse.json({ success: false, message: "Kullanıcı bilgisi bulunamadı" }, { status: 401 });
  }

  const resolvedParams = await params;
  const { orderId } = resolvedParams;
  if (!orderId) {
   return NextResponse.json({ success: false, message: "Sipariş bulunamadı" }, { status: 400 });
  }

  const user = await User.findById(session.id);
  if (!user) {
   return NextResponse.json({ success: false, message: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  const idx = (user.orders || []).findIndex((o) => o.orderId === String(orderId));
  if (idx === -1) {
   return NextResponse.json({ success: false, message: "Sipariş bulunamadı" }, { status: 404 });
  }

  const returnRequest = user.orders[idx]?.returnRequest;
  if (!returnRequest || !returnRequest.status) {
   return NextResponse.json(
    { success: false, message: "Bu sipariş için iade talebi bulunamadı." },
    { status: 404 }
   );
  }

  const statusNorm = normalizeText(returnRequest.status);
  const isRequested = statusNorm.includes("talep");
  const isApproved = statusNorm.includes("onay");
  const isCancelled = statusNorm.includes("iptal");
  const isRejected = statusNorm.includes("red");
  const isCompleted = statusNorm.includes("tamam");

  // Sadece "Talep Edildi" durumundaki iade talepleri iptal edilebilir
  if (!isRequested || isApproved || isCancelled || isRejected || isCompleted) {
   return NextResponse.json(
    { success: false, message: "Sadece 'Talep Edildi' durumundaki iade talepleri iptal edilebilir." },
    { status: 403 }
   );
  }

  // 2 gün kontrolü (talep tarihinden itibaren)
  const requestedAt = returnRequest.requestedAt ? new Date(returnRequest.requestedAt) : null;
  if (!requestedAt || isNaN(requestedAt.getTime())) {
   return NextResponse.json(
    { success: false, message: "Talep tarihi bulunamadı. İade talebi iptal edilemedi." },
    { status: 400 }
   );
  }

  const diffMs = Date.now() - requestedAt.getTime();
  const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
  if (diffMs > twoDaysMs) {
   return NextResponse.json(
    { success: false, message: "İade talebi iptal süresi doldu. Talep oluşturulduktan sonra 2 gün içinde iptal edilebilir." },
    { status: 403 }
   );
  }

  const now = new Date();

  // İade talebini iptal et (status'ü "İptal Edildi" yap, böylece tekrar iade edilemez)
  const upd = await User.updateOne(
   { _id: user._id, "orders.orderId": String(orderId) },
   {
    $set: {
     "orders.$.returnRequest.status": "İptal Edildi",
     "orders.$.returnRequest.cancelledAt": now,
     "orders.$.updatedAt": now,
    },
   }
  );

  if ((upd?.matchedCount ?? 0) === 0) {
   return NextResponse.json(
    { success: false, message: "İade talebi iptal edilemedi. Lütfen tekrar deneyin." },
    { status: 500 }
   );
  }

  return NextResponse.json({
   success: true,
   message: "İade talebi başarıyla iptal edildi",
  });
 } catch (error) {
  console.error("Return request cancel error:", error);
  return NextResponse.json(
   { success: false, message: "İade talebi iptal edilemedi", error: error.message },
   { status: 500 }
  );
 }
}

