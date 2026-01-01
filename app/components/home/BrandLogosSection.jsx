"use client";
import { useState } from "react";
import Image from "next/image";
import { HiShoppingBag } from "react-icons/hi";

export default function BrandLogosSection() {
 const brands = [
  { name: "Profilo", src: "/brands/profilo.png" },
  { name: "LG", src: "/brands/lg.png" },
 ];

 const [imageErrors, setImageErrors] = useState({});

 const handleImageError = (brandName) => {
  setImageErrors((prev) => ({ ...prev, [brandName]: true }));
 };

 return (
  <section className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
   <div className="max-w-6xl mx-auto">

    <div className="text-center mb-8 sm:mb-10 md:mb-12">
     <div className="flex items-center justify-center gap-3 mb-4">
      <HiShoppingBag className="text-indigo-600" size={32} />
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900">
       Satılan Markalar
      </h2>
     </div>
     <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
      Güvenilir markaların kaliteli ürünlerini sizlerle buluşturuyoruz.
     </p>
    </div>

    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
     {brands.map((brand, index) => {
      const logoPath = brand.src || `/logos/${brand.name.toLowerCase()}.png`;
      const hasError = imageErrors[brand.name];
      return (
       <div
        key={index}
        className="flex items-center justify-center p-4 sm:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-400 hover:shadow-xl transition-all duration-500 group w-36 h-28 sm:w-52 sm:h-44"
       >
        <div className="relative w-full h-full flex items-center justify-center p-2">
         {!hasError && logoPath ? (
          <Image
           src={logoPath}
           alt={brand.name}
           width={240}
           height={140}
           className="object-contain max-w-full max-h-full opacity-90 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110"
           onError={() => handleImageError(brand.name)}
          />
         ) : (
          <span className="text-gray-700 font-bold text-sm sm:text-base group-hover:text-indigo-600 transition-colors text-center">
           {brand.name}
          </span>
         )}
        </div>
       </div>
      );
     })}
    </div>
   </div>
  </section>
 );
}