"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import { getProductUrl } from "@/app/utils/productUrl";

export default function ProductBundleItems({ product, selectedColor }) {
 const [isExpanded, setIsExpanded] = useState(false);
 // Seçili rengin productsInside array'ini kontrol et
 const currentColorObj = useMemo(() => {
  if (!product || !product.colors || product.colors.length === 0) return null;
  return selectedColor
   ? product.colors.find(c => typeof c === 'object' && c.name === selectedColor)
   : (typeof product.colors[0] === 'object' ? product.colors[0] : null);
 }, [product, selectedColor]);

 const productsInside = currentColorObj?.productsInside;


 // Grid sütun sayısını belirle: Ankastre Setler için 3, Klimalar için 2
 const gridCols = useMemo(() => {
  if (product?.subCategory === "Ankastre Setler") {
   return "md:grid-cols-3";
  }
  // Klimalar için (Klima Takımı veya category === "Klima")
  if (product?.category === "Klima" || product?.subCategory === "Klima Takımı") {
   return "md:grid-cols-2";
  }
  // Varsayılan olarak 2 sütun
  return "md:grid-cols-2";
 }, [product]);

 // productsInside artık tam ürün objeleri array'i
 // Her ürün için ilk rengi kullan
 const bundleProducts = useMemo(() => {
  if (!productsInside || !Array.isArray(productsInside) || productsInside.length === 0) {
   return [];
  }

  return productsInside.map((productItem) => {
   // Ürünün colors array'inden ilk rengi al
   const firstColor = productItem.colors && productItem.colors.length > 0
    ? productItem.colors[0]
    : null;

   if (!firstColor) {
    return null;
   }

   return {
    product: productItem,
    color: firstColor,
    serialNumber: firstColor.serialNumber || ""
   };
  }).filter(Boolean); // null değerleri filtrele
 }, [productsInside]);

 // productsInside yoksa component'i render etme
 if (!productsInside || !Array.isArray(productsInside) || productsInside.length === 0) {
  return null;
 }

 if (bundleProducts.length === 0) {
  return null;
 }

 return (
  <div className="mt-6 sm:mt-8 md:mt-12 pt-6 sm:pt-8 md:pt-12 border-t">
   <button
    onClick={() => setIsExpanded(!isExpanded)}
    className="md:pointer-events-none w-full flex items-center justify-between md:justify-start mb-3 sm:mb-4 md:mb-6 cursor-pointer"
   >
    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Takım İçeriği</h2>
    <span className="md:hidden ml-2 text-gray-600">
     {isExpanded ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
    </span>
   </button>
   <div className={`${isExpanded ? 'grid' : 'hidden'} md:grid grid-cols-1 ${gridCols} gap-3 sm:gap-4 md:gap-6 pb-6 sm:pb-8 md:pb-12 border-b items-stretch`}>
    {bundleProducts.map((item, index) => {
     const p = item.product;
     const color = item.color;
     const serialNumber = item.serialNumber;

     const colorPrice = color?.price || p.price;
     const colorDiscountPrice = color?.discountPrice !== undefined ? color.discountPrice : p.discountPrice;
     const colorImages = color?.images && color.images.length > 0 ? color.images : p.images;
     const colorStock = color?.stock !== undefined ? color.stock : p.stock;
     const hasDiscount = colorDiscountPrice && colorDiscountPrice < colorPrice;
     const displayPrice = hasDiscount ? colorDiscountPrice : colorPrice;

     const productUrl = getProductUrl(p, serialNumber);

     // Ankastre Setler için dikey layout, Klimalar için yatay layout
     const isVerticalLayout = product?.subCategory === "Ankastre Setler";

     return (
      <div key={index} className="bg-white rounded-lg sm:rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
       <Link href={productUrl} className="h-full flex flex-col">
        <div className={isVerticalLayout ? "flex flex-col flex-1" : "flex flex-col md:flex-row flex-1"}>
         <div className={`relative bg-gray-100 shrink-0 ${isVerticalLayout ? "w-full h-32 sm:h-40 md:h-48" : "w-full md:w-40 h-32 sm:h-40 md:h-auto"}`}>
          {colorImages && colorImages.length > 0 ? (
           <Image
            src={colorImages[0]}
            alt={p.name}
            fill
            className="object-contain p-2 sm:p-2 md:p-3"
            sizes={isVerticalLayout ? "(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 33vw" : "(max-width: 768px) 100vw, 160px"}
           />
          ) : (
           <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-xs sm:text-xs md:text-sm">Görsel Yok</span>
           </div>
          )}
         </div>
         <div className={`flex-1 p-2.5 sm:p-3 md:p-4 flex flex-col ${isVerticalLayout ? "justify-start" : ""}`}>
          <div>
           {p.brand && (
            <p className="text-xs sm:text-xs md:text-sm text-gray-500 uppercase tracking-wide mb-1">
             {p.brand}
            </p>
           )}
           <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-900 mb-1 sm:mb-1 md:mb-2 line-clamp-2">
            {p.name}
           </h3>
           {serialNumber && (
            <p className="text-xs sm:text-xs md:text-sm text-gray-600 mb-1.5 sm:mb-2 md:mb-3">
             <span className="font-mono">Seri No: <span className="font-extrabold">{serialNumber}</span></span>
            </p>
           )}
           {p.description && (
            <p className="text-xs sm:text-xs md:text-sm text-gray-600 mb-1.5 sm:mb-2 md:mb-3 line-clamp-2">
             {p.description}
            </p>
           )}
          </div>
          <div className="flex items-center justify-between mt-auto pt-2 sm:pt-3 md:pt-4">
           <div>
            {hasDiscount ? (
             <div className="flex flex-col md:flex-row md:items-center gap-0.5 sm:gap-1 md:gap-0">
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-indigo-600">
               {displayPrice.toLocaleString('tr-TR')} ₺
              </span>
              <span className="text-xs sm:text-xs md:text-sm text-gray-500 line-through md:ml-2">
               {colorPrice.toLocaleString('tr-TR')} ₺
              </span>
             </div>
            ) : (
             <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-indigo-600">
              {displayPrice.toLocaleString('tr-TR')} ₺
             </span>
            )}
           </div>
           <div className="text-xs sm:text-xs md:text-sm text-gray-600">
            {colorStock > 0 ? (
             <span className="text-green-600 font-semibold">Stokta Var</span>
            ) : (
             <span className="text-red-600 font-semibold">Stokta Yok</span>
            )}
           </div>
          </div>
         </div>
        </div>
       </Link>
      </div>
     );
    })}
   </div>
  </div>
 );
}

