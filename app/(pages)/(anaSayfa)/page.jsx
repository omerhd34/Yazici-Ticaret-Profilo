"use client";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import HeroSection from "@/app/components/home/HeroSection";
import FeaturesSection from "@/app/components/home/FeaturesSection";
import ProductSection from "@/app/components/home/ProductSection";
import BrandLogosSection from "@/app/components/home/BrandLogosSection";
import FAQSection from "@/app/components/home/FAQSection";

export default function AnaSayfa() {
 const [featuredProducts, setFeaturedProducts] = useState([]);
 const [newProducts, setNewProducts] = useState([]);
 const [discountedProducts, setDiscountedProducts] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  fetchProducts();
 }, []);

 const fetchProducts = async () => {
  try {
   const [featuredRes, newRes, discountedRes] = await Promise.all([
    axiosInstance.get("/api/products?isFeatured=true"),
    axiosInstance.get("/api/products?isNewProduct=true"),
    axiosInstance.get("/api/products?category=İndirimler"),
   ]);

   if (featuredRes.data.success) setFeaturedProducts(featuredRes.data.data);
   if (newRes.data.success) setNewProducts(newRes.data.data);
   if (discountedRes.data.success) setDiscountedProducts(discountedRes.data.data);
  } catch (error) {
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="min-h-screen bg-gray-50 overflow-x-hidden">
   <HeroSection />
   <FeaturesSection />
   <ProductSection
    title="Öne Çıkan Ürünler"
    description="En çok tercih edilen ürünlerimiz"
    products={featuredProducts}
    loading={loading}
    viewAllLink="/one-cikan-urunler"
   />
   <ProductSection
    title="Yeni Ürünler"
    description="Son eklenen ürünlerle en yenileri keşfedin"
    products={newProducts}
    loading={loading}
    viewAllLink="/kategori/yeniler"
   />
   <ProductSection
    title="İndirimli Ürünler"
    description="Özel fiyatlarla kaçırılmayacak fırsatlar"
    products={discountedProducts}
    loading={loading}
    viewAllLink="/kategori/indirim"
   />
   <BrandLogosSection />
   <FAQSection />
  </div>
 );
}
