"use client";
import { FaShoppingCart } from "react-icons/fa";
import { HiHeart, HiSwitchHorizontal } from "react-icons/hi";

export default function ProductActions({
 productId,
 stock,
 addedToCart,
 isFavorite,
 isInComparison,
 onAddToCart,
 onFavoriteToggle,
 onComparisonToggle,
}) {
 return (
  <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8">
   <button
    onClick={onAddToCart}
    disabled={stock === 0}
    className={`flex-1 py-3 sm:py-4 rounded-lg font-bold text-sm sm:text-base md:text-lg transition flex items-center justify-center gap-2 ${addedToCart
     ? "bg-green-600 text-white cursor-pointer"
     : stock > 0
      ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"
     }`}
   >
    <FaShoppingCart size={20} className="sm:w-6 sm:h-6" />
    <span className="hidden sm:inline">{addedToCart ? "Sepete Eklendi!" : "Sepete Ekle"}</span>
   </button>
   <button
    onClick={onComparisonToggle}
    className={`p-3 sm:p-4 rounded-lg border-2 transition cursor-pointer ${isInComparison
     ? "border-green-700 bg-green-700 text-white"
     : "border-gray-300 bg-white text-gray-500 hover:border-green-400 hover:bg-indigo-50 hover:text-green-400"
     }`}
    title={isInComparison ? "Karşılaştırmadan Çıkar" : "Karşılaştırmaya Ekle"}
   >
    <HiSwitchHorizontal size={20} className="sm:w-6 sm:h-6" />
   </button>
   <button
    onClick={onFavoriteToggle}
    className={`p-3 sm:p-4 rounded-lg border-2 transition cursor-pointer ${isFavorite
     ? "border-red-600 bg-red-600 text-white"
     : "border-gray-300 bg-white text-gray-500 hover:border-red-500 hover:bg-red-50 hover:text-red-500"
     }`}
    title={isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
   >
    <HiHeart size={20} className={`sm:w-6 sm:h-6 ${isFavorite ? "fill-current" : ""}`} />
   </button>
  </div>
 );
}
