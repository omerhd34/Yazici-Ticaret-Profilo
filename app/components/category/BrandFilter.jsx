"use client";

export default function BrandFilter({ availableBrands, selectedBrands, onBrandToggle, isMobile = false }) {
 if (availableBrands.length === 0) return null;

 return (
  <div className={isMobile ? "mb-6" : "mb-4 pb-4 border-b"}>
   <h4 className="font-semibold mb-4">Marka</h4>
   <div className={isMobile ? "space-y-2" : "space-y-2 max-h-48 overflow-y-auto"}>
    {availableBrands.map((brand) => (
     <label
      key={brand}
      className={`flex items-center gap-2 cursor-pointer ${isMobile ? "" : "hover:bg-gray-50 p-2 rounded"}`}
     >
      <input
       type="checkbox"
       checked={selectedBrands.includes(brand)}
       onChange={() => onBrandToggle(brand)}
       className="w-4 h-4"
      />
      <span className="text-sm">{brand}</span>
     </label>
    ))}
   </div>
  </div>
 );
}
