"use client";
import { getColorHex } from "@/app/utils/colorUtils";

export default function ProductColorSelector({ colors, selectedColor, onColorSelect }) {
 if (!colors || colors.length === 0) return null;

 return (
  <div className="mb-4 sm:mb-5 md:mb-6">
   <h3 className="font-bold text-xs sm:text-sm mb-2 sm:mb-3">Renk</h3>
   <div className="flex gap-2 sm:gap-3 flex-wrap">
    {colors.map((color, idx) => (
     <button
      key={idx}
      onClick={() => onColorSelect(color.name)}
      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition cursor-pointer ${selectedColor === color.name
       ? "border-indigo-600 scale-110"
       : "border-gray-200 hover:border-gray-300"
       }`}
      style={{ backgroundColor: getColorHex(color) }}
      title={color.name}
     />
    ))}
   </div>
   {selectedColor && (
    <div className="text-xs text-gray-600 mt-1.5 sm:mt-2">
     Seçilen: <span className="font-semibold">{selectedColor}</span>
    </div>
   )}
  </div>
 );
}
