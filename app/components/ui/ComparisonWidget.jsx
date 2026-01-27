"use client";
import { useState, useEffect } from "react";
import { useComparison } from "@/context/ComparisonContext";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { HiX, HiSwitchHorizontal, HiChevronUp } from "react-icons/hi";
import { getProductUrl } from "@/app/utils/productUrl";

export default function ComparisonWidget() {
 const { comparisonItems, removeFromComparison, clearComparison } = useComparison();
 const router = useRouter();
 const pathname = usePathname();
 const [isExpanded, setIsExpanded] = useState(false);
 const [mounted, setMounted] = useState(false);
 const [isModalOpen, setIsModalOpen] = useState(false);

 // Client-side mount kontrolü (hydration hatasını önlemek için)
 useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setMounted(true);
 }, []);

 // Modal açık mı kontrol et
 useEffect(() => {
  if (!mounted) return;

  const checkModal = () => {
   // Modal overlay'i kontrol et (fixed inset-0 z-50 class'ına sahip element)
   const modalOverlay = document.querySelector('.fixed.inset-0.z-50.bg-black');
   setIsModalOpen(!!modalOverlay);
  };

  // İlk kontrol
  checkModal();

  // MutationObserver ile DOM değişikliklerini izle
  const observer = new MutationObserver(checkModal);
  observer.observe(document.body, {
   childList: true,
   subtree: true,
   attributes: true,
   attributeFilter: ['class'],
  });

  return () => observer.disconnect();
 }, [mounted]);

 // Client-side render kontrolü
 if (!mounted) {
  return null;
 }

 // Modal açıkken widget'ı gizle
 if (isModalOpen) {
  return null;
 }

 // Admin, giriş ve diğer bazı sayfalarda widget'ı gösterme
 if (pathname?.startsWith("/admin") ||
  pathname?.startsWith("/giris") ||
  pathname?.startsWith("/sepet") ||
  pathname?.startsWith("/odeme")) {
  return null;
 }

 if (comparisonItems.length === 0) {
  return null;
 }

 const handleCompare = () => {
  setIsExpanded(false); // Widget'ı kapat
  router.push("/urun-karsilastir");
 };

 return (
  <div className="fixed bottom-2 left-2 sm:bottom-4 sm:left-4 z-50 w-[calc(100%-1rem)] sm:w-full max-w-xs">
   <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
    {/* Header */}
    <button
     onClick={() => setIsExpanded(!isExpanded)}
     className="w-full bg-indigo-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between hover:bg-indigo-700 transition cursor-pointer"
    >
     <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1">
      <HiSwitchHorizontal size={14} className="sm:w-4 sm:h-4 shrink-0" />
      <span className="font-semibold text-[10px] sm:text-xs truncate">
       Karşılaştırmak için {comparisonItems.length} ürün
      </span>
     </div>
     <HiChevronUp
      size={14}
      className={`sm:w-4 sm:h-4 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
     />
    </button>

    {/* Content */}
    {isExpanded && (
     <div className="p-2 sm:p-3 max-h-[400px] overflow-y-auto">
      <div className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-3">
       {comparisonItems.map((product) => {
        const priceInfo = product.discountPrice && product.discountPrice < product.price
         ? { price: product.price, discountPrice: product.discountPrice, displayPrice: product.discountPrice }
         : { price: product.price, discountPrice: null, displayPrice: product.price };

        return (
         <div
          key={product._id}
          className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200"
         >
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-white shrink-0 border border-gray-200">
           {product.images && product.images[0] ? (
            <Image
             src={product.images[0]}
             alt={product.name}
             fill
             className="object-contain p-1.5 sm:p-2"
             onError={(e) => {
              e.target.src = "/products/beyaz-esya.webp";
             }}
            />
           ) : (
            <Image
             src="/products/beyaz-esya.webp"
             alt={product.name}
             fill
             className="object-contain p-1.5 sm:p-2"
            />
           )}
          </div>
          <div className="flex-1 min-w-0">
           <Link
            href={getProductUrl(product)}
            className="text-[10px] sm:text-xs font-semibold text-gray-900 hover:text-indigo-600 transition line-clamp-2 mb-0.5"
           >
            {product.name}
           </Link>
           {(product.brand || product.serialNumber) && (
            <p className="text-[9px] sm:text-[10px] text-gray-500 mb-0.5 line-clamp-1">
             {product.brand && product.serialNumber
              ? `${product.brand} - ${product.serialNumber}`
              : product.brand || product.serialNumber}
            </p>
           )}
           <div className="flex items-center gap-0.5 sm:gap-1">
            {priceInfo.discountPrice ? (
             <>
              <span className="text-[10px] sm:text-xs font-bold text-indigo-600">
               {priceInfo.displayPrice} ₺
              </span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 line-through">
               {priceInfo.price} ₺
              </span>
             </>
            ) : (
             <span className="text-[10px] sm:text-xs font-bold text-gray-900">
              {priceInfo.displayPrice} ₺
             </span>
            )}
           </div>
          </div>
          <button
           onClick={() => removeFromComparison(product._id)}
           className="p-1 sm:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition shrink-0 cursor-pointer"
           title="Kaldır"
          >
           <HiX size={12} className="sm:w-[14px] sm:h-[14px]" />
          </button>
         </div>
        );
       })}
      </div>

      <div className="flex gap-1 sm:gap-1.5 pt-1.5 sm:pt-2 border-t border-gray-200">
       <button
        onClick={clearComparison}
        className="flex-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-700 rounded-lg text-[10px] sm:text-xs font-semibold hover:bg-gray-200 transition cursor-pointer"
       >
        Sıfırla
       </button>
       <button
        onClick={handleCompare}
        disabled={comparisonItems.length < 2}
        className={`flex-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition cursor-pointer ${comparisonItems.length >= 2
         ? "bg-indigo-600 text-white hover:bg-indigo-700"
         : "bg-gray-300 text-gray-500 cursor-not-allowed"
         }`}
       >
        Karşılaştır
       </button>
      </div>

      {comparisonItems.length < 2 && (
       <p className="text-[9px] sm:text-[10px] text-gray-500 text-center mt-1 sm:mt-1.5">
        Karşılaştırmak için en az 2 ürün seçin.
       </p>
      )}
     </div>
    )}
   </div>
  </div>
 );
}

