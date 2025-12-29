"use client";
import { useState } from "react";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";

export default function ScreenSizeFilter({ availableScreenSizes, selectedScreenSizes, onScreenSizeToggle, isMobile = false }) {
 const [isExpanded, setIsExpanded] = useState(false);

 if (!availableScreenSizes || availableScreenSizes.length === 0) return null;

 return (
  <div className={isMobile ? "mb-6" : "mb-4 pb-4 border-b"}>
   <div
    className="flex items-center justify-between mb-2 cursor-pointer"
    onClick={() => setIsExpanded(!isExpanded)}
   >
    <h4 className="font-semibold">Ekran Büyüklüğü</h4>
    {isExpanded ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
   </div>

   {isExpanded && (
    <div className="space-y-2">
     {availableScreenSizes.map((screenSize) => (
      <label
       key={screenSize}
       className={`flex items-center gap-2 cursor-pointer ${isMobile ? "" : "hover:bg-gray-50 p-2 rounded"}`}
      >
       <input
        type="checkbox"
        checked={selectedScreenSizes.includes(screenSize)}
        onChange={() => onScreenSizeToggle(screenSize)}
        className="w-4 h-4"
       />
       <span className="text-sm">{screenSize}</span>
      </label>
     ))}
    </div>
   )}
  </div>
 );
}

