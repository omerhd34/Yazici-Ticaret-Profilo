"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import axiosInstance from "@/lib/axios";
import FavoritesLoading from "@/app/components/favorites/FavoritesLoading";
import FavoritesEmpty from "@/app/components/favorites/FavoritesEmpty";
import FavoritesHeader from "@/app/components/favorites/FavoritesHeader";
import FavoritesGrid from "@/app/components/favorites/FavoritesGrid";

export default function FavorilerPage() {
 const router = useRouter();
 const { favorites } = useCart();
 const [isAuthenticated, setIsAuthenticated] = useState(false);
 const [authLoading, setAuthLoading] = useState(true);
 const [mounted, setMounted] = useState(false);

 // Component mount kontrolü
 useEffect(() => {
  setMounted(true);
 }, []);

 // Kullanıcı girişi kontrolü
 useEffect(() => {
  if (!mounted) return;

  const checkAuth = async () => {
   try {
    const res = await axiosInstance.get("/api/user/check", {
     cache: 'no-store',
    });

    const data = res.data;

    if (data.authenticated) {
     setIsAuthenticated(true);
    } else {
     // Kullanıcı giriş yapmamışsa giriş sayfasına yönlendir
     router.replace("/giris");
    }
   } catch (error) {
    // Hata durumunda da giriş sayfasına yönlendir
    router.replace("/giris");
   } finally {
    setAuthLoading(false);
   }
  };

  checkAuth();
 }, [router, mounted]);

 // Auth kontrolü tamamlanana kadar loading göster
 if (authLoading || !mounted) {
  return <FavoritesLoading />;
 }

 // Kullanıcı giriş yapmamışsa hiçbir şey gösterme (yönlendirme yapılacak)
 if (!isAuthenticated) {
  return null;
 }

 // Context'teki favorites direkt olarak ürün objelerini içeriyor
 const products = favorites || [];

 if (products.length === 0) {
  return <FavoritesEmpty />;
 }

 return (
  <div className="min-h-screen bg-gray-50 py-12">
   <div className="container mx-auto px-4">
    <FavoritesHeader productCount={products.length} />
    <FavoritesGrid products={products} />
   </div>
  </div>
 );
}
