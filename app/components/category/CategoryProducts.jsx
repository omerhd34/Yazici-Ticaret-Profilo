"use client";
import ProductCard from "@/app/components/ui/ProductCard";

export default function CategoryProducts({ loading, products, sortBy, onClearFilters }) {
 if (loading) {
  return (
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
    {[...Array(9)].map((_, i) => (
     <div key={`skeleton-${i}`} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-3/4 bg-gray-200"></div>
      <div className="p-3 sm:p-4 space-y-3">
       <div className="h-4 bg-gray-200 rounded w-3/4"></div>
       <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
     </div>
    ))}
   </div>
  );
 }

 if (products.length === 0) {
  return (
   <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 md:p-12 text-center">
    <p className="text-gray-500 text-base sm:text-lg">Ürün bulunamadı.</p>
    <button
     onClick={onClearFilters}
     className="mt-4 text-sm sm:text-base text-indigo-600 hover:text-indigo-800 font-semibold"
    >
     Filtreleri Temizle
    </button>
   </div>
  );
 }

 const expandedProducts = products.map((product, originalIndex) => {
  let finalPrice = (product.discountPrice && product.discountPrice < product.price) ? product.discountPrice : product.price;

  if (product.colors && product.colors.length > 0) {
   const colorPrices = product.colors
    .filter(color => typeof color === 'object' && color.serialNumber)
    .map(color => {
     const colorPrice = color.price || product.price;
     const colorDiscountPrice = color.discountPrice !== undefined ? color.discountPrice : product.discountPrice;
     return (colorDiscountPrice && colorDiscountPrice < colorPrice) ? colorDiscountPrice : colorPrice;
    });

   if (colorPrices.length > 0) {
    finalPrice = Math.min(...colorPrices, finalPrice);
   }
  }

  return {
   ...product,
   _finalPrice: finalPrice,
   _originalIndex: originalIndex,
  };
 });

 let sortedProducts = expandedProducts;
 if (sortBy && !sortBy.startsWith('filter:')) {
  sortedProducts = [...expandedProducts].sort((a, b) => {
   if (sortBy === 'price') {
    const priceDiff = (a._finalPrice || 0) - (b._finalPrice || 0);
    return priceDiff !== 0 ? priceDiff : (a._originalIndex || 0) - (b._originalIndex || 0);
   } else if (sortBy === '-price') {
    const priceDiff = (b._finalPrice || 0) - (a._finalPrice || 0);
    return priceDiff !== 0 ? priceDiff : (a._originalIndex || 0) - (b._originalIndex || 0);
   } else if (sortBy === '-soldCount') {
    const soldCountDiff = (b.soldCount || 0) - (a.soldCount || 0);
    return soldCountDiff !== 0 ? soldCountDiff : (a._originalIndex || 0) - (b._originalIndex || 0);
   } else if (sortBy === '-rating') {
    const ratingDiff = (b.rating || 0) - (a.rating || 0);
    return ratingDiff !== 0 ? ratingDiff : (a._originalIndex || 0) - (b._originalIndex || 0);
   } else if (sortBy === 'name') {
    return (a.name || '').localeCompare(b.name || '', 'tr');
   } else if (sortBy === '-name') {
    return (b.name || '').localeCompare(a.name || '', 'tr');
   } else if (sortBy === '-createdAt') {
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
   } else if (sortBy === 'createdAt') {
    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
   }
   return 0;
  });
 }

 return (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 items-stretch">
   {sortedProducts.map((product, index) => {
    return <ProductCard key={product._id} product={product} priority={index < 6} />;
   })}
  </div>
 );
}
