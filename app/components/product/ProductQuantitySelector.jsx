"use client";

export default function ProductQuantitySelector({ quantity, stock, onQuantityChange }) {
 const maxQuantity = Math.min(stock, 10);

 return (
  <div className="mb-4 sm:mb-5 md:mb-6">
   <h3 className="font-bold text-xs sm:text-sm mb-2 sm:mb-3">Adet</h3>
   <div className="flex items-center border-2 border-gray-200 rounded-lg w-fit">
    <button
     onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
     className="px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-100 transition cursor-pointer text-base sm:text-lg"
    >
     -
    </button>
    <span className="px-4 sm:px-6 font-bold text-sm sm:text-base">{quantity}</span>
    <button
     onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
     className="px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-100 transition cursor-pointer disabled:cursor-not-allowed text-base sm:text-lg"
     disabled={quantity >= maxQuantity}
    >
     +
    </button>
   </div>
  </div>
 );
}
