"use client";
import Link from "next/link";

export default function ProductNotFound() {
 return (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
   <div className="text-center">
    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Ürün Bulunamadı</h2>
    <Link
     href="/kategori"
     className="text-sm sm:text-base text-indigo-600 hover:text-indigo-800 font-semibold"
    >
     Alışverişe Devam Et
    </Link>
   </div>
  </div>
 );
}
