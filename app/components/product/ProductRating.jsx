"use client";
import { FaStar } from "react-icons/fa";

export default function ProductRating({
 product,
 checkingRating,
 canRate,
 ratingSubmitted,
 hoverRating,
 userRating,
 onHoverRating,
 onRatingSubmit,
}) {
 const ratingsArr = Array.isArray(product?.ratings) ? product.ratings : [];
 const reviewCount = ratingsArr.length;
 const avgRatingRaw = reviewCount > 0
  ? (ratingsArr.reduce((sum, r) => sum + (Number(r?.rating) || 0), 0) / reviewCount)
  : 0;
 const avgRating = Math.round(avgRatingRaw * 10) / 10;

 return (
  <div className="mb-3 sm:mb-4">
   <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 flex-wrap">
    <div className="flex text-yellow-400">
     {[...Array(5)].map((_, i) => {
      const isFilled = i < Math.round(avgRating || 0);
      return (
       <svg
        key={i}
        className={`w-4 h-4 sm:w-5 sm:h-5 ${isFilled ? "fill-current" : "fill-transparent"}`}
        viewBox="0 0 20 20"
        style={!isFilled ? { stroke: "#d1d5db", strokeWidth: 1 } : {}}
       >
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
       </svg>
      );
     })}
    </div>
    <span className="text-xs sm:text-sm text-gray-600">
     {reviewCount > 0 ? `${avgRating.toFixed(1)} (${reviewCount} değerlendirme)` : "0.0 (0 değerlendirme)"}
    </span>
   </div>

   {!checkingRating && canRate && !ratingSubmitted && (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 sm:p-4">
     <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Bu ürüne puan verin:</p>
     <div
      className="flex items-center gap-1.5 sm:gap-2"
      onMouseLeave={() => onHoverRating(0)}
     >
      {[1, 2, 3, 4, 5].map((star) => (
       <button
        key={star}
        type="button"
        onMouseEnter={() => onHoverRating(star)}
        onClick={() => onRatingSubmit(star)}
        className={`transition-transform hover:scale-110 cursor-pointer ${(hoverRating || userRating) >= star
         ? "text-yellow-400"
         : "text-gray-300 hover:text-yellow-300"
         }`}
       >
        <FaStar size={20} className={`sm:w-6 sm:h-6 ${(hoverRating || userRating) >= star ? "fill-current" : ""}`} />
       </button>
      ))}
     </div>
    </div>
   )}
  </div>
 );
}
