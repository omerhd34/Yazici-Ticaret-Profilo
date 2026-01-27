"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { HiPlus, HiX } from "react-icons/hi";
import { MdDelete, MdEdit, MdInventory2, MdStar, MdCheckCircle, MdNewReleases, MdArrowUpward, MdArrowDownward } from "react-icons/md";
import { MENU_ITEMS } from "@/app/utils/menuItems";
import { getProductUrl } from "@/app/utils/productUrl";

export default function ProductListTable({ products, onEdit, onDelete, onAddNew, selectedCategory, selectedSubCategory, selectedStockFilter, selectedFeaturedFilter, selectedNewFilter, selectedDiscountFilter, onCategoryChange, onSubCategoryChange, onStockFilterChange, onFeaturedFilterChange, onNewFilterChange, onDiscountFilterChange }) {
 const [sortBy, setSortBy] = useState(null); // 'price' | 'stock' | null
 const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

 const categoryFilteredProducts = products.filter((product) => {
  if (selectedCategory && product.category !== selectedCategory) {
   return false;
  }
  if (selectedSubCategory && product.subCategory !== selectedSubCategory) {
   return false;
  }
  return true;
 });

 const filteredProducts = categoryFilteredProducts.filter((product) => {
  if (selectedStockFilter) {
   // Renk varyantları varsa, en az birinde stok kontrolü yap
   if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
    const colorVariants = product.colors.filter(c => typeof c === 'object' && c.serialNumber);
    if (colorVariants.length > 0) {
     const totalStock = colorVariants.reduce((sum, color) => {
      return sum + (color.stock !== undefined ? Number(color.stock) || 0 : 0);
     }, 0);
     const maxStock = Math.max(...colorVariants.map(c => c.stock !== undefined ? Number(c.stock) || 0 : 0));
     const minStock = Math.min(...colorVariants.map(c => c.stock !== undefined ? Number(c.stock) || 0 : 0));

     switch (selectedStockFilter) {
      case 'inStock':
       if (maxStock <= 0) return false;
       break;
      case 'outOfStock':
       if (maxStock > 0) return false;
       break;
      case 'lowStock':
       if (maxStock >= 10) return false;
       break;
      default:
       break;
     }
    } else {
     // Renk varyantı yoksa normal stok kontrolü
     const productStock = product.stock !== undefined ? Number(product.stock) || 0 : 0;
     switch (selectedStockFilter) {
      case 'inStock':
       if (productStock <= 0) return false;
       break;
      case 'outOfStock':
       if (productStock > 0) return false;
       break;
      case 'lowStock':
       if (productStock >= 10) return false;
       break;
      default:
       break;
     }
    }
   } else {
    // Renk yoksa normal stok kontrolü
    const productStock = product.stock !== undefined ? Number(product.stock) || 0 : 0;
    switch (selectedStockFilter) {
     case 'inStock':
      if (productStock <= 0) return false;
      break;
     case 'outOfStock':
      if (productStock > 0) return false;
      break;
     case 'lowStock':
      if (productStock >= 10) return false;
      break;
     default:
      break;
    }
   }
  }

  if (selectedFeaturedFilter) {
   if (selectedFeaturedFilter === 'featured' && !product.isFeatured) {
    return false;
   }
   if (selectedFeaturedFilter === 'notFeatured' && product.isFeatured) {
    return false;
   }
  }

  if (selectedNewFilter) {
   if (selectedNewFilter === 'new' && !product.isNewProduct) {
    return false;
   }
   if (selectedNewFilter === 'notNew' && product.isNewProduct) {
    return false;
   }
  }

  if (selectedDiscountFilter) {
   // İndirimli ürün kontrolü
   let hasDiscount = false;

   // Renk varyantları varsa kontrol et
   if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
    const colorVariants = product.colors.filter(c => typeof c === 'object' && c.serialNumber);
    if (colorVariants.length > 0) {
     // En az bir renk varyantında indirim varsa ürün indirimli sayılır
     hasDiscount = colorVariants.some(color => {
      const colorPrice = color.price !== undefined ? Number(color.price) : product.price;
      const colorDiscountPrice = color.discountPrice !== undefined ? color.discountPrice : null;
      return colorDiscountPrice !== null && colorDiscountPrice < colorPrice;
     });
    } else {
     // Renk varyantı yoksa ana ürünün indirimini kontrol et
     hasDiscount = product.discountPrice !== null && product.discountPrice !== undefined && product.discountPrice < product.price;
    }
   } else {
    // Renk yoksa ana ürünün indirimini kontrol et
    hasDiscount = product.discountPrice !== null && product.discountPrice !== undefined && product.discountPrice < product.price;
   }

   if (selectedDiscountFilter === 'discounted' && !hasDiscount) {
    return false;
   }
   if (selectedDiscountFilter === 'notDiscounted' && hasDiscount) {
    return false;
   }
  }

  return true;
 });

 // Sıralama fonksiyonu
 const sortedProducts = useMemo(() => {
  if (!sortBy) return filteredProducts;

  return [...filteredProducts].sort((a, b) => {
   let valueA, valueB;

   if (sortBy === 'price') {
    // Renk varyantları varsa en düşük fiyatı al
    if (a.colors && Array.isArray(a.colors) && a.colors.length > 0) {
     const colorVariants = a.colors.filter(c => typeof c === 'object' && c.serialNumber);
     if (colorVariants.length > 0) {
      valueA = Math.min(...colorVariants.map(c => c.price || a.price || 0));
     } else {
      valueA = a.price || 0;
     }
    } else {
     valueA = a.price || 0;
    }

    if (b.colors && Array.isArray(b.colors) && b.colors.length > 0) {
     const colorVariants = b.colors.filter(c => typeof c === 'object' && c.serialNumber);
     if (colorVariants.length > 0) {
      valueB = Math.min(...colorVariants.map(c => c.price || b.price || 0));
     } else {
      valueB = b.price || 0;
     }
    } else {
     valueB = b.price || 0;
    }
   } else if (sortBy === 'stock') {
    // Renk varyantları varsa toplam stoku al
    if (a.colors && Array.isArray(a.colors) && a.colors.length > 0) {
     const colorVariants = a.colors.filter(c => typeof c === 'object' && c.serialNumber);
     if (colorVariants.length > 0) {
      valueA = colorVariants.reduce((sum, color) => sum + (color.stock !== undefined ? Number(color.stock) || 0 : 0), 0);
     } else {
      valueA = a.stock !== undefined ? Number(a.stock) || 0 : 0;
     }
    } else {
     valueA = a.stock !== undefined ? Number(a.stock) || 0 : 0;
    }

    if (b.colors && Array.isArray(b.colors) && b.colors.length > 0) {
     const colorVariants = b.colors.filter(c => typeof c === 'object' && c.serialNumber);
     if (colorVariants.length > 0) {
      valueB = colorVariants.reduce((sum, color) => sum + (color.stock !== undefined ? Number(color.stock) || 0 : 0), 0);
     } else {
      valueB = b.stock !== undefined ? Number(b.stock) || 0 : 0;
     }
    } else {
     valueB = b.stock !== undefined ? Number(b.stock) || 0 : 0;
    }
   } else {
    return 0;
   }

   const comparison = Number(valueA) - Number(valueB);
   return sortOrder === 'asc' ? comparison : -comparison;
  });
 }, [filteredProducts, sortBy, sortOrder]);

 const handleSort = (column) => {
  if (sortBy === column) {
   // Aynı sütuna tıklandığında sıralama yönünü değiştir
   setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  } else {
   // Yeni sütuna tıklandığında artan sıralama ile başla
   setSortBy(column);
   setSortOrder('asc');
  }
 };

 const totalProductCount = products.length;

 const selectedMenuItem = MENU_ITEMS.find(item => item.name === selectedCategory);
 const availableSubCategories = selectedMenuItem?.subCategories || [];

 return (
  <div className="bg-white rounded-xl shadow-md p-6">
   <div className="flex justify-between items-center mb-6">
    <div>
     <h2 className="text-2xl font-bold">Ürün Yönetimi</h2>
     <p className="text-sm text-gray-600 mt-2">
      {selectedCategory || selectedSubCategory || selectedStockFilter || selectedFeaturedFilter || selectedNewFilter || selectedDiscountFilter ? (
       <>
        <span className="font-semibold text-indigo-600">{filteredProducts.length}</span> ürün bulundu
       </>
      ) : (
       <>
        <span className="font-semibold text-indigo-600">{totalProductCount}</span> ürün
       </>
      )}
     </p>
    </div>
    <button
     onClick={onAddNew}
     className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition cursor-pointer"
    >
     <HiPlus size={20} />
     Yeni Ürün Ekle
    </button>
   </div>

   {/* Kategori Filtreleri */}
   <div className="mb-6 bg-linear-to-r from-indigo-50 to-purple-50 rounded-xl p-5 shadow-sm border border-indigo-100">
    <div className="flex flex-wrap gap-4 items-end">
     <div className="flex-1 min-w-[200px]">
      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
       <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
       Ana Kategori
      </label>
      <select
       value={selectedCategory || ""}
       onChange={(e) => {
        onCategoryChange(e.target.value || null);
        onSubCategoryChange(null);
       }}
       className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 cursor-pointer appearance-none bg-white text-gray-800 font-medium shadow-sm hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-sm"
       style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%234F46E5' d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
        backgroundSize: '16px'
       }}
      >
       <option value="">Tüm Kategoriler</option>
       {MENU_ITEMS.filter(item => !item.isSpecial).map((item) => (
        <option key={item.name} value={item.name}>{item.name}</option>
       ))}
      </select>
     </div>
     {selectedCategory && availableSubCategories.length > 0 && (
      <div className="flex-1 min-w-[200px]">
       <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
        Alt Kategori
       </label>
       <select
        value={selectedSubCategory || ""}
        onChange={(e) => onSubCategoryChange(e.target.value || null)}
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 cursor-pointer appearance-none bg-white text-gray-800 font-medium shadow-sm hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 text-sm"
        style={{
         backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%239333EA' d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
         backgroundRepeat: 'no-repeat',
         backgroundPosition: 'right 1rem center',
         backgroundSize: '16px'
        }}
       >
        <option value="">Tüm Alt Kategoriler</option>
        {availableSubCategories.map((subCat) => (
         <option key={subCat.name} value={subCat.name}>{subCat.name}</option>
        ))}
       </select>
      </div>
     )}
     <div className="flex-1 min-w-[200px]">
      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
       <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
       Stok Durumu
      </label>
      <select
       value={selectedStockFilter || ""}
       onChange={(e) => onStockFilterChange(e.target.value || null)}
       className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 cursor-pointer appearance-none bg-white text-gray-800 font-medium shadow-sm hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-sm"
       style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2316A34A' d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
        backgroundSize: '16px'
       }}
      >
       <option value="">Tümü</option>
       <option value="inStock">Stokta</option>
       <option value="outOfStock">Stokta Yok</option>
       <option value="lowStock">Düşük Stok (&lt;10)</option>
      </select>
     </div>
     <div className="flex-1 min-w-[200px]">
      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
       <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></span>
       Öne Çıkan
      </label>
      <select
       value={selectedFeaturedFilter || ""}
       onChange={(e) => onFeaturedFilterChange(e.target.value || null)}
       className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 cursor-pointer appearance-none bg-white text-gray-800 font-medium shadow-sm hover:border-yellow-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 text-sm"
       style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23CA8A04' d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
        backgroundSize: '16px'
       }}
      >
       <option value="">Tümü</option>
       <option value="featured">Öne Çıkanlar</option>
       <option value="notFeatured">Öne Çıkan Olmayanlar</option>
      </select>
     </div>
     <div className="flex-1 min-w-[200px]">
      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
       <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
       Yeni Ürünler
      </label>
      <select
       value={selectedNewFilter || ""}
       onChange={(e) => onNewFilterChange(e.target.value || null)}
       className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 cursor-pointer appearance-none bg-white text-gray-800 font-medium shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-sm"
       style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%232563EB' d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
        backgroundSize: '16px'
       }}
      >
       <option value="">Tümü</option>
       <option value="new">Yeni Ürünler</option>
       <option value="notNew">Yeni Olmayanlar</option>
      </select>
     </div>
     <div className="flex-1 min-w-[200px]">
      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
       <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
       İndirimli Ürünler
      </label>
      <select
       value={selectedDiscountFilter || ""}
       onChange={(e) => onDiscountFilterChange(e.target.value || null)}
       className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 cursor-pointer appearance-none bg-white text-gray-800 font-medium shadow-sm hover:border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 text-sm"
       style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23DC2626' d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
        backgroundSize: '16px'
       }}
      >
       <option value="">Tümü</option>
       <option value="discounted">İndirimli Ürünler</option>
       <option value="notDiscounted">İndirimsiz Ürünler</option>
      </select>
     </div>
     {(selectedCategory || selectedSubCategory || selectedStockFilter || selectedFeaturedFilter || selectedNewFilter || selectedDiscountFilter) && (
      <button
       onClick={() => {
        onCategoryChange(null);
        onSubCategoryChange(null);
        onStockFilterChange(null);
        onFeaturedFilterChange(null);
        onNewFilterChange(null);
        onDiscountFilterChange(null);
       }}
       className="px-6 py-3 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
      >
       <HiX className="w-5 h-5" />
       Filtreleri Temizle
      </button>
     )}
    </div>
   </div>

   {filteredProducts.length === 0 ? (
    <div className="text-center py-12 text-gray-500">
     <MdInventory2 size={64} className="mx-auto mb-4 text-gray-300" />
     <p className="text-lg font-semibold">
      {products.length === 0 ? "Henüz ürün eklenmemiş" : "Filtreye uygun ürün bulunamadı"}
     </p>
     <p className="text-sm">
      {products.length === 0 ? "Yeni ürün eklemek için yukarıdaki butona tıklayın" : "Farklı bir kategori seçmeyi deneyin"}
     </p>
    </div>
   ) : (
    <div className="overflow-x-auto">
     <table className="w-full">
      <thead className="bg-gray-50">
       <tr>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ürün</th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kategori</th>
        <th
         className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none"
         onClick={() => handleSort('price')}
        >
         <div className="flex items-center gap-2">
          Fiyat (₺)
          {sortBy === 'price' && (
           sortOrder === 'asc' ? <MdArrowUpward size={16} className="text-indigo-600" /> : <MdArrowDownward size={16} className="text-indigo-600" />
          )}
         </div>
        </th>
        <th
         className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none"
         onClick={() => handleSort('stock')}
        >
         <div className="flex items-center gap-2">
          Stok
          {sortBy === 'stock' && (
           sortOrder === 'asc' ? <MdArrowUpward size={16} className="text-indigo-600" /> : <MdArrowDownward size={16} className="text-indigo-600" />
          )}
         </div>
        </th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Durum</th>
        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">İşlemler</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
       {sortedProducts.map((product) => {
        // Renk varyantlarını kontrol et
        const colorVariants = product.colors && Array.isArray(product.colors)
         ? product.colors.filter(c => typeof c === 'object' && c.serialNumber)
         : [];

        // İlk rengin bilgilerini al (görsel için)
        const firstColor = colorVariants.length > 0 ? colorVariants[0] : null;
        const displayImage = firstColor && firstColor.images && firstColor.images.length > 0
         ? firstColor.images[0]
         : (product.images?.[0] || null);

        // Tüm renk kodlarını birleştir
        const serialNumbers = colorVariants.length > 0
         ? colorVariants.map(c => c.serialNumber).join(', ')
         : (product.serialNumber || null);

        // Fiyat: Renk varyantları varsa en düşük fiyatı göster
        let displayPrice = product.price || 0;
        let displayDiscountPrice = product.discountPrice;
        if (colorVariants.length > 0) {
         const prices = colorVariants.map(c => c.price || product.price || 0);
         displayPrice = Math.min(...prices);
         const discountPrices = colorVariants.map(c => c.discountPrice !== undefined ? c.discountPrice : product.discountPrice).filter(p => p !== null && p !== undefined);
         if (discountPrices.length > 0) {
          displayDiscountPrice = Math.min(...discountPrices);
         }
        }

        // Stok: Renk varyantları varsa toplam stoku göster
        let displayStock = product.stock !== undefined ? Number(product.stock) || 0 : 0;
        if (colorVariants.length > 0) {
         displayStock = colorVariants.reduce((sum, color) => {
          return sum + (color.stock !== undefined ? Number(color.stock) || 0 : 0);
         }, 0);
        }

        // Stok durumu: En az bir renkte stok varsa "Stokta"
        const hasStock = colorVariants.length > 0
         ? colorVariants.some(c => (c.stock !== undefined ? Number(c.stock) || 0 : 0) > 0)
         : (displayStock > 0);

        const productUrl = getProductUrl(product, firstColor?.serialNumber);

        return (
         <tr key={product._id} className="hover:bg-gray-50">
          <td className="px-4 py-4">
           <div className="flex items-center gap-3">
            <Link href={productUrl} className="w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0 flex items-center justify-center p-1 hover:opacity-80 transition-opacity cursor-pointer">
             {displayImage ? (
              <Image src={displayImage} alt={product.name} width={64} height={64} className="w-16 h-16 object-contain" />
             ) : (
              <div className="w-16 h-16 flex items-center justify-center text-gray-400">
               <MdInventory2 size={28} />
              </div>
             )}
            </Link>
            <div>
             <div className="font-bold text-gray-900">{product.name}</div>
             <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
              {product.brand && (
               <span>
                {product.brand}
                {serialNumbers ? ` - ${serialNumbers}` : ''}
               </span>
              )}
              {!product.brand && serialNumbers && (
               <span className="font-mono text-gray-600">{serialNumbers}</span>
              )}
              {!product.brand && !serialNumbers && (
               <span className="text-gray-400 italic">Seri No: Yok</span>
              )}
             </div>
            </div>
           </div>
          </td>
          <td className="px-4 py-4 text-sm text-gray-700">
           <div className="font-semibold">{product.category}</div>
           <div className="text-xs text-gray-500">{product.subCategory || ""}</div>
          </td>
          <td className="px-4 py-4 text-sm">
           <div className="font-bold text-gray-900">{Number(displayPrice || 0).toFixed(2)}</div>
           {displayDiscountPrice ? (
            <div className="text-xs text-green-600 font-semibold">{Number(displayDiscountPrice || 0).toFixed(2)}</div>
           ) : null}
          </td>
          <td className="px-4 py-4 text-sm font-semibold">
           {displayStock || 0}
          </td>
          <td className="px-4 py-4">
           <div className="flex flex-col gap-2">
            {hasStock ? (
             <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
              <MdCheckCircle size={14} />
              Stokta
             </span>
            ) : (
             <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
              <HiX size={14} />
              Stok Yok
             </span>
            )}
            {product.isNewProduct && (
             <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              <MdNewReleases size={14} />
              Yeni Ürün
             </span>
            )}
            {product.isFeatured && (
             <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
              <MdStar size={14} />
              Öne Çıkan
             </span>
            )}
           </div>
          </td>
          <td className="px-4 py-4 text-right">
           <div className="flex gap-2 justify-end">
            <button
             onClick={() => onEdit(product)}
             className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
            >
             <MdEdit size={16} />
             Düzenle
            </button>
            <button
             onClick={() => onDelete(product._id)}
             className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
            >
             <MdDelete size={16} />
             Sil
            </button>
           </div>
          </td>
         </tr>
        );
       })}
      </tbody>
     </table>
    </div>
   )}
  </div>
 );
}
