"use client";
import normalizeText from "@/lib/normalizeText";
import StatusDropdown from "./StatusDropdown";
import ReturnStatusDropdown from "./ReturnStatusDropdown";

/**
 * Active Orders Table Component
 * 
 * @param {Array} orders - Aktif siparişler listesi
 * @param {function} getRowBgClass - Satır arka plan rengi fonksiyonu
 * @param {function} onStatusChange - Durum değiştiğinde callback
 * @param {function} onReturnStatusChange - İade durumu değiştiğinde callback
 * @param {function} onDetailClick - Detay butonuna tıklandığında callback
 * @param {string} updatingOrderId - Güncellenen sipariş ID'si
 * @param {string} updatingReturnOrderId - Güncellenen iade sipariş ID'si
 * @param {function} onRefresh - Yenile butonuna tıklandığında callback
 */
export default function ActiveOrdersTable({
 orders,
 getRowBgClass,
 onStatusChange,
 onReturnStatusChange,
 onDetailClick,
 updatingOrderId,
 updatingReturnOrderId,
 onRefresh,
}) {
 if (orders.length === 0) {
  return (
   <div className="bg-white rounded-xl shadow-md p-6">
    <div className="flex items-center justify-between mb-4">
     <h2 className="text-xl font-bold">Son Siparişler</h2>
     <button onClick={onRefresh} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
      Yenile
     </button>
    </div>
    <div className="text-sm text-gray-500">Henüz sipariş yok.</div>
   </div>
  );
 }

 return (
  <div className="bg-white rounded-xl shadow-md p-6">
   <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-bold">Son Siparişler</h2>
    <button onClick={onRefresh} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
     Yenile
    </button>
   </div>

   <div className="overflow-x-auto border rounded-lg">
    <table className="w-full text-sm table-fixed">
     <colgroup>
      <col style={{ width: "22%" }} />
      <col style={{ width: "22%" }} />
      <col style={{ width: "18%" }} />
      <col style={{ width: "22%" }} />
      <col style={{ width: "10%" }} />
      <col style={{ width: "6%" }} />
     </colgroup>
     <thead className="bg-gray-50">
      <tr>
       <th className="px-4 py-3 text-left font-semibold text-gray-600">Sipariş No</th>
       <th className="px-4 py-3 text-left font-semibold text-gray-600">Müşteri</th>
       <th className="px-4 py-3 text-left font-semibold text-gray-600">Tarih</th>
       <th className="px-4 py-3 text-left font-semibold text-gray-600">Durum</th>
       <th className="pl-4 pr-16 py-3 text-right font-semibold text-gray-600">Tutar (₺)</th>
       <th className="px-4 py-3 text-right font-semibold text-gray-600">İşlem</th>
      </tr>
     </thead>
     <tbody className="divide-y divide-gray-200">
      {orders.map((row, idx) => {
       const o = row.order || {};
       const u = row.user || {};
       const d = o.date ? new Date(o.date) : null;
       const dateText = d ? d.toLocaleString("tr-TR") : "-";
       const rawStatus = (o.status || "").replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
       const statusNorm = normalizeText(rawStatus);
       const isCancelled = statusNorm.includes("iptal");
       const rrStatus = String(o?.returnRequest?.status || "").trim();
       const hasReturnRequest = Boolean(rrStatus);
       const isReturnRequested = normalizeText(rrStatus) === normalizeText("Talep Edildi");
       return (
        <tr key={idx} className={getRowBgClass(o)}>
         <td className="px-4 py-3 font-semibold">{o.orderId || "-"}</td>
         <td className="px-4 py-3">
          <div className="font-semibold">{u.name || "-"}</div>
          <div className="text-xs text-gray-500">{u.email || ""}</div>
         </td>
         <td className="px-4 py-3">{dateText}</td>
         <td className="px-4 py-3">
          {hasReturnRequest ? (
           <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white border border-gray-900">
             İade: {rrStatus}
            </span>
            {isReturnRequested ? (
             <ReturnStatusDropdown
              value={rrStatus}
              onChange={(e) => onReturnStatusChange(o.orderId, e.target.value)}
              disabled={!o.orderId || updatingReturnOrderId === o.orderId}
             />
            ) : null}
           </div>
          ) : isCancelled ? (
           <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white border border-gray-900">
            İptal Edildi
           </span>
          ) : (
           <StatusDropdown
            value={rawStatus}
            onChange={(e) => onStatusChange(o.orderId, e.target.value)}
            disabled={!o.orderId || updatingOrderId === o.orderId}
           />
          )}
          {updatingOrderId === o.orderId ? (
           <div className="text-xs text-gray-500 mt-1">Güncelleniyor...</div>
          ) : updatingReturnOrderId === o.orderId ? (
           <div className="text-xs text-gray-500 mt-1">İade güncelleniyor...</div>
          ) : null}
         </td>
         <td className="pl-4 pr-16 py-3 text-right font-bold text-indigo-600">
          {Number(o.total || 0).toFixed(2)}
         </td>
         <td className="px-4 py-3 text-right">
          <button
           type="button"
           onClick={() => onDetailClick(row)}
           disabled={!o.orderId}
           className={`px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition ${!o.orderId ? "opacity-50 cursor-not-allowed" : ""}`}
          >
           Detay
          </button>
         </td>
        </tr>
       );
      })}
     </tbody>
    </table>
   </div>
  </div>
 );
}
