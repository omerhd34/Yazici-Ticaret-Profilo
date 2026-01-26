"use client";
import { HiSparkles, HiTag, HiStar } from "react-icons/hi";

export default function SpecialProductsFilter({ selectedFilters = [], onFilterToggle }) {
 const filters = [
  { id: "new", label: "Yeni Ürünler", icon: HiSparkles, color: "text-green-600" },
  { id: "discounted", label: "İndirimli Ürünler", icon: HiTag, color: "text-red-600" },
  { id: "featured", label: "Öne Çıkan Ürünler", icon: HiStar, color: "text-yellow-600" },
 ];

 return (
  <div className="mb-4 pb-4 border-b">
   <h4 className="font-semibold mb-3">Özel Ürünler</h4>
   <div className="space-y-2">
    {filters.map((filter) => {
     const Icon = filter.icon;
     const isSelected = selectedFilters.includes(filter.id);

     return (
      <label
       key={filter.id}
       className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
      >
       <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onFilterToggle(filter.id)}
        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
       />
       <Icon className={`w-4 h-4 ${filter.color}`} />
       <span className="text-sm text-gray-700">{filter.label}</span>
      </label>
     );
    })}
   </div>
  </div>
 );
}
