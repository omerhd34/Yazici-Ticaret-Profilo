"use client";
import Link from "next/link";
import Image from "next/image";
import { HiSparkles, HiTag, HiGift } from "react-icons/hi";

export default function HeroSection() {
 return (
  <section className="relative bg-linear-to-r from-indigo-600 to-purple-600 text-white overflow-hidden">
   <div className="absolute inset-0 bg-black/10"></div>
   <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-12 lg:pt-16 xl:pt-20 2xl:pt-24 pb-6 sm:pb-8 md:pb-12 lg:pb-16 xl:pb-20 2xl:pb-24 relative z-10 mb-10">
    <div className="flex flex-col lg:flex-row items-center lg:items-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16">
     <div className="flex-1 w-full lg:max-w-3xl xl:max-w-4xl text-center lg:text-left lg:flex lg:flex-col lg:justify-center">
      <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/20 backdrop-blur-sm px-2.5 sm:px-4 py-1 sm:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-semibold mb-2 sm:mb-3 md:mb-4 w-fit">
       <HiSparkles size={12} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" />
       <span className="whitespace-nowrap">Hızlı ve Güvenilir Teslimat</span>
      </span>
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black mb-3 sm:mb-4 md:mb-6 leading-tight">
       Yazıcı Ticaret
       <br />
       <span className="text-yellow-300">Kalite ve Güven</span>
      </h1>
      <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-8 text-indigo-100 px-2 sm:px-0">
       Beyaz eşyadan elektroniğe, ankastre ürünlerden klimalara kadar geniş ürün yelpazemizle evinizin her köşesi için ihtiyacınız olan tüm ürünleri tek bir yerden bulabilirsiniz. Kaliteli markalar, uygun fiyatlar ve güvenilir hizmet anlayışımızla yanınızdayız.
      </p>

      <div className="flex flex-col sm:flex-row sm:flex-nowrap justify-center lg:justify-start items-center gap-2.5 sm:gap-3 md:gap-4">
       <Link
        href="/kategori/indirim"
        className="bg-white text-indigo-600 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg hover:bg-yellow-300 hover:text-gray-900 transition-all duration-500 ease-in-out inline-flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg whitespace-nowrap"
       >
        <HiTag size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" /> İndirimleri Keşfet
       </Link>
      </div>
     </div>
     <div className="hidden lg:flex flex-1 max-w-2xl xl:max-w-3xl ml-auto w-full lg:items-center lg:justify-end">
      <div className="relative flex justify-end w-full">
       <Image
        src="/products/ankastre/ankastre.jpg"
        alt="PROFILO"
        width={1200}
        height={800}
        className="w-full h-auto object-contain border-4 rounded-2xl lg:rounded-3xl xl:rounded-4xl"
        priority
       />
      </div>
     </div>
    </div>
   </div>

   {/* Decorative Elements */}
   <div className="hidden sm:block absolute -bottom-18 left-0 right-0 overflow-hidden ">
    <svg
     viewBox="0 0 1440 140"
     xmlns="http://www.w3.org/2000/svg"
     className="w-full h-auto"
     preserveAspectRatio="none"
    >
     <defs>
      <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
       <stop offset="0%" stopColor="#ffffff" />
       <stop offset="100%" stopColor="#F9FAFB" />
      </linearGradient>
     </defs>

     <path
      d="M-100,90 C0,70 120,40 260,42 C400,44 520,80 660,72 C800,64 920,40 1060,44 C1200,48 1320,70 1540,60 L1540,140 L-100,140 Z"
      fill="url(#waveGradient)"
     />
    </svg>
   </div>
  </section>
 );
}
