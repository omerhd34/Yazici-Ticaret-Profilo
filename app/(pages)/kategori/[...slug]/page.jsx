"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { MENU_ITEMS } from "@/app/components/ui/Header";
import CategoryHeader from "@/app/components/category/CategoryHeader";
import CategoryToolbar from "@/app/components/category/CategoryToolbar";
import CategoryProducts from "@/app/components/category/CategoryProducts";
import CategoryFiltersSidebar from "@/app/components/category/CategoryFiltersSidebar";
import CategoryFiltersModal from "@/app/components/category/CategoryFiltersModal";

export default function KategoriPage() {
 const params = useParams();
 const router = useRouter();
 const slug = useMemo(() => {
  if (!params?.slug) return [];
  return Array.isArray(params.slug) ? params.slug : [params.slug];
 }, [params?.slug]);

 const [products, setProducts] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showFilters, setShowFilters] = useState(false);

 const [filters, setFilters] = useState({
  minPrice: "",
  maxPrice: "",
  sizes: [],
  brands: [],
  sortBy: "-createdAt",
 });

 const [availableBrands, setAvailableBrands] = useState([]);
 const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });


 const slugString = useMemo(() => slug.join('/'), [slug]);

 const fetchProducts = useCallback(async () => {
  setLoading(true);
  try {
   let category = "";
   let subCategory = "";
   let categorySlug = "";

   if (slug.length > 0) {
    // URL'den gelen kategori adını gerçek kategori adına çevir
    // Önce decode et (URL-encoded karakterler için)
    categorySlug = decodeURIComponent(slug[0]);
    const categoryMap = {
     giyim: "Giyim",
     ayakkabi: "Ayakkabı",
     aksesuar: "Aksesuar",
     yeni: "YENİ GELENLER",
     indirim: "İndirimler"
    };
    category = categoryMap[categorySlug] || categorySlug;

    if (slug.length > 1) {
     // Alt kategori slug'ını gerçek alt kategori adına çevir
     const subCategorySlug = decodeURIComponent(slug[1]);
     // MENU_ITEMS'den alt kategori adını bul
     const menuItem = MENU_ITEMS.find(item => {
      const itemPath = item.path.replace('/kategori/', '');
      return itemPath === categorySlug || itemPath.startsWith(categorySlug + '/');
     });

     if (menuItem && menuItem.subCategories) {
      const subCat = menuItem.subCategories.find(
       sub => sub.path.replace(`/kategori/${categorySlug}/`, '').replace(/-/g, '') === subCategorySlug.replace(/-/g, '')
      );
      if (subCat) {
       subCategory = subCat.name;
      } else {
       // Eğer bulunamazsa, slug'ı formatla (ilk harfi büyük, tireleri boşluk yap)
       subCategory = subCategorySlug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      }
     } else {
      // Alt kategori mapping yoksa slug'ı formatla
      subCategory = subCategorySlug
       .replace(/-/g, ' ')
       .replace(/\b\w/g, l => l.toUpperCase());
     }
    }
   }

   let url = "/api/products?limit=50";

   // Özel kategoriler için özel filtreleme
   if (categorySlug === "yeni") {
    // Yeni ürünler için isNew parametresi ekle
    url += `&isNew=true`;
   } else if (categorySlug === "indirim") {
    // İndirimli ürünler için kategori parametresi ekle
    url += `&category=${encodeURIComponent(category)}`;
   } else {
    // Normal kategoriler için kategori filtresi ekle
    if (category) url += `&category=${encodeURIComponent(category)}`;
   }

   if (subCategory) url += `&subCategory=${encodeURIComponent(subCategory)}`;
   if (filters.sortBy) url += `&sort=${filters.sortBy}`;

   const res = await fetch(url);
   const data = await res.json();

   if (data.success) {
    let filteredProducts = data.data;

    // İndirimli ürünler için client-side filtreleme (price'dan küçük olmalı)
    if (categorySlug === "indirim") {
     filteredProducts = filteredProducts.filter(p =>
      p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price
     );
    }

    // Price filter
    if (filters.minPrice) {
     filteredProducts = filteredProducts.filter(
      (p) => {
       const finalPrice = (p.discountPrice && p.discountPrice < p.price) ? p.discountPrice : p.price;
       return finalPrice >= parseFloat(filters.minPrice);
      }
     );
    }
    if (filters.maxPrice) {
     filteredProducts = filteredProducts.filter(
      (p) => {
       const finalPrice = (p.discountPrice && p.discountPrice < p.price) ? p.discountPrice : p.price;
       return finalPrice <= parseFloat(filters.maxPrice);
      }
     );
    }

    // Size filter
    if (filters.sizes.length > 0) {
     filteredProducts = filteredProducts.filter((p) => {
      if (!p.sizes || !Array.isArray(p.sizes) || p.sizes.length === 0) {
       return false;
      }
      // Beden değerlerini string'e çevir ve karşılaştır
      return p.sizes.some((size) => {
       const sizeStr = String(size).trim();
       return filters.sizes.includes(sizeStr) || filters.sizes.some(fs => String(fs).trim() === sizeStr);
      });
     });
    }

    // Brand filter
    if (filters.brands.length > 0) {
     filteredProducts = filteredProducts.filter((p) =>
      filters.brands.includes(p.brand)
     );
    }

    setProducts(filteredProducts);

    // Extract unique brands
    const brands = [...new Set(data.data.map((p) => p.brand).filter(Boolean))];
    setAvailableBrands(brands);

    // Calculate price range
    if (data.data.length > 0) {
     const prices = data.data.map((p) => {
      // Sadece gerçek indirim varsa discountPrice kullan
      return (p.discountPrice && p.discountPrice < p.price) ? p.discountPrice : p.price;
     });
     setPriceRange({
      min: Math.min(...prices),
      max: Math.max(...prices),
     });
    }
   }
  } catch (error) {
  } finally {
   setLoading(false);
  }
 }, [slugString, filters.sortBy, filters.sizes, filters.brands, filters.minPrice, filters.maxPrice]);

 useEffect(() => {
  fetchProducts();
 }, [fetchProducts]);

 const handleSizeToggle = (size) => {
  setFilters((prev) => ({
   ...prev,
   sizes: prev.sizes.includes(size)
    ? prev.sizes.filter((s) => s !== size)
    : [...prev.sizes, size],
  }));
 };

 const handleBrandToggle = (brand) => {
  setFilters((prev) => ({
   ...prev,
   brands: prev.brands.includes(brand)
    ? prev.brands.filter((b) => b !== brand)
    : [...prev.brands, brand],
  }));
 };

 const clearFilters = () => {
  setFilters({
   minPrice: "",
   maxPrice: "",
   sizes: [],
   brands: [],
   sortBy: "-createdAt",
  });

  // Eğer alt kategori seçiliyse, ana kategoriye yönlendir
  if (slug.length > 1) {
   const categorySlug = decodeURIComponent(slug[0]);
   router.push(`/kategori/${categorySlug}`);
  }

  // useEffect otomatik olarak fetchProducts'ı tetikleyecek
 };

 const categoryNames = {
  giyim: "Giyim",
  ayakkabi: "Ayakkabı",
  aksesuar: "Aksesuar",
  yeni: "Yeni Gelenler",
  indirim: "İndirimler",
 };

 const getCategoryName = () => {
  if (slug.length === 0) return "Tüm Ürünler";
  // URL-encoded karakterleri decode et
  const decodedSlug = decodeURIComponent(slug[0]);
  const mainCat = categoryNames[decodedSlug] || decodedSlug;
  if (slug.length > 1) {
   const decodedSubSlug = decodeURIComponent(slug[1]);
   return `${mainCat} - ${decodedSubSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`;
  }
  return mainCat;
 };

 // Kategoriye göre beden seçenekleri
 const getAvailableSizes = () => {
  const categorySlug = slug.length > 0 ? decodeURIComponent(slug[0]) : "";

  // İndirimler ve Yeni Gelenler sayfalarında tüm bedenler
  if (categorySlug === "indirim" || categorySlug === "yeni") {
   return ["XS", "S", "M", "L", "XL", "XXL", "3XL", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"];
  }

  // Ayakkabı kategorisinde sadece numaralar
  if (categorySlug === "ayakkabi") {
   return ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"];
  }

  return ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
 };

 const availableSizes = getAvailableSizes();

 return (
  <div className="min-h-screen bg-gray-50">
   <CategoryHeader categoryName={getCategoryName()} productCount={products.length} />
   <div className="container mx-auto px-4 py-8">
    <div className="flex gap-6">
     <CategoryFiltersSidebar
      slug={slug}
      filters={filters}
      availableSizes={availableSizes}
      availableBrands={availableBrands}
      onClearFilters={clearFilters}
      onMinPriceChange={(value) => setFilters({ ...filters, minPrice: value })}
      onMaxPriceChange={(value) => setFilters({ ...filters, maxPrice: value })}
      onSizeToggle={handleSizeToggle}
      onBrandToggle={handleBrandToggle}
     />

     <div className="flex-1">
      <CategoryToolbar
       sortBy={filters.sortBy}
       onSortChange={(value) => setFilters({ ...filters, sortBy: value })}
       onFiltersClick={() => setShowFilters(true)}
      />

      <CategoryProducts
       loading={loading}
       products={products}
       onClearFilters={clearFilters}
      />
     </div>
    </div>
   </div>

   <CategoryFiltersModal
    show={showFilters}
    slug={slug}
    filters={filters}
    availableSizes={availableSizes}
    availableBrands={availableBrands}
    onClose={() => setShowFilters(false)}
    onClearFilters={clearFilters}
    onMinPriceChange={(value) => setFilters({ ...filters, minPrice: value })}
    onMaxPriceChange={(value) => setFilters({ ...filters, maxPrice: value })}
    onSizeToggle={handleSizeToggle}
    onBrandToggle={handleBrandToggle}
   />
  </div>
 );
}
