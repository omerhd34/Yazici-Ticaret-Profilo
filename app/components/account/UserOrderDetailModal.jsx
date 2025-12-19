"use client";
import { useMemo, useState, useEffect } from "react";
import { HiX } from "react-icons/hi";
import normalizeText from "@/lib/normalizeText";

export default function UserOrderDetailModal({ show, order, addresses, onClose, onCancel, onReturn, onCancelReturn, formatOrderStatus }) {
 const [currentTime, setCurrentTime] = useState(() => Date.now());

 useEffect(() => {
  const timer = setInterval(() => {
   setCurrentTime(Date.now());
  }, 1000);
  return () => clearInterval(timer);
 }, []);

 const addrFromSaved = useMemo(() => {
  if (!order?.addressId) return null;
  return addresses.find(a => String(a._id) === String(order.addressId)) || null;
 }, [order, addresses]);

 const shipping = useMemo(() => {
  return order?.shippingAddress || (addrFromSaved ? {
   title: addrFromSaved.title,
   fullName: addrFromSaved.fullName,
   phone: addrFromSaved.phone,
   address: addrFromSaved.address,
   district: addrFromSaved.district,
   city: addrFromSaved.city,
  } : null);
 }, [order?.shippingAddress, addrFromSaved]);

 const billing = order?.billingAddress || shipping;

 const billingIsSame = useMemo(() => {
  if (!shipping || !billing) return true;
  const pick = (x) => ({
   title: x?.title || "",
   fullName: x?.fullName || "",
   phone: x?.phone || "",
   address: x?.address || "",
   district: x?.district || "",
   city: x?.city || "",
  });
  return JSON.stringify(pick(shipping)) === JSON.stringify(pick(billing));
 }, [shipping, billing]);

 const payment = order?.payment || null;
 const statusNorm = normalizeText(order?.status || "");
 const inferredPayment = statusNorm.includes("kapida") ? { type: "cash" } : null;
 const finalPayment = payment || inferredPayment;
 const paymentText = finalPayment?.type === "cash" ? "Kapıda Ödeme" : finalPayment?.type === "card" ? "Kart ile Ödeme" : (finalPayment?.type ? String(finalPayment.type) : "Bilinmiyor");

 const items = Array.isArray(order?.items) ? order.items : [];
 const groups = new Map();
 for (const it of items) {
  const name = it?.name || it?.productName || it?.title || "Ürün";
  const size = it?.size ? String(it.size) : "";
  const key = `${name}||${size}`;
  const qty = Number(it?.quantity || 1) || 1;
  const price = Number(it?.price || 0) || 0;
  const color = it?.color ? String(it.color).trim() : "";
  if (!groups.has(key)) {
   groups.set(key, { name, size, totalQty: 0, totalAmount: 0, colorCounts: new Map() });
  }
  const g = groups.get(key);
  g.totalQty += qty;
  g.totalAmount += price * qty;
  if (color) {
   g.colorCounts.set(color, (g.colorCounts.get(color) || 0) + qty);
  }
 }
 const grouped = Array.from(groups.values());

 const s = normalizeText(order?.status || "");
 const isCancelled = s.includes("iptal");
 const isShipped = s.includes("kargo") || s.includes("shipped") || s.includes("shipping");
 const isDelivered = s.includes("teslim") || s.includes("delivered") || s.includes("completed");
 const canCancel = !isCancelled && !isShipped && !isDelivered;
 // İade talebi var mı kontrolü (İptal Edildi durumu hariç, çünkü iptal edilen talepler tekrar iade edilemez)
 const returnRequestStatus = order?.returnRequest?.status;
 const hasReturnRequestCancelled = returnRequestStatus && normalizeText(returnRequestStatus).includes("iptal");
 const hasReturnRequest = Boolean(returnRequestStatus) && !hasReturnRequestCancelled;

 const withinReturnWindow = useMemo(() => {
  if (!isDelivered) return false;

  // Eğer iade talebi iptal edilmişse, tekrar iade edilemez
  if (hasReturnRequestCancelled) {
   return false;
  }

  const deliveredAtRaw = order?.deliveredAt || order?.updatedAt || order?.date;
  if (!deliveredAtRaw) return false;
  const deliveredAt = new Date(deliveredAtRaw);
  if (isNaN(deliveredAt.getTime())) return false;
  const diffMs = currentTime - deliveredAt.getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return diffMs <= sevenDaysMs;
 }, [isDelivered, hasReturnRequestCancelled, order?.deliveredAt, order?.updatedAt, order?.date, currentTime]);

 const canCancelReturnRequest = useMemo(() => {
  if (!hasReturnRequest || !order?.returnRequest) return false;

  const statusNorm = normalizeText(order.returnRequest.status);
  const isRequested = statusNorm.includes("talep");
  const isApproved = statusNorm.includes("onay");
  const isCancelled = statusNorm.includes("iptal");
  const isRejected = statusNorm.includes("red");
  const isCompleted = statusNorm.includes("tamam");

  // Sadece "Talep Edildi" durumundaki iade talepleri iptal edilebilir
  if (!isRequested || isApproved || isCancelled || isRejected || isCompleted) {
   return false;
  }

  // 2 gün kontrolü (talep tarihinden itibaren)
  const requestedAt = order.returnRequest.requestedAt ? new Date(order.returnRequest.requestedAt) : null;
  if (!requestedAt || isNaN(requestedAt.getTime())) return false;

  const diffMs = currentTime - requestedAt.getTime();
  const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
  return diffMs <= twoDaysMs;
 }, [hasReturnRequest, order, currentTime]);

 if (!show || !order) return null;

 return (
  <div
   className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
   onClick={onClose}
  >
   <div
    className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
    onClick={(e) => e.stopPropagation()}
   >
    <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
     <div>
      <h3 className="text-xl font-bold">Sipariş Detayları</h3>
      {order.orderId && (
       <p className="text-sm text-gray-500">Sipariş No: {order.orderId}</p>
      )}
     </div>
     <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition">
      <HiX size={24} />
     </button>
    </div>

    <div className="p-6 space-y-5">
     <div className="grid md:grid-cols-3 gap-4">
      <div className={`bg-gray-50 rounded-lg p-4 ${billingIsSame ? "md:col-span-2" : ""}`}>
       <p className="text-xs text-gray-500 mb-1">
        {billingIsSame ? "Teslimat Adresi, Fatura Adresi ve İletişim Bilgileri" : "Teslimat Adresi ve İletişim Bilgileri"}
       </p>
       {shipping ? (
        <div className="text-sm text-gray-800">
         <p className="font-semibold">{shipping.title || "Adres"}</p>
         <p>{shipping.fullName}</p>
         <p className="text-gray-600">{shipping.address}</p>
         <p className="text-gray-600">{shipping.district} / {shipping.city}</p>
         <p className="text-gray-600">{shipping.phone}</p>
         {billingIsSame ? (
          <p className="text-xs text-gray-400 mt-2">Fatura adresi teslimat adresi ile aynıdır.</p>
         ) : null}
        </div>
       ) : (
        <div className="text-sm text-gray-600">
         <p className="text-gray-500">Adres bilgisi bulunamadı.</p>
         {order.addressSummary && (
          <p className="text-xs text-gray-500 mt-2">{order.addressSummary}</p>
         )}
        </div>
       )}
      </div>

      {!billingIsSame && (
       <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-xs text-gray-500 mb-1">Fatura Adresi</p>
        {billing ? (
         <div className="text-sm text-gray-800">
          <p className="font-semibold">{billing.title || "Adres"}</p>
          <p>{billing.fullName}</p>
          <p className="text-gray-600">{billing.address}</p>
          <p className="text-gray-600">{billing.district} / {billing.city}</p>
          <p className="text-gray-600">{billing.phone}</p>
         </div>
        ) : (
         <div className="text-sm text-gray-600">
          <p className="text-gray-500">Adres bilgisi bulunamadı.</p>
          {order.addressSummary && (
           <p className="text-xs text-gray-500 mt-2">{order.addressSummary}</p>
          )}
         </div>
        )}
       </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
       <p className="text-xs text-gray-500 mb-1">Ödeme</p>
       <p className="font-semibold text-gray-900">{paymentText}</p>
       {payment?.type === "card" && payment?.cardId && (
        <p className="text-sm text-gray-600 mt-1">Kart: {String(payment.cardId).slice(-6)}</p>
       )}
      </div>
     </div>

     <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-gray-50 rounded-lg p-4">
       <p className="text-xs text-gray-500 mb-1">Durum</p>
       <p className="font-semibold text-gray-900">{formatOrderStatus(order.status)}</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
       <p className="text-xs text-gray-500 mb-1">Tarih ve Saat</p>
       <p className="font-semibold text-gray-900">
        {order.date ? new Date(order.date).toLocaleString("tr-TR") : "-"}
       </p>
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
       <p className="text-xs text-gray-500 mb-1">Toplam</p>
       <p className="font-semibold text-indigo-600">
        {Number(order.total || 0).toFixed(2)} ₺
       </p>
      </div>
     </div>

     <div>
      <h4 className="font-bold mb-3">Ürünler</h4>
      <div className="space-y-3">
       {grouped.map((g, idx) => {
        const colorsText = g.colorCounts.size
         ? Array.from(g.colorCounts.entries())
          .map(([c, q]) => (q > 1 ? `${c} (${q})` : c))
          .join(", ")
         : "";
        return (
         <div key={`${g.name}-${g.size}-${idx}`} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4">
          <div>
           <p className="font-semibold text-gray-900">{g.name}</p>
           <p className="text-sm text-gray-600">
            {g.size ? `Beden: ${g.size}` : ""}
            {g.size && colorsText ? " • " : ""}
            {colorsText ? `Renk: ${colorsText}` : ""}
           </p>
          </div>
          <div className="text-right">
           <p className="text-sm text-gray-600">Adet: {g.totalQty}</p>
           <p className="font-bold text-gray-900">{g.totalAmount.toFixed(2)} ₺</p>
          </div>
         </div>
        );
       })}
      </div>
     </div>
    </div>

    {!isCancelled && (
     <div className="flex items-center justify-between gap-3 px-6 py-4 border-t">
      {canCancel ? (
       <button
        onClick={() => onCancel(order.orderId)}
        className="ml-auto px-5 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition cursor-pointer"
       >
        Siparişi İptal Et
       </button>
      ) : isDelivered ? (
       hasReturnRequest ? (
        <div className="flex items-center justify-between gap-3 w-full">
         <span className="text-sm text-gray-600">
          İade Talebi: <span className="font-semibold">{order.returnRequest.status}</span>
          {normalizeText(order?.returnRequest?.status) === normalizeText("Talep Edildi.") ? (
           <span className="text-gray-500"> — Geri dönüşümüzü bekleyin.</span>
          ) : null}
         </span>
         {canCancelReturnRequest && onCancelReturn ? (
          <button
           onClick={() => onCancelReturn(order.orderId)}
           className="px-5 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition cursor-pointer whitespace-nowrap"
          >
           İade Talebini İptal Et
          </button>
         ) : null}
        </div>
       ) : hasReturnRequestCancelled ? (
        <span className="text-sm text-gray-500">Bu sipariş için iade talebi daha önce iptal edilmiş. Tekrar iade talebi oluşturulamaz.</span>
       ) : withinReturnWindow ? (
        <>
         <div className="text-sm text-gray-600">Sipariş teslim edildi. 7 gün içinde iade talebi oluşturabilirsiniz.</div>
         <button onClick={() => onReturn(order.orderId)} className="px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition cursor-pointer">
          İade Et
         </button>
        </>
       ) : (
        <span className="text-sm text-gray-500">İade süresi doldu. Ürün teslim edildikten sonra 7 gün içinde iade talebi oluşturabilirsiniz.</span>
       )
      ) : isShipped ? (
       <span className="text-sm text-gray-500">Sipariş kargoya verildi. Teslim edildikten sonra iade talebi oluşturabilirsiniz.</span>
      ) : (
       <span className="text-sm text-gray-500">Bu sipariş için işlem yapılamaz.</span>
      )}
     </div>
    )}
   </div>
  </div>
 );
}