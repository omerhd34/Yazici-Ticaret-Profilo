"use client";
import "./globals.css";
import Link from "next/link";
import {
 HiExclamationCircle,
 HiRefresh,
 HiHome
} from "react-icons/hi";

export default function GlobalError({ reset }) {
 return (
  <html lang="tr">
   <body className="antialiased min-h-screen flex flex-col">
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-red-50/30 to-gray-50 flex items-center justify-center px-4 py-12">
     <div className="max-w-4xl w-full">
      <div className="text-center mb-8">
       <div className="relative inline-block">
        <h1 className="text-7xl md:text-[7rem] font-black text-transparent bg-clip-text bg-linear-to-r from-red-600 via-orange-600 to-red-600 animate-pulse">
         500
        </h1>
        <div className="absolute -top-4 -right-4 animate-bounce delay-75">
         <HiExclamationCircle className="text-6xl text-red-400 opacity-60" />
        </div>
       </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 animate-fadeIn">
       {/* Error Message */}
       <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
         Kritik Hata
        </h2>
        <p className="text-lg text-gray-600 mb-2">
         Uygulamada beklenmeyen bir hata oluştu.
        </p>
        <p className="text-base text-gray-500">
         Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
        </p>
       </div>

       {/* Action Buttons */}
       <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
        <button
         onClick={reset}
         className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
        >
         <HiRefresh className="h-5 w-5" />
         Tekrar Dene
        </button>
        <Link
         href="/"
         className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
        >
         <HiHome className="h-5 w-5" />
         Ana Sayfa
        </Link>
       </div>

       {/* Support Link */}
       <div className="text-center">
        <p className="text-sm text-gray-500">
         Sorun devam ediyorsa{" "}
         <Link href="/destek" className="text-indigo-600 hover:text-indigo-700 font-semibold underline">
          Destek
         </Link>
         {" "}sayfamızdan bize ulaşabilirsiniz.
        </p>
       </div>
      </div>
     </div>
    </div>
   </body>
  </html>
 );
}

