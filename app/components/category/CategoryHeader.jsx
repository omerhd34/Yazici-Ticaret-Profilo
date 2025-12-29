"use client";

export default function CategoryHeader({ categoryName, productCount }) {
 return (
  <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white py-6 sm:py-8 md:py-10 lg:py-12">
   <div className="container mx-auto px-3 sm:px-4 md:px-6">
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">{categoryName}</h1>
    <p className="text-sm sm:text-base text-indigo-100">
     {productCount} ürün bulundu
    </p>
   </div>
  </div>
 );
}
