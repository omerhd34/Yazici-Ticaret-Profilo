"use client";

export default function ProductPrice({ displayPrice, hasDiscount, originalPrice }) {
 return (
  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6 flex-wrap">
   <span className="text-2xl sm:text-3xl md:text-4xl font-black text-indigo-600">
    {displayPrice.toFixed(2)} ₺
   </span>
   {hasDiscount && (
    <span className="text-base sm:text-lg md:text-xl text-gray-400 line-through">
     {originalPrice.toFixed(2)} ₺
    </span>
   )}
  </div>
 );
}
