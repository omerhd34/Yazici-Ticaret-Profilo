"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminFooter from "../../components/admin/AdminFooter";

export default function AdminLayout({ children }) {
 const router = useRouter();
 const [isAuthenticated, setIsAuthenticated] = useState(false);
 const [authLoading, setAuthLoading] = useState(true);

 useEffect(() => {
  const checkAuth = async () => {
   try {
    const res = await axiosInstance.get("/api/auth/check");
    const data = res.data;
    if (data.authenticated) {
     setIsAuthenticated(true);
    } else {
     router.replace("/admin-giris");
    }
   } catch {
    router.replace("/admin-giris");
   } finally {
    setAuthLoading(false);
   }
  };

  checkAuth();
 }, [router]);

 if (authLoading || !isAuthenticated) {
  return (
   <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
     <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
     <p className="text-gray-600 font-semibold">
      {authLoading ? "Yükleniyor..." : "Admin girişe yönlendiriliyor..."}
     </p>
    </div>
   </div>
  );
 }

 return (
  <div className="min-h-screen flex flex-col bg-gray-50">
   <AdminHeader />
   <div className="flex-1">
    {children}
   </div>
   <AdminFooter />
  </div>
 );
}

