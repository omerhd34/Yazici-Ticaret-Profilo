"use client";
import Link from "next/link";

/**
 * @param {Array} recentOrders - Son siparişler listesi
 * @param {boolean} loading - Yükleme durumu
 */
export default function RecentOrdersTable({ recentOrders, loading }) {
 return (
  <div className="bg-white rounded-xl border p-5">
   <div className="flex items-center justify-between gap-3">
    <div className="text-sm font-bold text-gray-900">Son 5 Sipariş</div>
    <Link href="/admin/son-siparisler" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
     Yönet →
    </Link>
   </div>

   {loading ? (
    <div className="text-sm text-gray-500 mt-4">Yükleniyor…</div>
   ) : recentOrders.length === 0 ? (
    <div className="text-sm text-gray-500 mt-4">Henüz sipariş yok.</div>
   ) : (
    <div className="mt-4 overflow-x-auto border rounded-lg">
     <table className="w-full text-sm">
      <thead className="bg-gray-50">
       <tr>
        <th className="px-4 py-3 text-left font-semibold text-gray-600">Sipariş</th>
        <th className="px-4 py-3 text-left font-semibold text-gray-600">Müşteri</th>
        <th className="px-4 py-3 text-left font-semibold text-gray-600">Durum</th>
        <th className="px-4 py-3 text-right font-semibold text-gray-600">Tutar (₺)</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
       {recentOrders.map((row, idx) => {
        const o = row.order || {};
        const u = row.user || {};
        return (
         <tr key={idx} className="hover:bg-gray-50">
          <td className="px-4 py-3 font-semibold">
           {o.orderId ? (
            <Link href="/admin/son-siparisler" className="text-indigo-600 hover:text-indigo-800">
             {o.orderId}
            </Link>
           ) : (
            <span className="text-gray-400">-</span>
           )}
          </td>
          <td className="px-4 py-3">
           <div className="font-semibold">{u.name || "-"}</div>
           <div className="text-xs text-gray-500">{u.email || ""}</div>
          </td>
          <td className="px-4 py-3">{(o.status || "-").toString()}</td>
          <td className="px-4 py-3 text-right font-bold text-indigo-600">{Number(o.total || 0).toFixed(2)}</td>
         </tr>
        );
       })}
      </tbody>
     </table>
    </div>
   )}
  </div>
 );
}
