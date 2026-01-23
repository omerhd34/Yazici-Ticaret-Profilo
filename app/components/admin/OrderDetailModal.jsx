"use client";
import { HiX } from "react-icons/hi";
import { useMemo } from "react";
import normalizeText from "@/lib/normalizeText";

export default function OrderDetailModal({ show, order, user, onClose, onCancel }) {
 const shipping = order?.shippingAddress || null;
 const billing = order?.billingAddress || shipping;
 const billingIsSame = useMemo(() => {
  const a = shipping;
  const b = billing;
  if (!a || !b) return true;
  const pick = (x) => ({
   title: x?.title || "",
   firstName: x?.firstName || "",
   lastName: x?.lastName || "",
   fullName: x?.fullName || (x?.firstName && x?.lastName ? `${x.firstName} ${x.lastName}` : ""),
   phone: x?.phone || "",
   address: x?.address || "",
   district: x?.district || "",
   city: x?.city || "",
  });
  return JSON.stringify(pick(a)) === JSON.stringify(pick(b));
 }, [shipping, billing]);

 if (!show) return null;

 const statusNorm = normalizeText(order?.status || "");
 const isCancelled = statusNorm.includes("iptal");
 const isDelivered = statusNorm.includes("teslim");
 const canCancel = !isCancelled && !isDelivered;

 return (
  <div
   className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
   onClick={onClose}
  >
   <div
    className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
    onClick={(e) => e.stopPropagation()}
   >
    <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
     <div>
      <h3 className="text-xl font-bold">Sipariş Detayı</h3>
      {order?.orderId ? (
       <p className="text-sm text-gray-500">Sipariş No: {order.orderId}</p>
      ) : null}
     </div>
     <div className="flex items-center gap-3">
      {canCancel && onCancel && (
       <button
        onClick={() => onCancel(order?.orderId)}
        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition cursor-pointer"
       >
        Siparişi İptal Et
       </button>
      )}
      <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition cursor-pointer">
       <HiX size={22} />
      </button>
     </div>
    </div>

    <div className="p-6 space-y-6">
     {/* Müşteri */}
     <div className="bg-gray-50 border rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
       <div>
        <div className="text-xs text-gray-500 font-semibold">Müşteri</div>
        <div className="text-lg font-bold text-gray-900">{user?.name || "-"}</div>
        <div className="text-sm text-gray-700 mt-1">{user?.email || "-"}</div>
        <div className="text-sm text-gray-700">{user?.phone || ""}</div>
       </div>
      </div>
     </div>

     {/* Sipariş özeti */}
     <div className="grid md:grid-cols-4 gap-4">
      <div className="bg-white border rounded-xl p-4">
       <div className="text-xs text-gray-500 mb-1">Durum</div>
       <div className="font-bold text-gray-900">{order?.status || "-"}</div>
      </div>
      <div className="bg-white border rounded-xl p-4">
       <div className="text-xs text-gray-500 mb-1">Tarih ve Saat</div>
       <div className="font-bold text-gray-900">
        {order?.date ? new Date(order.date).toLocaleString("tr-TR") : "-"}
       </div>
      </div>
      <div className="bg-white border rounded-xl p-4">
       <div className="text-xs text-gray-500 mb-1">Ödeme</div>
       <div className="font-bold text-gray-900">
        Kart ile Ödeme (3D Secure)
       </div>
      </div>
      <div className="bg-white border rounded-xl p-4">
       <div className="text-xs text-gray-500 mb-1">Toplam</div>
       <div className="font-black text-indigo-600">{Number(order?.total || 0).toFixed(2)} ₺</div>
      </div>
     </div>

     {/* Adres */}
     <div className="grid md:grid-cols-2 gap-4">
      <div className={`bg-gray-50 border rounded-xl p-4 ${billingIsSame ? "md:col-span-2" : ""}`}>
       <div className="text-xs text-gray-500 mb-1">{billingIsSame ? "Teslimat Adresi, Fatura Adresi ve İletişim Bilgileri" : "Teslimat Adresi ve İletişim Bilgileri"}</div>
       {shipping ? (
        <div className="text-sm text-gray-800">
         <div className="font-semibold">{shipping.title || "Adres"}</div>
         <div>{shipping.firstName && shipping.lastName ? `${shipping.firstName} ${shipping.lastName}` : shipping.fullName || ''}</div>
         <div className="text-gray-600">{shipping.address}</div>
         <div className="text-gray-600">{shipping.district} / {shipping.city}</div>
         <div className="text-gray-600">{shipping.phone}</div>
         {billingIsSame ? <div className="text-xs text-gray-400 mt-2">Fatura adresi teslimat adresi ile aynıdır.</div> : null}
        </div>
       ) : (
        <div className="text-sm text-gray-600">
         <div>Adres bilgisi bulunamadı.</div>
         {order?.addressSummary ? <div className="text-xs text-gray-500 mt-2">{order.addressSummary}</div> : null}
        </div>
       )}
      </div>

      {!billingIsSame && (
       <div className="bg-gray-50 border rounded-xl p-4">
        <div className="text-xs text-gray-500 mb-1">Fatura Adresi</div>
        {billing ? (
         <div className="text-sm text-gray-800">
          <div className="font-semibold">{billing.title || "Adres"}</div>
          <div>{billing.firstName && billing.lastName ? `${billing.firstName} ${billing.lastName}` : billing.fullName || ''}</div>
          <div className="text-gray-600">{billing.address}</div>
          <div className="text-gray-600">{billing.district} / {billing.city}</div>
          <div className="text-gray-600">{billing.phone}</div>
         </div>
        ) : (
         <div className="text-sm text-gray-600">
          <div>Adres bilgisi bulunamadı.</div>
          {order?.addressSummary ? <div className="text-xs text-gray-500 mt-2">{order.addressSummary}</div> : null}
         </div>
        )}
       </div>
      )}
     </div>

     {/* İade Bilgisi */}
     {order?.returnRequest?.status || order?.returnRequest?.note ? (
      <div className="grid md:grid-cols-2 gap-4">
       {order?.returnRequest?.note ? (
        <div className="bg-white border rounded-xl p-4">
         <div className="text-xs text-gray-500 mb-1">İade Nedeni</div>
         <div className="font-bold text-gray-900">{order.returnRequest.note}</div>
        </div>
       ) : null}
       {order?.returnRequest?.status ? (
        <div className="bg-white border rounded-xl p-4">
         <div className="text-xs text-gray-500 mb-1">İade Durumu</div>
         <div className="font-bold text-gray-900">{order.returnRequest.status}</div>
        </div>
       ) : null}
      </div>
     ) : null}

     {/* Ürünler */}
     <div>
      <div className="text-sm font-bold text-gray-900 mb-3">Sipariş Ürünleri</div>
      <div className="space-y-3">
       {(() => {
        const items = Array.isArray(order?.items) ? order.items : [];

        const groups = new Map();
        for (const it of items) {
         const name = it?.name || it?.productName || it?.title || "Ürün";
         const key = `${name}`;

         const qty = Number(it?.quantity || 1) || 1;
         const price = Number(it?.price || 0) || 0;
         const color = it?.color ? String(it.color).trim() : "";
         const serialNumber = it?.serialNumber ? String(it.serialNumber).trim() : "";

         if (!groups.has(key)) {
          groups.set(key, {
           name,
           totalQty: 0,
           totalAmount: 0,
           colorCounts: new Map(),
           serialNumber: serialNumber || "",
          });
         }
         const g = groups.get(key);
         g.totalQty += qty;
         g.totalAmount += price * qty;
         if (color) {
          g.colorCounts.set(color, (g.colorCounts.get(color) || 0) + qty);
         }
         if (serialNumber && !g.serialNumber) {
          g.serialNumber = serialNumber;
         }
        }

        const grouped = Array.from(groups.values());
        return grouped.map((g, idx) => {
         const colorsText = g.colorCounts.size
          ? Array.from(g.colorCounts.entries())
           .map(([c, q]) => (q > 1 ? `${c} (${q})` : c))
           .join(", ")
          : "";

         return (
          <div key={`${g.name}-${idx}`} className="border rounded-xl p-4 flex items-center justify-between gap-4">
           <div>
            <div className="font-semibold text-gray-900">{g.name}</div>
            <div className="text-sm text-gray-600">
             {g.serialNumber && (
              <span>
               <span className="font-bold">Seri No:</span> <span className="font-mono">{g.serialNumber}</span>
              </span>
             )}
            </div>
           </div>
           <div className="text-right">
            <div className="text-sm text-gray-600">Adet: {g.totalQty}</div>
            <div className="font-bold text-gray-900">{g.totalAmount.toFixed(2)} ₺</div>
           </div>
          </div>
         );
        });
       })()}
      </div>
     </div>
    </div>
   </div>
  </div>
 );
}
