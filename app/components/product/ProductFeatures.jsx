"use client";
import { MdLocalShipping, MdSecurity, MdRefresh } from "react-icons/md";

export default function ProductFeatures() {
 return (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-6 sm:pt-8 md:pt-10 border-t">
   <div className="flex items-center gap-2 sm:gap-3">
    <div className="bg-indigo-100 p-2 sm:p-3 rounded-lg shrink-0">
     <MdLocalShipping className="text-indigo-600" size={20} />
    </div>
    <div>
     <p className="font-semibold text-xs sm:text-sm">Hızlı Kargo</p>
     <p className="text-xs text-gray-500">1-5 iş günü</p>
    </div>
   </div>

   <div className="flex items-center gap-2 sm:gap-3">
    <div className="bg-green-100 p-2 sm:p-3 rounded-lg shrink-0">
     <MdRefresh className="text-green-600" size={20} />
    </div>
    <div>
     <p className="font-semibold text-xs sm:text-sm">Kolay İade</p>
     <p className="text-xs text-gray-500">14 gün içinde</p>
    </div>
   </div>

   <div className="flex items-center gap-2 sm:gap-3">
    <div className="bg-purple-100 p-2 sm:p-3 rounded-lg shrink-0">
     <MdSecurity className="text-purple-600" size={20} />
    </div>
    <div>
     <p className="font-semibold text-xs sm:text-sm">Güvenli Ödeme</p>
     <p className="text-xs text-gray-500">%100 güvenli</p>
    </div>
   </div>
  </div>
 );
}
