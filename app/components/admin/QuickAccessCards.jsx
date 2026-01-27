"use client";
import Link from "next/link";
import { MdReceiptLong, MdInventory2, MdEmail } from "react-icons/md";
import { HiShoppingBag } from "react-icons/hi";

export default function QuickAccessCards() {
 return (
  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
   <Link
    href="/admin/son-siparisler"
    className="group border rounded-xl p-6 hover:border-indigo-300 hover:bg-indigo-50 transition"
   >
    <div className="flex items-center justify-between gap-5">
     <div>
      <div className="text-xs font-semibold text-gray-500">Siparişler</div>
      <div className="text-lg font-black text-gray-900 mt-1">Son Siparişler</div>
      <div className="text-sm text-gray-600 mt-1">Durum yönetimi ve sipariş listesi</div>
     </div>
     <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center group-hover:bg-indigo-700 transition">
      <MdReceiptLong size={22} />
     </div>
    </div>
   </Link>

   <Link
    href="/admin/urun-yonetimi"
    className="group border rounded-xl p-6 hover:border-indigo-300 hover:bg-indigo-50 transition"
   >
    <div className="flex items-center justify-between gap-5">
     <div>
      <div className="text-xs font-semibold text-gray-500">Katalog</div>
      <div className="text-lg font-black text-gray-900 mt-1">Ürün Yönetimi</div>
      <div className="text-sm text-gray-600 mt-1">Ürün ekle/düzenle, stok takibi</div>
     </div>
     <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center group-hover:bg-indigo-700 transition">
      <MdInventory2 size={22} />
     </div>
    </div>
   </Link>

   <Link
    href="/admin/mesajlar"
    className="group border rounded-xl p-6 hover:border-indigo-300 hover:bg-indigo-50 transition"
   >
    <div className="flex items-center justify-between gap-5">
     <div>
      <div className="text-xs font-semibold text-gray-500">İletişim</div>
      <div className="text-lg font-black text-gray-900 mt-1">Mesajlar</div>
      <div className="text-sm text-gray-600 mt-1">İletişim formu mesajları</div>
     </div>
     <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center group-hover:bg-indigo-700 transition">
      <MdEmail size={22} />
     </div>
    </div>
   </Link>

   <Link
    href="/admin/urun-istekleri"
    className="group border rounded-xl p-6 hover:border-indigo-300 hover:bg-indigo-50 transition"
   >
    <div className="flex items-center justify-between gap-5">
     <div>
      <div className="text-xs font-semibold text-gray-500">Ürün</div>
      <div className="text-lg font-black text-gray-900 mt-1">Ürün İstekleri</div>
      <div className="text-sm text-gray-600 mt-1">Müşteri ürün istekleri</div>
     </div>
     <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center group-hover:bg-indigo-700 transition">
      <HiShoppingBag size={22} />
     </div>
    </div>
   </Link>

  </div>
 );
}
