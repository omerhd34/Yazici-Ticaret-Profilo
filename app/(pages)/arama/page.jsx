"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/app/components/ui/ProductCard";
import { HiSearch } from "react-icons/hi";

export default function AramaPage() {
 const searchParams = useSearchParams();
 const query = searchParams.get('q') || '';

 const [products, setProducts] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  if (query) {
   fetchProducts();
  } else {
   setProducts([]);
   setLoading(false);
  }
 }, [query]);

 const fetchProducts = async () => {
  setLoading(true);
  try {
   const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=100`);
   const data = await res.json();

   if (data.success) {
    setProducts(data.data);
   } else {
    setProducts([]);
   }
  } catch (error) {
   setProducts([]);
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="min-h-screen bg-gray-50 py-8">
   <div className="container mx-auto px-4">
    {/* Başlık */}
    <div className="mb-8">
     <h1 className="text-3xl font-bold text-gray-800 mb-2">
      Arama Sonuçları
     </h1>
     {query && (
      <p className="text-gray-600">
       <span className="font-semibold">&quot;{query}&quot;</span> için {products.length} sonuç bulundu
      </p>
     )}
    </div>

    {/* Sonuçlar */}
    {loading ? (
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      {[...Array(9)].map((_, i) => (
       <div
        key={i}
        className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse"
       >
        <div className="aspect-square bg-gray-200" />
        <div className="p-4 space-y-3">
         <div className="h-4 bg-gray-200 rounded w-3/4" />
         <div className="h-4 bg-gray-200 rounded w-1/2" />
         <div className="h-8 bg-gray-200 rounded" />
        </div>
       </div>
      ))}
     </div>
    ) : query && products.length === 0 ? (
     <div className="bg-white rounded-xl shadow-sm p-12 text-center">
      <HiSearch size={80} className="mx-auto text-gray-300 mb-4" />
      <p className="text-gray-500 text-lg mb-2">Sonuç bulunamadı</p>
      <p className="text-gray-400 text-sm">
       &quot;{query}&quot; için ürün bulunamadı. Farklı bir arama terimi deneyin.
      </p>
     </div>
    ) : !query ? (
     <div className="bg-white rounded-xl shadow-sm p-12 text-center">
      <HiSearch size={80} className="mx-auto text-gray-300 mb-4" />
      <p className="text-gray-500 text-lg mb-2">Arama yapın</p>
      <p className="text-gray-400 text-sm">
       Üst menüden ürün, kategori veya marka arayabilirsiniz.
      </p>
     </div>
    ) : (
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      {products.map((product, index) => (
       <ProductCard key={product._id} product={product} priority={index < 6} />
      ))}
     </div>
    )}
   </div>
  </div>
 );
}

