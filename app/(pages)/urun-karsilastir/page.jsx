"use client";
import React, { useState, useEffect } from "react";
import { useComparison } from "@/context/ComparisonContext";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { HiX, HiSwitchHorizontal, HiHeart, HiTrash } from "react-icons/hi";
import { FaShoppingCart, FaStar, FaRegStar } from "react-icons/fa";
import { getProductUrl } from "@/app/utils/productUrl";
import Toast from "@/app/components/ui/Toast";

export default function UrunKarsilastirPage() {
 const { comparisonItems, removeFromComparison, clearComparison, maxItems } = useComparison();
 const { addToCart, addToFavorites, removeFromFavorites, isFavorite } = useCart();
 const [toast, setToast] = useState({ show: false, message: "", type: "success" });
 const [addedToCart, setAddedToCart] = useState({});
 const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setMounted(true);
 }, []);

 if (!mounted) {
  return (
   <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
    <div className="container mx-auto px-3 sm:px-4">
     <div className="max-w-2xl mx-auto text-center py-12 sm:py-16">
      <div className="mb-4 sm:mb-6">
       <HiSwitchHorizontal size={48} className="sm:w-16 sm:h-16 mx-auto text-gray-300" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Ürün Karşılaştırma</h1>
      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
       Yükleniyor...
      </p>
     </div>
    </div>
   </div>
  );
 }

 if (comparisonItems.length === 0) {
  return (
   <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
    <div className="container mx-auto px-3 sm:px-4">
     <div className="max-w-2xl mx-auto text-center py-12 sm:py-16">
      <div className="mb-4 sm:mb-6">
       <HiSwitchHorizontal size={48} className="sm:w-16 sm:h-16 mx-auto text-gray-300" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Ürün Karşılaştırma</h1>
      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 px-4">
       Karşılaştırmak istediğiniz ürünleri ekleyin. En fazla {maxItems} ürün karşılaştırabilirsiniz.
      </p>
      <Link
       href="/"
       className="inline-block bg-indigo-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-indigo-700 transition text-sm sm:text-base"
      >
       Ürünlere Göz At
      </Link>
     </div>
    </div>
   </div>
  );
 }

 // Tüm ürünlerin özelliklerini birleştir
 const getAllSpecifications = () => {
  const allSpecs = new Map();

  comparisonItems.forEach((product) => {
   const specs = product.specifications || [];
   specs.forEach((specCategory) => {
    const categoryName = specCategory.category;
    if (!allSpecs.has(categoryName)) {
     allSpecs.set(categoryName, new Map());
    }
    const categoryMap = allSpecs.get(categoryName);
    specCategory.items.forEach((item) => {
     categoryMap.set(item.key, true);
    });
   });
  });

  return allSpecs;
 };

 const allSpecs = getAllSpecifications();

 const handleAddToCart = (product) => {
  const stockToCheck = product.stock || 0;
  if (stockToCheck === 0) {
   setToast({ show: true, message: "Bu ürün stokta bulunmamaktadır.", type: "error" });
   return;
  }

  addToCart(product, null, null, 1);
  setAddedToCart((prev) => ({ ...prev, [product._id]: true }));
  setTimeout(() => {
   setAddedToCart((prev) => ({ ...prev, [product._id]: false }));
  }, 2000);
  setToast({ show: true, message: "Ürün sepete eklendi", type: "success" });
 };

 const handleFavoriteToggle = (product) => {
  if (isFavorite(product._id)) {
   removeFromFavorites(product._id);
   setToast({ show: true, message: "Favorilerden çıkarıldı", type: "success" });
  } else {
   addToFavorites(product);
   setToast({ show: true, message: "Favorilere eklendi", type: "success" });
  }
 };

 const getSpecValue = (product, categoryName, key) => {
  const specs = product.specifications || [];
  const category = specs.find((c) => c.category === categoryName);
  if (!category) return "-";
  const item = category.items.find((i) => i.key === key);
  return item ? item.value : "-";
 };

 // Virgülle ayrılmış değerleri satır başına maksimum 10 öğe olacak şekilde formatla
 const formatSpecValue = (value) => {
  if (!value || value === "-") return value;
  const items = value.split(',').map(item => item.trim()).filter(item => item);
  if (items.length <= 10) {
   return items.join(', ');
  }
  const lines = [];
  for (let i = 0; i < items.length; i += 10) {
   lines.push(items.slice(i, i + 10).join(', '));
  }
  return lines;
 };

 const getPrice = (product) => {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  return {
   price: product.price,
   discountPrice: product.discountPrice,
   hasDiscount,
   displayPrice: hasDiscount ? product.discountPrice : product.price,
  };
 };

 // Bir özelliğin tüm ürünlerde farklı olup olmadığını kontrol et
 const isDifferent = (categoryName, key) => {
  if (!showOnlyDifferences) return true; // Filtre kapalıysa tümünü göster

  const values = comparisonItems.map((product) => {
   return getSpecValue(product, categoryName, key);
  });

  // Tüm değerleri normalize et (büyük/küçük harf, boşluk vs.)
  const normalizedValues = values.map(v => String(v).trim().toLowerCase());

  // Eğer tüm değerler aynıysa false döndür (gizle)
  const uniqueValues = new Set(normalizedValues);
  return uniqueValues.size > 1;
 };

 // Tüm ürünlerin bir özellik için değerlerinin aynı olup olmadığını kontrol et
 const areAllValuesSame = (values) => {
  if (values.length === 0) return false;
  const normalizedValues = values.map(v => String(v).trim().toLowerCase());
  const uniqueValues = new Set(normalizedValues);
  return uniqueValues.size === 1;
 };

 // Genel bilgilerin farklı olup olmadığını kontrol et
 const isGeneralInfoDifferent = (infoType) => {
  if (!showOnlyDifferences) return true;

  if (infoType === 'price') {
   const prices = comparisonItems.map(p => {
    const priceInfo = getPrice(p);
    return priceInfo.displayPrice;
   });
   return new Set(prices).size > 1;
  }

  if (infoType === 'stock') {
   const stocks = comparisonItems.map(p => p.stock > 0 ? 'var' : 'yok');
   return new Set(stocks).size > 1;
  }

  if (infoType === 'rating') {
   const ratings = comparisonItems.map(p => Math.round(p.rating || 0));
   return new Set(ratings).size > 1;
  }

  if (infoType === 'brand') {
   const brands = comparisonItems.map(p => (p.brand || '').trim().toLowerCase());
   return new Set(brands).size > 1;
  }

  return true;
 };

 return (
  <div className="min-h-screen bg-gray-50 py-3 sm:py-12">
   <Toast toast={toast} setToast={setToast} />

   <div className="container mx-auto px-2 sm:px-4 xl:px-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 xl:mb-8 gap-3 sm:gap-4">
     <div>
      <h1 className="text-xl sm:text-2xl xl:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Ürün Karşılaştırma</h1>
      <p className="text-xs sm:text-sm xl:text-base text-gray-600">
       {comparisonItems.length} ürün karşılaştırılıyor.
      </p>
     </div>
     <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 xl:gap-6">
      <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
       <input
        type="checkbox"
        checked={showOnlyDifferences}
        onChange={(e) => setShowOnlyDifferences(e.target.checked)}
        className="w-3.5 h-3.5 sm:w-4 sm:h-4 xl:w-5 xl:h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
       />
       <span className="text-[10px] sm:text-xs xl:text-sm font-medium text-gray-700">
        Sadece farkları göster
       </span>
      </label>
      <button
       onClick={clearComparison}
       className="px-2.5 sm:px-3 xl:px-4 py-1.5 sm:py-2 bg-red-700 text-white rounded-lg hover:bg-red-500 transition font-semibold cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm xl:text-base"
      >
       <HiTrash size={14} className="sm:w-4 sm:h-4 xl:w-[18px] xl:h-[18px]" />
       <span className="whitespace-nowrap">Tümünü Temizle</span>
      </button>
     </div>
    </div>

    {/* Desktop Table View */}
    <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
     <div className="overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <table className="w-full border-collapse" style={{ minWidth: `${Math.max(800, comparisonItems.length * 240 + 200)}px` }}>
       <thead>
        <tr className="border-b-2 border-gray-200">
         <th className="p-3 xl:p-4 text-left font-semibold text-gray-900 sticky left-0 bg-white z-20 w-[180px] xl:w-[200px] border-r border-gray-200 whitespace-nowrap shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
          Ürünler
         </th>
         {comparisonItems.map((product) => (
          <th key={product._id} className="p-3 xl:p-4 text-center align-top min-w-[240px] xl:min-w-[280px] w-[240px] xl:w-[280px]">
           <div className="relative flex flex-col items-center">
            <button
             onClick={() => removeFromComparison(product._id)}
             className="absolute top-1 right-1 z-30 bg-white p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition rounded-full shadow-md border border-gray-200 hover:border-red-300 cursor-pointer"
             title="Karşılaştırmadan Kaldır"
            >
             <HiX size={15} />
            </button>

            <Link href={getProductUrl(product)} className="block w-full mb-2 xl:mb-3">
             <div className="relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              {product.images && product.images[0] ? (
               <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-contain p-2 xl:p-3"
                onError={(e) => {
                 e.target.src = "/products/beyaz-esya.webp";
                }}
               />
              ) : (
               <Image
                src="/products/beyaz-esya.webp"
                alt={product.name}
                fill
                className="object-contain p-2 xl:p-3"
               />
              )}
             </div>
            </Link>

            <Link href={getProductUrl(product)} className="w-full">
             <h3 className="font-bold text-gray-900 mb-2 hover:text-indigo-600 transition line-clamp-2 text-xs xl:text-sm text-center min-h-10 xl:min-h-12 px-1">
              {product.name}
             </h3>
            </Link>

            <div className="flex flex-col gap-1.5 xl:gap-2 w-full mt-2">
             <button
              onClick={() => handleAddToCart(product)}
              disabled={product.stock === 0}
              className={`w-full py-1.5 xl:py-2 rounded-lg font-semibold text-[10px] xl:text-xs transition flex items-center justify-center gap-1 ${addedToCart[product._id]
               ? "bg-green-600 text-white"
               : product.stock > 0
                ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
               }`}
             >
              <FaShoppingCart size={12} className="xl:w-3.5 xl:h-3.5" />
              <span className="whitespace-nowrap">{addedToCart[product._id] ? "Eklendi" : "Sepete Ekle"}</span>
             </button>

             <div className="flex gap-1.5 xl:gap-2">
              <button
               onClick={() => handleFavoriteToggle(product)}
               className={`flex-1 py-1.5 xl:py-2 rounded-lg border-2 transition flex items-center justify-center cursor-pointer ${isFavorite(product._id)
                ? "border-red-500 bg-red-50 text-red-500"
                : "border-gray-200 hover:border-red-500 hover:text-red-500"
                }`}
              >
               <HiHeart
                size={12}
                className={`xl:w-3.5 xl:h-3.5 ${isFavorite(product._id) ? "fill-current" : ""}`}
               />
              </button>

              <Link
               href={getProductUrl(product)}
               className="flex-1 py-1.5 xl:py-2 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:text-green-600 text-center font-semibold text-[10px] xl:text-xs transition flex items-center justify-center"
              >
               Detay
              </Link>
             </div>
            </div>
           </div>
          </th>
         ))}
        </tr>
       </thead>
       <tbody>
        {/* Genel Bilgiler */}
        {/* Marka */}
        {comparisonItems.some(p => p.brand) && isGeneralInfoDifferent('brand') && (
         <tr className="border-b border-gray-100">
          <td className="p-3 xl:p-4 font-semibold text-gray-900 sticky left-0 bg-white z-20 border-r border-gray-200 align-middle w-[180px] xl:w-[200px] whitespace-nowrap text-xs xl:text-sm shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
           Marka
          </td>
          {areAllValuesSame(comparisonItems.map(p => p.brand || "-")) ? (
           <td colSpan={comparisonItems.length} className="p-3 xl:p-4 text-center align-middle text-xs xl:text-sm">
            {comparisonItems[0].brand || "-"}
           </td>
          ) : (
           comparisonItems.map((product) => (
            <td key={product._id} className="p-3 xl:p-4 text-center align-middle text-xs xl:text-sm">
             {product.brand || "-"}
            </td>
           ))
          )}
         </tr>
        )}

        {/* Ürün Kodu */}
        {comparisonItems.some(p => {
         const allColors = p.colors || [];
         const validColors = allColors.filter(c => typeof c === 'object' && c.serialNumber);
         const firstColor = validColors.length > 0 ? validColors[0] : null;
         return firstColor?.serialNumber || p.serialNumber;
        }) && (
          <tr className="border-b border-gray-100">
           <td className="p-3 xl:p-4 font-semibold text-gray-900 sticky left-0 bg-white z-20 border-r border-gray-200 align-middle w-[180px] xl:w-[200px] whitespace-nowrap text-xs xl:text-sm shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
            Ürün Kodu
           </td>
           {(() => {
            const allCodes = comparisonItems.map((product) => {
             const allColors = product.colors || [];
             const validColors = allColors.filter(c => typeof c === 'object' && c.serialNumber);
             const firstColor = validColors.length > 0 ? validColors[0] : null;
             return firstColor?.serialNumber || product.serialNumber || "-";
            });
            const allSame = areAllValuesSame(allCodes);
            const firstCode = allCodes[0];

            return allSame ? (
             <td colSpan={comparisonItems.length} className="p-3 xl:p-4 text-center align-middle text-xs xl:text-sm">
              {firstCode && firstCode !== "-" ? (
               <span className="inline-block bg-indigo-100 text-indigo-700 font-mono text-[10px] xl:text-xs px-1.5 xl:px-2 py-0.5 rounded-md font-semibold break-all">
                {firstCode}
               </span>
              ) : "-"}
             </td>
            ) : (
             comparisonItems.map((product) => {
              const allColors = product.colors || [];
              const validColors = allColors.filter(c => typeof c === 'object' && c.serialNumber);
              const firstColor = validColors.length > 0 ? validColors[0] : null;
              const productCode = firstColor?.serialNumber || product.serialNumber;
              return (
               <td key={product._id} className="p-3 xl:p-4 text-center align-middle text-xs xl:text-sm">
                {productCode ? (
                 <span className="inline-block bg-indigo-100 text-indigo-700 font-mono text-[10px] xl:text-xs px-1.5 xl:px-2 py-0.5 rounded-md font-semibold break-all">
                  {productCode}
                 </span>
                ) : "-"}
               </td>
              );
             })
            );
           })()}
          </tr>
         )}

        {/* Fiyat */}
        {isGeneralInfoDifferent('price') && (
         <tr className="bg-gray-50 border-b border-gray-100">
          <td className="p-3 xl:p-4 font-semibold text-gray-900 sticky left-0 bg-gray-50 z-20 border-r border-gray-200 align-middle w-[180px] xl:w-[200px] whitespace-nowrap text-xs xl:text-sm shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
           Fiyat
          </td>
          {(() => {
           const allPrices = comparisonItems.map((product) => {
            const priceInfo = getPrice(product);
            return priceInfo.displayPrice;
           });
           const allSame = areAllValuesSame(allPrices);
           const firstPriceInfo = getPrice(comparisonItems[0]);

           return allSame ? (
            <td colSpan={comparisonItems.length} className="p-3 xl:p-4 text-center align-middle text-xs xl:text-sm">
             {firstPriceInfo.hasDiscount ? (
              <div className="flex flex-col items-center gap-0.5 xl:gap-1">
               <span className="text-xs xl:text-sm font-bold text-indigo-600">
                {firstPriceInfo.displayPrice} ₺
               </span>
               <span className="text-[10px] xl:text-xs text-gray-400 line-through">
                {firstPriceInfo.price} ₺
               </span>
              </div>
             ) : (
              <span className="text-xs xl:text-sm font-bold text-gray-900">
               {firstPriceInfo.displayPrice} ₺
              </span>
             )}
            </td>
           ) : (
            comparisonItems.map((product) => {
             const priceInfo = getPrice(product);
             return (
              <td key={product._id} className="p-3 xl:p-4 text-center align-middle text-xs xl:text-sm">
               {priceInfo.hasDiscount ? (
                <div className="flex flex-col items-center gap-0.5 xl:gap-1">
                 <span className="text-xs xl:text-sm font-bold text-indigo-600">
                  {priceInfo.displayPrice} ₺
                 </span>
                 <span className="text-[10px] xl:text-xs text-gray-400 line-through">
                  {priceInfo.price} ₺
                 </span>
                </div>
               ) : (
                <span className="text-xs xl:text-sm font-bold text-gray-900">
                 {priceInfo.displayPrice} ₺
                </span>
               )}
              </td>
             );
            })
           );
          })()}
         </tr>
        )}

        {/* Stok Durumu */}
        {isGeneralInfoDifferent('stock') && (
         <tr className="border-b border-gray-100">
          <td className="p-3 xl:p-4 font-semibold text-gray-900 sticky left-0 bg-white z-20 border-r border-gray-200 align-middle w-[180px] xl:w-[200px] whitespace-nowrap text-xs xl:text-sm shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
           Stok Durumu
          </td>
          {(() => {
           const allStocks = comparisonItems.map(p => p.stock > 0 ? "Stokta Var" : "Stokta Yok");
           const allSame = areAllValuesSame(allStocks);
           const firstStock = comparisonItems[0].stock > 0;

           return allSame ? (
            <td colSpan={comparisonItems.length} className="p-3 xl:p-4 text-center align-middle">
             <span
              className={`inline-block px-2 xl:px-3 py-0.5 xl:py-1 rounded-full text-[10px] xl:text-xs font-semibold ${firstStock
               ? "bg-green-100 text-green-700"
               : "bg-red-100 text-red-700"
               }`}
             >
              {firstStock ? "Stokta Var" : "Stokta Yok"}
             </span>
            </td>
           ) : (
            comparisonItems.map((product) => (
             <td key={product._id} className="p-3 xl:p-4 text-center align-middle">
              <span
               className={`inline-block px-2 xl:px-3 py-0.5 xl:py-1 rounded-full text-[10px] xl:text-xs font-semibold ${product.stock > 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
                }`}
              >
               {product.stock > 0 ? "Stokta Var" : "Stokta Yok"}
              </span>
             </td>
            ))
           );
          })()}
         </tr>
        )}

        {/* Değerlendirme */}
        {isGeneralInfoDifferent('rating') && (
         <tr className="bg-gray-50 border-b border-gray-100">
          <td className="p-3 xl:p-4 font-semibold text-gray-900 sticky left-0 bg-gray-50 z-20 border-r border-gray-200 align-middle w-[180px] xl:w-[200px] whitespace-nowrap text-xs xl:text-sm shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
           Değerlendirme
          </td>
          {(() => {
           const allRatings = comparisonItems.map(p => Math.round(p.rating || 0));
           const allSame = areAllValuesSame(allRatings);
           const firstProduct = comparisonItems[0];

           return allSame ? (
            <td colSpan={comparisonItems.length} className="p-3 xl:p-4 text-center align-middle">
             <div className="flex flex-col xl:flex-row items-center justify-center gap-1 xl:gap-2">
              <div className="flex text-yellow-400">
               {[...Array(5)].map((_, i) => (
                i < Math.round(firstProduct.rating || 0) ? (
                 <FaStar key={i} className="w-2.5 h-2.5 xl:w-3.5 xl:h-3.5" />
                ) : (
                 <FaRegStar key={i} className="w-2.5 h-2.5 xl:w-3.5 xl:h-3.5 text-gray-300" />
                )
               ))}
              </div>
              <span className="text-[9px] xl:text-xs text-gray-600">
               {firstProduct.rating > 0 ? firstProduct.rating.toFixed(1) : "0.0"} ({firstProduct.reviewCount || 0})
              </span>
             </div>
            </td>
           ) : (
            comparisonItems.map((product) => (
             <td key={product._id} className="p-3 xl:p-4 text-center align-middle">
              <div className="flex flex-col xl:flex-row items-center justify-center gap-1 xl:gap-2">
               <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                 i < Math.round(product.rating || 0) ? (
                  <FaStar key={i} className="w-2.5 h-2.5 xl:w-3.5 xl:h-3.5" />
                 ) : (
                  <FaRegStar key={i} className="w-2.5 h-2.5 xl:w-3.5 xl:h-3.5 text-gray-300" />
                 )
                ))}
               </div>
               <span className="text-[9px] xl:text-xs text-gray-600">
                {product.rating > 0 ? product.rating.toFixed(1) : "0.0"} ({product.reviewCount || 0})
               </span>
              </div>
             </td>
            ))
           );
          })()}
         </tr>
        )}

        {/* Özellikler - Tablo */}
        {Array.from(allSpecs.entries()).map(([categoryName, keysMap]) => {
         const differentKeys = Array.from(keysMap.keys()).filter(key => isDifferent(categoryName, key));
         if (differentKeys.length === 0) return null;
         return (
          <React.Fragment key={categoryName}>
           <tr className="bg-indigo-50">
            <td className="p-3 xl:p-4 font-bold text-indigo-900 uppercase text-xs xl:text-sm whitespace-nowrap sticky left-0 bg-indigo-50 z-20 border-r border-gray-200 w-[180px] xl:w-[200px] shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
             {categoryName}
            </td>
            {comparisonItems.map((product) => (
             <td key={`category-${product._id}`} className="p-3 xl:p-4 bg-indigo-50"></td>
            ))}
           </tr>
           {differentKeys.map((key) => {
            const allValues = comparisonItems.map((product) => {
             const specValue = getSpecValue(product, categoryName, key);
             return formatSpecValue(specValue);
            });
            const allSame = areAllValuesSame(comparisonItems.map((product) => getSpecValue(product, categoryName, key)));
            const firstValue = allValues[0];

            return (
             <tr key={key} className="border-b border-gray-100">
              <td className="p-3 xl:p-4 font-semibold text-gray-900 sticky left-0 bg-white z-20 border-r border-gray-200 align-middle w-[180px] xl:w-[200px] text-[10px] xl:text-xs whitespace-nowrap shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
               {key}
              </td>
              {allSame ? (
               <td colSpan={comparisonItems.length} className="p-3 xl:p-4 text-center text-gray-600 align-middle text-[10px] xl:text-xs">
                {Array.isArray(firstValue) ? (
                 <div className="flex flex-col gap-0.5 xl:gap-1 items-center">
                  {firstValue.map((line, idx) => (
                   <span key={idx}>{line}</span>
                  ))}
                 </div>
                ) : (
                 <span>{firstValue}</span>
                )}
               </td>
              ) : (
               comparisonItems.map((product) => {
                const specValue = getSpecValue(product, categoryName, key);
                const formattedValue = formatSpecValue(specValue);
                return (
                 <td key={product._id} className="p-3 xl:p-4 text-center text-gray-600 align-middle text-[10px] xl:text-xs">
                  {Array.isArray(formattedValue) ? (
                   <div className="flex flex-col gap-0.5 xl:gap-1 items-center">
                    {formattedValue.map((line, idx) => (
                     <span key={idx}>{line}</span>
                    ))}
                   </div>
                  ) : (
                   <span>{formattedValue}</span>
                  )}
                 </td>
                );
               })
              )}
             </tr>
            );
           })}
          </React.Fragment>
         );
        })}
       </tbody>
      </table>
     </div>
    </div>

    {/* Mobile & Tablet Card View */}
    <div className="lg:hidden space-y-3 sm:space-y-6">
     {comparisonItems.map((product, index) => {
      const priceInfo = getPrice(product);
      return (
       <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-2 sm:p-4 border-b border-gray-200">
         <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="flex-1 min-w-0">
           <Link href={getProductUrl(product)}>
            <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 hover:text-indigo-600 transition text-sm sm:text-lg line-clamp-2">
             {product.name}
            </h3>
           </Link>
           {product.brand && (
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Marka: {product.brand}</p>
           )}
          </div>
          <button
           onClick={() => removeFromComparison(product._id)}
           className="ml-1 sm:ml-2 bg-white p-1.5 sm:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition rounded-full shadow-md border border-gray-200 hover:border-red-300 cursor-pointer shrink-0"
           title="Karşılaştırmadan Kaldır"
          >
           <HiX size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
         </div>

         <Link href={getProductUrl(product)} className="block mb-2 sm:mb-3">
          <div className="relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200 max-w-xs mx-auto">
           {product.images && product.images[0] ? (
            <Image
             src={product.images[0]}
             alt={product.name}
             fill
             className="object-contain p-2 sm:p-3"
             onError={(e) => {
              e.target.src = "/products/beyaz-esya.webp";
             }}
            />
           ) : (
            <Image
             src="/products/beyaz-esya.webp"
             alt={product.name}
             fill
             className="object-contain p-2 sm:p-3"
            />
           )}
          </div>
         </Link>

         <div className="flex flex-col gap-1.5 sm:gap-2">
          <button
           onClick={() => handleAddToCart(product)}
           disabled={product.stock === 0}
           className={`w-full py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 sm:gap-2 ${addedToCart[product._id]
            ? "bg-green-600 text-white"
            : product.stock > 0
             ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
             : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
           <FaShoppingCart size={14} className="sm:w-4 sm:h-4" />
           <span className="whitespace-nowrap">{addedToCart[product._id] ? "Eklendi" : "Sepete Ekle"}</span>
          </button>

          <div className="flex gap-1.5 sm:gap-2">
           <button
            onClick={() => handleFavoriteToggle(product)}
            className={`flex-1 py-2 sm:py-2.5 rounded-lg border-2 transition flex items-center justify-center cursor-pointer ${isFavorite(product._id)
             ? "border-red-500 bg-red-50 text-red-500"
             : "border-gray-200 hover:border-red-500 hover:text-red-500"
             }`}
           >
            <HiHeart
             size={16}
             className={`sm:w-[18px] sm:h-[18px] ${isFavorite(product._id) ? "fill-current" : ""}`}
            />
           </button>

           <Link
            href={getProductUrl(product)}
            className="flex-1 py-2 sm:py-2.5 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:text-green-600 text-center font-semibold text-xs sm:text-sm transition flex items-center justify-center"
           >
            Detay
           </Link>
          </div>
         </div>
        </div>

        <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
         {/* Ürün Kodu */}
         {(() => {
          const allColors = product.colors || [];
          const validColors = allColors.filter(c => typeof c === 'object' && c.serialNumber);
          const firstColor = validColors.length > 0 ? validColors[0] : null;
          const productCode = firstColor?.serialNumber || product.serialNumber;
          return productCode ? (
           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1.5 sm:py-2 border-b border-gray-100 gap-1">
            <span className="font-semibold text-gray-900 text-[11px] sm:text-sm whitespace-nowrap">Ürün Kodu:</span>
            <span className="inline-block w-fit bg-indigo-100 text-indigo-700 font-mono text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-semibold break-all sm:break-normal">
             {productCode}
            </span>
           </div>
          ) : null;
         })()}

         {/* Fiyat */}
         {isGeneralInfoDifferent('price') && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1.5 sm:py-2 border-b border-gray-100 gap-1">
           <span className="font-semibold text-gray-900 text-[11px] sm:text-sm whitespace-nowrap">Fiyat:</span>
           <div className="text-left sm:text-right">
            {priceInfo.hasDiscount ? (
             <>
              <span className="text-sm sm:text-base font-bold text-indigo-600 block">
               {priceInfo.displayPrice} ₺
              </span>
              <span className="text-xs sm:text-sm text-gray-400 line-through">
               {priceInfo.price} ₺
              </span>
             </>
            ) : (
             <span className="text-sm sm:text-base font-bold text-gray-900">
              {priceInfo.displayPrice} ₺
             </span>
            )}
           </div>
          </div>
         )}

         {/* Stok Durumu */}
         {isGeneralInfoDifferent('stock') && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1.5 sm:py-2 border-b border-gray-100 gap-1">
           <span className="font-semibold text-gray-900 text-[11px] sm:text-sm whitespace-nowrap">Stok Durumu:</span>
           <span
            className={`inline-block w-fit px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${product.stock > 0
             ? "bg-green-100 text-green-700"
             : "bg-red-100 text-red-700"
             }`}
           >
            {product.stock > 0 ? "Stokta Var" : "Stokta Yok"}
           </span>
          </div>
         )}

         {/* Değerlendirme */}
         {isGeneralInfoDifferent('rating') && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1.5 sm:py-2 border-b border-gray-100 gap-1 sm:gap-2">
           <span className="font-semibold text-gray-900 text-[11px] sm:text-sm whitespace-nowrap">Değerlendirme:</span>
           <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex text-yellow-400">
             {[...Array(5)].map((_, i) => (
              i < Math.round(product.rating || 0) ? (
               <FaStar key={i} className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
               <FaRegStar key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300" />
              )
             ))}
            </div>
            <span className="text-[10px] sm:text-xs text-gray-600">
             {product.rating > 0 ? product.rating.toFixed(1) : "0.0"} ({product.reviewCount || 0})
            </span>
           </div>
          </div>
         )}

         {/* Özellikler */}
         {Array.from(allSpecs.entries()).map(([categoryName, keysMap]) => {
          const differentKeys = Array.from(keysMap.keys()).filter(key => isDifferent(categoryName, key));
          if (differentKeys.length === 0) return null;
          return (
           <div key={categoryName} className="mt-3 sm:mt-4">
            <h4 className="font-bold text-indigo-900 uppercase text-xs sm:text-sm mb-1.5 sm:mb-2 pb-1.5 sm:pb-2 border-b-2 border-indigo-200 wrap-break-word sm:whitespace-nowrap">
             {categoryName}
            </h4>
            <div className="space-y-1.5 sm:space-y-2">
             {differentKeys.map((key) => {
              const specValue = getSpecValue(product, categoryName, key);
              const formattedValue = formatSpecValue(specValue);
              return (
               <div key={key} className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-1.5 sm:py-2 border-b border-gray-100">
                <span className="font-semibold text-gray-900 text-[11px] sm:text-sm mb-1 sm:mb-0 wrap-break-word sm:whitespace-nowrap pr-1">{key}:</span>
                <div className="text-gray-600 text-[11px] sm:text-sm text-left sm:text-right flex-1 min-w-0 wrap-break-word">
                 {Array.isArray(formattedValue) ? (
                  <div className="flex flex-col gap-0">
                   {formattedValue.map((line, idx) => (
                    <span key={idx} className="wrap-break-word">{line}</span>
                   ))}
                  </div>
                 ) : (
                  <span className="wrap-break-word">{formattedValue}</span>
                 )}
                </div>
               </div>
              );
             })}
            </div>
           </div>
          );
         })}
        </div>
       </div>
      );
     })}
    </div>
   </div>
  </div>
 );
}