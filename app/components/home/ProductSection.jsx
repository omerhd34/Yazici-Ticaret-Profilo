"use client";
import Link from "next/link";
import { HiArrowRight, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import ProductCard from "@/app/components/ui/ProductCard";
import { useState, useRef, useEffect } from "react";

export default function ProductSection({ title, description, products, loading, viewAllLink }) {
 const [showLeftArrow, setShowLeftArrow] = useState(false);
 const [showRightArrow, setShowRightArrow] = useState(true);
 const scrollContainerRef = useRef(null);
 const productCardRef = useRef(null);

 useEffect(() => {
  const updateArrows = () => {
   if (scrollContainerRef.current) {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
   }
  };

  const timeoutId = setTimeout(updateArrows, 100);
  const container = scrollContainerRef.current;

  if (container) {
   container.addEventListener('scroll', updateArrows);
   window.addEventListener('resize', updateArrows);
   return () => {
    clearTimeout(timeoutId);
    container.removeEventListener('scroll', updateArrows);
    window.removeEventListener('resize', updateArrows);
   };
  }
  return () => clearTimeout(timeoutId);
 }, [products, loading]);

 if (products.length === 0 && !loading) return null;

 const scroll = (direction) => {
  if (!scrollContainerRef.current) return;

  const container = scrollContainerRef.current;
  const cards = container.querySelectorAll('[data-product-card]');
  if (cards.length === 0) return;

  // İlk card'ın genişliğini al
  const firstCard = cards[0];
  const cardRect = firstCard.getBoundingClientRect();
  const cardWidth = cardRect.width;

  // Gap değerini hesapla - eğer ikinci card varsa, aralarındaki mesafeyi kullan
  let gapValue = 24;
  if (cards.length > 1) {
   const secondCard = cards[1];
   const firstCardRight = firstCard.offsetLeft + firstCard.offsetWidth;
   const secondCardLeft = secondCard.offsetLeft;
   gapValue = secondCardLeft - firstCardRight;
  }

  const scrollAmount = cardWidth + gapValue;

  const currentScroll = container.scrollLeft;
  const maxScroll = container.scrollWidth - container.clientWidth;

  let newPosition;
  if (direction === 'right') {
   newPosition = Math.min(currentScroll + scrollAmount, maxScroll);
  } else {
   newPosition = Math.max(currentScroll - scrollAmount, 0);
  }

  container.scrollTo({
   left: newPosition,
   behavior: 'smooth'
  });
 };

 const handleScroll = () => {
  if (scrollContainerRef.current) {
   const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
   setShowLeftArrow(scrollLeft > 10);
   setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  }
 };

 return (
  <section className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
    <div className="flex-1">
     <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2">{title}</h2>
     <p className="text-sm sm:text-base text-gray-600">{description}</p>
    </div>
    {viewAllLink && (
     <Link href={viewAllLink} className="text-indigo-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all text-sm sm:text-base -mb-10">
      Tümünü Gör <HiArrowRight size={18} className="sm:w-5 sm:h-5" />
     </Link>
    )}
   </div>

   <div className="relative">
    {loading ? (
     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 items-stretch">
      {[...Array(4)].map((_, i) => (
       <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
        <div className="aspect-square bg-gray-200"></div>
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
         <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
         <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
       </div>
      ))}
     </div>
    ) : (
     <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex gap-4 sm:gap-5 md:gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-2 -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-12 snap-x snap-mandatory"
     >
      {products.map((product, index) => (
       <div
        key={product._id}
        ref={index === 0 ? productCardRef : null}
        data-product-card
        className="shrink-0 w-[calc(100vw-2rem)] sm:w-[calc(50vw-2rem)] md:w-[calc(33.333vw-2rem)] lg:w-[calc(25vw-2.5rem)] xl:w-[calc(25vw-3rem)] snap-start"
       >
        <ProductCard product={product} priority={index < 4} />
       </div>
      ))}
     </div>
    )}

    {/* Slider navigasyon butonları  */}
    {!loading && products.length > 4 && (
     <div className="flex items-center justify-center gap-3 mt-6">
      <button
       onClick={() => scroll('left')}
       disabled={!showLeftArrow}
       className={`p-3 rounded-full transition-all duration-300 ${showLeftArrow
        ? 'bg-white text-indigo-600 border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 shadow-lg hover:shadow-xl hover:scale-110 cursor-pointer'
        : 'bg-gray-100 text-gray-300 border-2 border-gray-200 cursor-not-allowed opacity-60'
        }`}
       aria-label="Önceki ürünler"
      >
       <HiChevronLeft size={20} />
      </button>
      <button
       onClick={() => scroll('right')}
       disabled={!showRightArrow}
       className={`p-3 rounded-full transition-all duration-300 ${showRightArrow
        ? 'bg-white text-indigo-600 border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 shadow-lg hover:shadow-xl hover:scale-110 cursor-pointer'
        : 'bg-gray-100 text-gray-300 border-2 border-gray-200 cursor-not-allowed opacity-60'
        }`}
       aria-label="Sonraki ürünler"
      >
       <HiChevronRight size={20} />
      </button>
     </div>
    )}
   </div>
  </section>
 );
}
