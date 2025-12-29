"use client";

export default function BagTypeFilter({ selectedBagTypes, onBagTypeToggle, isMobile = false }) {
 const bagTypes = [
  { value: "torbalı", label: "Toz torbalı" },
  { value: "torbasız", label: "Toz torbasız" }
 ];

 return (
  <div className={isMobile ? "" : "mb-6"}>
   <h4 className="font-semibold mb-4">Filtreleme sistemi</h4>
   <div className={isMobile ? "space-y-2" : "space-y-2"}>
    {bagTypes.map((bagType) => (
     <label
      key={bagType.value}
      className={`flex items-center gap-2 cursor-pointer ${isMobile ? "" : "hover:bg-gray-50 p-2 rounded"}`}
     >
      <input
       type="checkbox"
       checked={selectedBagTypes.includes(bagType.value)}
       onChange={() => onBagTypeToggle(bagType.value)}
       className="w-4 h-4"
      />
      <span className="text-sm">{bagType.label}</span>
     </label>
    ))}
   </div>
  </div>
 );
}

