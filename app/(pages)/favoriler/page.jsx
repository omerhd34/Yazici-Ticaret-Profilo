"use client";
import { useState, useLayoutEffect } from "react";
import { useCart } from "@/context/CartContext";
import FavoritesLoading from "@/app/components/favorites/FavoritesLoading";
import FavoritesEmpty from "@/app/components/favorites/FavoritesEmpty";
import FavoritesHeader from "@/app/components/favorites/FavoritesHeader";
import FavoritesGrid from "@/app/components/favorites/FavoritesGrid";

export default function FavorilerPage() {
 const { favorites } = useCart();
 const [isClient, setIsClient] = useState(false);

 useLayoutEffect(() => {
  setIsClient(true);
 }, []);

 if (!isClient) {
  return <FavoritesLoading />;
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
