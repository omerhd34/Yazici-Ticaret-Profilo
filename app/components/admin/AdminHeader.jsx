"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { HiLogout } from "react-icons/hi";
import axiosInstance from "@/lib/axios";

const AdminHeader = () => {
 const router = useRouter();
 const pathname = usePathname();
 const [isAuthenticated, setIsAuthenticated] = useState(false);

 useEffect(() => {
  const checkAuth = async () => {
   try {
    const res = await axiosInstance.get("/api/auth/check");
    const data = res.data;
    setIsAuthenticated(data.authenticated || false);
   } catch (error) {
    setIsAuthenticated(false);
   }
  };

  checkAuth();
 }, []);

 const handleLogout = async () => {
  try {
   await axiosInstance.post("/api/auth/logout");
   router.push("/admin-giris");
  } catch (error) {
   console.error("Çıkış yapılamadı:", error);
  }
 };

 return (
  <header className="w-full bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
   <div className="container mx-auto px-4 py-3">
    <div className="flex justify-between items-center gap-4">
     <Link href="/admin" className="flex items-center group shrink-0">
      <div className="flex flex-col leading-tight">
       <span className="font-[Open_Sans] text-2xl md:text-3xl font-extrabold tracking-[0.2em] text-indigo-600 transition-colors duration-1000 ease-out group-hover:text-blue-900 select-none">
        YAZICI TİCARET
       </span>
      </div>
     </Link>
     <nav className="hidden lg:flex items-center gap-1">
      <Link
       href="/admin/son-siparisler"
       className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${pathname?.startsWith("/admin/son-siparisler")
        ? "bg-indigo-100 text-indigo-700 font-semibold"
        : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
        }`}
      >
       Siparişler
      </Link>
      <Link
       href="/admin/urun-yonetimi"
       className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${pathname?.startsWith("/admin/urun-yonetimi")
        ? "bg-indigo-100 text-indigo-700 font-semibold"
        : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
        }`}
      >
       Ürünler
      </Link>
      <Link
       href="/admin/mesajlar"
       className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${pathname?.startsWith("/admin/mesajlar")
        ? "bg-indigo-100 text-indigo-700 font-semibold"
        : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
        }`}
      >
       Mesajlar
      </Link>
      <Link
       href="/admin/urun-istekleri"
       className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${pathname?.startsWith("/admin/urun-istekleri")
        ? "bg-indigo-100 text-indigo-700 font-semibold"
        : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
        }`}
      >
       Ürün İstekleri
      </Link>
     </nav>
     <div className="flex items-center gap-4">
      {isAuthenticated && (
       <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100 active:bg-red-200 border border-red-200 hover:border-red-300 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow cursor-pointer"
       >
        <HiLogout size={20} />
        <span className="hidden sm:inline">Çıkış Yap</span>
       </button>
      )}
     </div>
    </div>
   </div>
  </header>
 );
};

export default AdminHeader;

