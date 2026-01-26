/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useState, useLayoutEffect, useRef, useMemo } from "react";
import { HiSearch, HiChevronUp, HiChevronDown } from "react-icons/hi";

const PRICE_RANGES = [
 { label: "0 - 14999 TL", min: 0, max: 14999 },
 { label: "15000 - 24999 TL", min: 15000, max: 24999 },
 { label: "25000 - 39999 TL", min: 25000, max: 39999 },
 { label: "40000 - 59999 TL", min: 40000, max: 59999 },
 { label: "60000 - 79999 TL", min: 60000, max: 79999 },
 { label: "80000 TL üzerinde", min: 80000, max: null },
];

const SMALL_PRICE_RANGES = [
 { label: "0 - 4999 TL", min: 0, max: 4999 },
 { label: "5000 - 9999 TL", min: 5000, max: 9999 },
 { label: "10000 - 14999 TL", min: 10000, max: 14999 },
 { label: "15000 TL üzerinde", min: 15000, max: null },
];

export default function PriceFilter({ minPrice, maxPrice, onMinPriceChange, onMaxPriceChange, isMobile = false, slug = [] }) {
 const [isExpanded, setIsExpanded] = useState(false);
 const [localMinPrice, setLocalMinPrice] = useState(minPrice || "");
 const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice || "");
 const [selectedRange, setSelectedRange] = useState(null);
 const isInternalUpdate = useRef(false);
 const prevMinPrice = useRef(minPrice);
 const prevMaxPrice = useRef(maxPrice);

 const isSmall = useMemo(() => {
  if (!slug || slug.length === 0) return false;
  const categorySlug = Array.isArray(slug) ? slug[0] : slug;
  const slugLower = categorySlug?.toLowerCase() || "";
  return slugLower.includes("elektrikli-supurge") || slugLower.includes("su-sebili") ||
   slugLower.includes("su-aritma") || slugLower.includes("kahve");
 }, [slug]);
 
 const priceRanges = isSmall ? SMALL_PRICE_RANGES : PRICE_RANGES;

 const computedSelectedRange = useMemo(() => {
  if (minPrice) {
   const matchingRange = priceRanges.find((range) => {
    const minMatch = range.min.toString() === minPrice;
    if (range.max === null) {
     return minMatch && (!maxPrice || maxPrice === "");
    } else {
     return minMatch && range.max.toString() === maxPrice;
    }
   });
   return matchingRange ? matchingRange.label : null;
  }
  return null;
 }, [minPrice, maxPrice, priceRanges]);

 useLayoutEffect(() => {
  if (isInternalUpdate.current) {
   isInternalUpdate.current = false;
   prevMinPrice.current = minPrice;
   prevMaxPrice.current = maxPrice;
   return;
  }
  if (prevMinPrice.current !== minPrice || prevMaxPrice.current !== maxPrice) {
   setLocalMinPrice(minPrice || "");
   setLocalMaxPrice(maxPrice || "");
   setSelectedRange(computedSelectedRange);
   prevMinPrice.current = minPrice;
   prevMaxPrice.current = maxPrice;
  }
 }, [minPrice, maxPrice, computedSelectedRange]);

 const handleApplyFilter = () => {
  onMinPriceChange(localMinPrice);
  onMaxPriceChange(localMaxPrice);
  setSelectedRange(null);
 };

 const handleRangeSelect = (range) => {
  const minValue = range.min.toString();
  const maxValue = range.max !== null && range.max !== undefined ? range.max.toString() : "";

  const isCurrentlySelected = minPrice === minValue &&
   ((range.max === null && (!maxPrice || maxPrice === "")) || maxPrice === maxValue);

  if (isCurrentlySelected) {
   isInternalUpdate.current = true;
   setSelectedRange(null);
   setLocalMinPrice("");
   setLocalMaxPrice("");
   onMinPriceChange("");
   onMaxPriceChange("");
   return;
  }
  isInternalUpdate.current = true;
  setSelectedRange(range.label);
  setLocalMinPrice(minValue);
  setLocalMaxPrice(maxValue);
  onMinPriceChange(minValue);
  onMaxPriceChange(maxValue);
 };

 return (
  <div className={isMobile ? "mb-6" : "mb-4 pb-4 border-b"}>
   <div
    className="flex items-center justify-between mb-2 cursor-pointer"
    onClick={() => setIsExpanded(!isExpanded)}
   >
    <h4 className="font-semibold">Fiyat Aralığı</h4>
    {isExpanded ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
   </div>

   {isExpanded && (
    <>
     <div className="flex gap-2 mb-4">
      <div className="flex-1">
       <input
        type="number"
        placeholder="En az"
        value={localMinPrice}
        onChange={(e) => setLocalMinPrice(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
       />
      </div>
      <div className="flex-1">
       <input
        type="number"
        placeholder="En çok"
        value={localMaxPrice}
        onChange={(e) => setLocalMaxPrice(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
       />
      </div>
      <div className="flex items-end">
       <button
        onClick={handleApplyFilter}
        className="h-[42px] w-[42px] flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
        title="Filtrele"
       >
        <HiSearch size={20} className="text-gray-600" />
       </button>
      </div>
     </div>

     <div className="space-y-2">
      {priceRanges.map((range) => (
       <label
        key={range.label}
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
        onClick={(e) => {
         e.preventDefault();
         handleRangeSelect(range);
        }}
       >
        <input
         type="radio"
         name="priceRange"
         checked={selectedRange === range.label}
         readOnly
         className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer pointer-events-none"
        />
        <span className="text-sm text-gray-700">{range.label}</span>
       </label>
      ))}
     </div>
    </>
   )}
  </div>
 );
}
