"use client";

export default function ProductLoading() {
 return (
  <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8 lg:py-12">
   <div className="container mx-auto px-3 sm:px-4 md:px-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
     <div className="space-y-3 sm:space-y-4">
      <div className="aspect-square bg-gray-200 rounded-lg sm:rounded-xl animate-pulse"></div>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
       {[...Array(4)].map((_, i) => (
        <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
       ))}
      </div>
     </div>
     <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <div className="h-6 sm:h-7 md:h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
      <div className="h-8 sm:h-10 md:h-12 bg-gray-200 rounded animate-pulse w-1/2"></div>
      <div className="h-20 sm:h-22 md:h-24 bg-gray-200 rounded animate-pulse"></div>
     </div>
    </div>
   </div>
  </div>
 );
}
