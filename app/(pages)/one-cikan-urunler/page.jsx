"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import ProductCard from "@/app/components/ui/ProductCard";
import Link from "next/link";
import { MdInventory2 } from "react-icons/md";
import { HiX as HiXIcon } from "react-icons/hi";
import BrandFilter from "@/app/components/category/BrandFilter";
import CategoryFilter from "@/app/components/category/CategoryFilter";
import CategoryToolbar from "@/app/components/category/CategoryToolbar";
import PriceFilter from "@/app/components/category/PriceFilter";

export default function OneCikanUrunlerPage() {
 const [products, setProducts] = useState([]);
 const [filteredProducts, setFilteredProducts] = useState([]);
 const [loading, setLoading] = useState(true);
 const [isAdmin, setIsAdmin] = useState(false);
 const [selectedBrands, setSelectedBrands] = useState([]);
 const [selectedCategories, setSelectedCategories] = useState([]);
 const [availableBrands, setAvailableBrands] = useState([]);
 const [availableCategories, setAvailableCategories] = useState([]);
 const [showFilters, setShowFilters] = useState(false);
 const [sortBy, setSortBy] = useState("-createdAt");
 const [minPrice, setMinPrice] = useState("");
 const [maxPrice, setMaxPrice] = useState("");

 useEffect(() => {
  fetchProducts();
  checkAdmin();
 }, []);

 const applyFilters = useCallback(() => {
  let filtered = [...products];

  // Brand filter
  if (selectedBrands.length > 0) {
   filtered = filtered.filter((p) => selectedBrands.includes(p.brand));
  }

  // Category filter
  if (selectedCategories.length > 0) {
   filtered = filtered.filter((p) => selectedCategories.includes(p.category));
  }

  // Price filter
  if (minPrice) {
   filtered = filtered.filter((p) => {
    const finalPrice = (p.discountPrice && p.discountPrice < p.price) ? p.discountPrice : p.price;
    return finalPrice >= parseFloat(minPrice);
   });
  }
  if (maxPrice) {
   filtered = filtered.filter((p) => {
    const finalPrice = (p.discountPrice && p.discountPrice < p.price) ? p.discountPrice : p.price;
    return finalPrice <= parseFloat(maxPrice);
   });
  }

  // Sort products
  filtered.sort((a, b) => {
   switch (sortBy) {
    case "price": {
     // Fiyat: Düşükten Yükseğe (indirimli fiyat varsa onu kullan)
     const priceA = (a.discountPrice && a.discountPrice < a.price) ? a.discountPrice : a.price;
     const priceB = (b.discountPrice && b.discountPrice < b.price) ? b.discountPrice : b.price;
     return priceA - priceB;
    }
    case "-price": {
     // Fiyat: Yüksekten Düşüğe (indirimli fiyat varsa onu kullan)
     const priceA = (a.discountPrice && a.discountPrice < a.price) ? a.discountPrice : a.price;
     const priceB = (b.discountPrice && b.discountPrice < b.price) ? b.discountPrice : b.price;
     return priceB - priceA;
    }
    case "-rating": {
     // En Yüksek Puan
     const ratingA = a.rating || 0;
     const ratingB = b.rating || 0;
     return ratingB - ratingA;
    }
    case "-soldCount": {
     // En Çok Satan
     const soldA = a.soldCount || 0;
     const soldB = b.soldCount || 0;
     return soldB - soldA;
    }
    case "-createdAt":
    default: {
     // Yeni Ürünler (varsayılan)
     const dateA = new Date(a.createdAt || 0).getTime();
     const dateB = new Date(b.createdAt || 0).getTime();
     return dateB - dateA;
    }
   }
  });

  setFilteredProducts(filtered);
 }, [products, selectedBrands, selectedCategories, sortBy, minPrice, maxPrice]);

 useEffect(() => {
  applyFilters();
 }, [applyFilters]);

 const checkAdmin = async () => {
  try {
   const res = await fetch("/api/auth/check");
   const data = await res.json();
   setIsAdmin(data.authenticated || false);
  } catch (error) {
   setIsAdmin(false);
  }
 };

 const fetchProducts = async () => {
  try {
   const res = await fetch("/api/products?isFeatured=true&limit=1000");
   const data = await res.json();

   if (data.success) {
    setProducts(data.data);

    // Extract unique brands
    const brands = [...new Set(data.data.map((p) => p.brand).filter(Boolean))].sort();
    setAvailableBrands(brands);

    // Extract unique categories
    const categories = [...new Set(data.data.map((p) => p.category).filter(Boolean))].sort();
    setAvailableCategories(categories);
   }
  } catch (error) {
  } finally {
   setLoading(false);
  }
 };

 const handleBrandToggle = (brand) => {
  setSelectedBrands((prev) =>
   prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
  );
 };

 const handleCategoryToggle = (category) => {
  setSelectedCategories((prev) =>
   prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
  );
 };

 const clearFilters = () => {
  setSelectedBrands([]);
  setSelectedCategories([]);
  setMinPrice("");
  setMaxPrice("");
 };

 const activeFilterCount = selectedBrands.length + selectedCategories.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

 return (
  <div className="min-h-screen bg-gray-50">
   {/* Header */}
   <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white py-12">
    <div className="container mx-auto px-4">
     <h1 className="text-4xl font-black mb-2">Öne Çıkan Ürünler</h1>
     <p className="text-indigo-100">
      {loading ? "Yükleniyor..." : `${filteredProducts.length} öne çıkan ürün bulundu`}
     </p>
    </div>
   </div>

   <div className="container mx-auto px-4 py-8">
    {/* Filter Toggle Button (Mobile) */}
    <div className="lg:hidden mb-6">
     <button
      onClick={() => setShowFilters(!showFilters)}
      className="w-full bg-white rounded-xl shadow-sm px-4 py-3 flex items-center justify-between font-semibold text-gray-700 hover:bg-gray-50 transition"
     >
      <span>Filtreler</span>
      {activeFilterCount > 0 && (
       <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
        {activeFilterCount}
       </span>
      )}
     </button>
    </div>

    <div className="flex gap-6">
     {/* Filters Sidebar */}
     <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-72 shrink-0 mb-6 lg:mb-0`}>
      <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
       <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg">Filtreler</h3>
        {activeFilterCount > 0 && (
         <button
          onClick={clearFilters}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
         >
          Temizle
         </button>
        )}
       </div>

       {/* Category Filter */}
       <CategoryFilter
        availableCategories={availableCategories}
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
       />

       {/* Price Filter */}
       <PriceFilter
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
       />

       {/* Brand Filter */}
       <BrandFilter
        availableBrands={availableBrands}
        selectedBrands={selectedBrands}
        onBrandToggle={handleBrandToggle}
       />

       {/* Active Filters Display */}
       {activeFilterCount > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
         <h4 className="font-semibold mb-3 text-sm text-gray-700">Aktif Filtreler</h4>
         <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
           <span
            key={category}
            className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold"
           >
            {category}
            <button
             onClick={() => handleCategoryToggle(category)}
             className="hover:text-indigo-900"
            >
             <HiXIcon size={14} />
            </button>
           </span>
          ))}
          {minPrice && (
           <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
            Min: {minPrice}₺
            <button
             onClick={() => setMinPrice("")}
             className="hover:text-green-900"
            >
             <HiXIcon size={14} />
            </button>
           </span>
          )}
          {maxPrice && (
           <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
            Max: {maxPrice}₺
            <button
             onClick={() => setMaxPrice("")}
             className="hover:text-green-900"
            >
             <HiXIcon size={14} />
            </button>
           </span>
          )}
          {selectedBrands.map((brand) => (
           <span
            key={brand}
            className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold"
           >
            {brand}
            <button
             onClick={() => handleBrandToggle(brand)}
             className="hover:text-purple-900"
            >
             <HiXIcon size={14} />
            </button>
           </span>
          ))}
         </div>
        </div>
       )}
      </div>
     </aside>

     {/* Products Grid */}
     <div className="flex-1">
      {/* Sort Toolbar */}
      {!loading && filteredProducts.length > 0 && (
       <CategoryToolbar
        sortBy={sortBy}
        onSortChange={setSortBy}
        onFiltersClick={() => setShowFilters(!showFilters)}
       />
      )}

      {loading ? (
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {[...Array(8)].map((_, i) => (
         <div
          key={i}
          className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse"
         >
          <div className="aspect-3/4 bg-gray-200"></div>
          <div className="p-4 space-y-3">
           <div className="h-4 bg-gray-200 rounded w-3/4"></div>
           <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
         </div>
        ))}
       </div>
      ) : filteredProducts.length === 0 ? (
       <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <MdInventory2 size={80} className="mx-auto text-gray-300 mb-4" />
        {activeFilterCount > 0 ? (
         <>
          <p className="text-gray-500 text-lg mb-4">Filtreye uygun ürün bulunamadı</p>
          <p className="text-gray-400 text-sm mb-6">
           Filtreleri temizleyerek tüm ürünleri görebilirsiniz
          </p>
          <button
           onClick={clearFilters}
           className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-semibold transition"
          >
           Filtreleri Temizle
          </button>
         </>
        ) : isAdmin ? (
         <>
          <p className="text-gray-500 text-lg mb-4">Henüz öne çıkan ürün eklenmemiş</p>
          <p className="text-gray-400 text-sm mb-6">
           Admin panelinden ürün düzenleyerek &quot;Öne Çıkan&quot; işaretleyebilirsiniz
          </p>
          <Link
           href="/admin/urun-yonetimi"
           className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-semibold transition"
          >
           Ürün Yönetimine Git
          </Link>
         </>
        ) : (
         <>
          <p className="text-gray-500 text-lg mb-4">Şu anda öne çıkan ürün bulunmamaktadır</p>
          <p className="text-gray-400 text-sm mb-6">
           Yakında yeni ürünler eklenecektir. Lütfen daha sonra tekrar kontrol edin.
          </p>
          <Link
           href="/"
           className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-semibold transition"
          >
           Ana Sayfaya Dön
          </Link>
         </>
        )}
       </div>
      ) : (
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {filteredProducts.map((product, index) => (
         <ProductCard key={product._id} product={product} priority={index < 6} />
        ))}
       </div>
      )}
     </div>
    </div>
   </div>
  </div>
 );
}

