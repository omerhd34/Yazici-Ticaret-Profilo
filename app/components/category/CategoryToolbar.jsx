"use client";
import { HiAdjustments, HiChevronDown } from "react-icons/hi";

export default function CategoryToolbar({ sortBy, onSortChange, onFiltersClick, slug = [] }) {
 // Kategori slug'ını kontrol et
 const categorySlug = slug.length > 0 ? decodeURIComponent(slug[0]) : "";
 const isYenilerPage = categorySlug === "yeni" || categorySlug === "yeniler";
 const isIndirimPage = categorySlug === "indirim";

 return (
  <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 flex justify-between items-center flex-wrap gap-3 sm:gap-4">
   <button
    onClick={onFiltersClick}
    className="lg:hidden flex items-center gap-2 bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-semibold cursor-pointer"
   >
    <HiAdjustments size={18} />
    <span className="hidden sm:inline">Filtreler</span>
   </button>

   <div className="flex items-center gap-2">
    <span className="text-xs sm:text-sm text-gray-600 font-medium">Sırala:</span>
    <div className="relative inline-flex items-center">
     <select
      value={sortBy}
      onChange={(e) => onSortChange(e.target.value)}
      className="appearance-none border border-gray-300 rounded-lg pl-3 sm:pl-4 pr-8 sm:pr-10 py-1.5 sm:py-2 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
     >
      <option value="-createdAt">Önerilen</option>
      {!isYenilerPage && !isIndirimPage && <option value="filter:new">Yeni Ürünler</option>}
      {!isIndirimPage && !isYenilerPage && <option value="filter:discounted">İndirimli Ürünler</option>}
      <option value="filter:featured">Öne Çıkan Ürünler</option>
      <option value="price">Fiyat: Düşükten Yükseğe</option>
      <option value="-price">Fiyat: Yüksekten Düşüğe</option>
      <option value="-rating">En Yüksek Puan</option>
      <option value="-soldCount">En Çok Satan</option>
     </select>
     <span className="pointer-events-none absolute right-3 inline-flex items-center justify-center text-gray-700">
      <HiChevronDown size={18} aria-hidden="true" />
     </span>
    </div>
   </div>
  </div >
 );
}
