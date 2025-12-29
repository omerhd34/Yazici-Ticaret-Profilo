"use client";
import { useState } from "react";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";

export default function CoolingCapacityFilter({ availableCoolingCapacities, selectedCoolingCapacities, onCoolingCapacityToggle, isMobile = false }) {
 const [isExpanded, setIsExpanded] = useState(false);

 if (!availableCoolingCapacities || availableCoolingCapacities.length === 0) return null;

 return (
  <div className={isMobile ? "mb-6" : "mb-4 pb-4 border-b"}>
   <div
    className="flex items-center justify-between mb-2 cursor-pointer"
    onClick={() => setIsExpanded(!isExpanded)}
   >
    <h4 className="font-semibold">Soğutma Kapasitesi (BTU/h)</h4>
    {isExpanded ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
   </div>

   {isExpanded && (
    <div className="space-y-2">
     {availableCoolingCapacities.map((capacity) => (
      <label
       key={capacity}
       className={`flex items-center gap-2 cursor-pointer ${isMobile ? "" : "hover:bg-gray-50 p-2 rounded"}`}
      >
       <input
        type="checkbox"
        checked={selectedCoolingCapacities.includes(capacity)}
        onChange={() => onCoolingCapacityToggle(capacity)}
        className="w-4 h-4"
       />
       <span className="text-sm">{capacity}</span>
      </label>
     ))}
    </div>
   )}
  </div>
 );
}

