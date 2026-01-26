"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { HiArrowRight, HiCalendar } from "react-icons/hi";
import axiosInstance from "@/lib/axios";

// Force dynamic rendering - tamamen client-side
export const dynamic = 'force-dynamic';
import { MENU_ITEMS } from "@/app/utils/menuItems";
import { useCart } from "@/context/CartContext";
import { useComparison } from "@/context/ComparisonContext";
import CategoryHeader from "@/app/components/category/CategoryHeader";
import CategoryToolbar from "@/app/components/category/CategoryToolbar";
import CategoryProducts from "@/app/components/category/CategoryProducts";
import CategoryFiltersSidebar from "@/app/components/category/CategoryFiltersSidebar";
import CategoryFiltersModal from "@/app/components/category/CategoryFiltersModal";
import ProductBreadcrumb from "@/app/components/product/ProductBreadcrumb";
import ProductImageGallery from "@/app/components/product/ProductImageGallery";
import ProductRating from "@/app/components/product/ProductRating";
import ProductPrice from "@/app/components/product/ProductPrice";
import ProductColorSelector from "@/app/components/product/ProductColorSelector";
import ProductQuantitySelector from "@/app/components/product/ProductQuantitySelector";
import ProductActions from "@/app/components/product/ProductActions";
import ProductFeatures from "@/app/components/product/ProductFeatures";
import ProductAllFeatures from "@/app/components/product/ProductAllFeatures";
import ProductImportantFeatures from "@/app/components/product/ProductImportantFeatures";
import ProductBundleItems from "@/app/components/product/ProductBundleItems";
import ProductSimilarProducts from "@/app/components/product/ProductSimilarProducts";
import ProductLoading from "@/app/components/product/ProductLoading";
import ProductNotFound from "@/app/components/product/ProductNotFound";
import Toast from "@/app/components/ui/Toast";
import { ProductSchema, BreadcrumbSchema } from "@/app/components/seo/StructuredData";
import { getProductUrl } from "@/app/utils/productUrl";

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
  brands: [],
  categories: [],
  bagTypes: [],
  screenSizes: [],
  coolingCapacities: [],
  specialFilters: [],
  sortBy: "-createdAt",
 });

 const [availableBrands, setAvailableBrands] = useState([]);
 const [availableCategories, setAvailableCategories] = useState([]);
 const [availableScreenSizes, setAvailableScreenSizes] = useState([]);
 const [availableCoolingCapacities, setAvailableCoolingCapacities] = useState([]);
 const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });

 // Ürün detay sayfası için state'ler
 const [product, setProduct] = useState(null);
 const [selectedImage, setSelectedImage] = useState(0);
 const [selectedColor, setSelectedColor] = useState(null);
 const [selectedColorObj, setSelectedColorObj] = useState(null);
 const [quantity, setQuantity] = useState(1);
 const [addedToCart, setAddedToCart] = useState(false);
 const [canRate, setCanRate] = useState(false);
 const [userRating, setUserRating] = useState(0);
 const [hoverRating, setHoverRating] = useState(0);
 const [ratingSubmitted, setRatingSubmitted] = useState(false);
 const [checkingRating, setCheckingRating] = useState(true);
 const [ratingMessage, setRatingMessage] = useState("");
 const [toast, setToast] = useState({ show: false, message: "", type: "success" });

 // Kampanyalar için state'ler
 const [campaignsData, setCampaignsData] = useState([]);
 const [campaignsLoading, setCampaignsLoading] = useState(true);

 const { addToCart, addToFavorites, removeFromFavorites, isFavorite } = useCart();
 const { addToComparison, removeFromComparison, isInComparison } = useComparison();

 const isProductDetailPage = useMemo(() => {
  if (slug.length === 3) {
   return true;
  } else if (slug.length === 2) {
   const lastPart = slug[1];
   const serialNumberPattern = /^[A-Z0-9]+$/;
   return serialNumberPattern.test(lastPart);
  }
  return false;
 }, [slug]);

 const fetchProducts = useCallback(async () => {
  // Sadece browser'da çalıştır
  if (typeof window === 'undefined') return;

  setLoading(true);
  try {
   let category = "";
   let subCategory = "";
   let categorySlug = "";
   let mainMenuItem = null;

   if (slug.length > 0) {
    categorySlug = decodeURIComponent(slug[0]);

    mainMenuItem = MENU_ITEMS.find(item => {
     const itemPath = item.path.replace('/kategori/', '');
     return itemPath === categorySlug || itemPath === categorySlug.replace(/-/g, '-');
    });

    if (mainMenuItem) {
     category = mainMenuItem.name;
    } else {
     for (const menuItem of MENU_ITEMS) {
      if (menuItem.subCategories) {
       const subCat = menuItem.subCategories.find(sub => {
        const subPath = sub.path.replace('/kategori/', '');
        return subPath === categorySlug;
       });
       if (subCat) {
        category = subCat.name;
        mainMenuItem = menuItem;
        break;
       }
      }
     }

     if (!category) {
      const categoryMap = {
       yeni: "YENİ GELENLER",
       yeniler: "YENİLER",
       indirim: "İndirimler"
      };
      category = categoryMap[categorySlug] || categorySlug;
     }
    }

    if (slug.length > 1) {
     const subCategorySlug = decodeURIComponent(slug[1]);
     if (!mainMenuItem) {
      mainMenuItem = MENU_ITEMS.find(item => {
       const itemPath = item.path.replace('/kategori/', '');
       return itemPath === categorySlug || itemPath.startsWith(categorySlug + '/');
      });
     }

     if (mainMenuItem && mainMenuItem.subCategories) {
      const subCat = mainMenuItem.subCategories.find(
       sub => {
        const subPath = sub.path.replace(`/kategori/${categorySlug}/`, '').replace(/-/g, '');
        return subPath === subCategorySlug.replace(/-/g, '');
       }
      );
      if (subCat) {
       subCategory = subCat.name;
      } else {
       subCategory = subCategorySlug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      }
     } else {
      subCategory = subCategorySlug
       .replace(/-/g, ' ')
       .replace(/\b\w/g, l => l.toUpperCase());
     }
    }
   }

   let url = "/api/products?limit=1000";

   if (categorySlug === "yeni" || categorySlug === "yeniler") {
    url += `&isNewProduct=true`;
   } else if (categorySlug === "indirim") {
    url += `&category=${encodeURIComponent(category)}`;
   } else {
    if (category) url += `&category=${encodeURIComponent(category)}`;
   }

   if (subCategory) url += `&subCategory=${encodeURIComponent(subCategory)}`;

   if (filters.sortBy && !filters.sortBy.startsWith('filter:')) {
    url += `&sort=${filters.sortBy}`;
   }

   const res = await axiosInstance.get(url);
   const data = res.data;

   if (data.success) {
    let filteredProducts = data.data;

    if (categorySlug === "indirim") {
     filteredProducts = filteredProducts.filter(p =>
      p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price
     );
    }

    if (filters.minPrice && filters.minPrice !== "") {
     const minPriceValue = parseFloat(filters.minPrice);
     if (!isNaN(minPriceValue)) {
      filteredProducts = filteredProducts.filter(
       (p) => {
        const finalPrice = (p.discountPrice && p.discountPrice < p.price) ? p.discountPrice : p.price;
        return finalPrice >= minPriceValue;
       }
      );
     }
    }
    if (filters.maxPrice && filters.maxPrice !== "") {
     const maxPriceValue = parseFloat(filters.maxPrice);
     if (!isNaN(maxPriceValue)) {
      filteredProducts = filteredProducts.filter(
       (p) => {
        const finalPrice = (p.discountPrice && p.discountPrice < p.price) ? p.discountPrice : p.price;
        return finalPrice <= maxPriceValue;
       }
      );
     }
    }


    // Brand filter
    if (filters.brands.length > 0) {
     filteredProducts = filteredProducts.filter((p) =>
      filters.brands.includes(p.brand)
     );
    }

    // Bag type filter (only for elektrikli-supurge category)
    if (categorySlug === "elektrikli-supurge" && filters.bagTypes.length > 0) {
     filteredProducts = filteredProducts.filter((p) => {
      // Ürünün specifications'ını kontrol et
      const allSpecs = [
       ...(p.specifications || []),
       ...(p.colors?.[0]?.specifications || [])
      ];

      // "Filtreleme sistemi" key'inde "torbalı" veya "torbasız" ara
      let hasBagType = false;
      for (const spec of allSpecs) {
       if (spec.items) {
        for (const item of spec.items) {
         const key = (item.key || "").toLowerCase();
         const value = (item.value || "").toLowerCase();

         // Key'de "filtreleme sistemi" ara
         if (key.includes("filtreleme") && key.includes("sistemi")) {
          // Value'da "torbalı" veya "torbasız" ara
          if (filters.bagTypes.includes("torbalı") && value.includes("torbalı")) {
           hasBagType = true;
           break;
          }
          if (filters.bagTypes.includes("torbasız") && value.includes("torbasız")) {
           hasBagType = true;
           break;
          }
         }
        }
       }
       if (hasBagType) break;
      }

      return hasBagType;
     });
    }

    // Screen size filter (only for televizyon category)
    if (categorySlug === "televizyon" && filters.screenSizes.length > 0) {
     filteredProducts = filteredProducts.filter((p) => {
      // Ürünün specifications'ını kontrol et
      const allSpecs = [
       ...(p.specifications || []),
       ...(p.colors?.[0]?.specifications || [])
      ];

      // "Ekran Büyüklüğü" key'inde değer ara
      let hasScreenSize = false;
      for (const spec of allSpecs) {
       if (spec.items) {
        for (const item of spec.items) {
         const key = (item.key || "").trim();
         const keyLower = key.toLowerCase();
         const value = (item.value || "").trim();

         // Key kontrolü - ProductImportantFeatures.jsx ile aynı mantık
         const isScreenSizeKey = key === "Ekran Büyüklüğü" ||
          keyLower === "ekran büyüklüğü" ||
          (keyLower.includes("ekran") && keyLower.includes("büyüklük"));

         if (isScreenSizeKey && value) {
          // Seçili ekran büyüklükleriyle karşılaştır
          for (const selectedSize of filters.screenSizes) {
           // Tam eşleşme kontrolü
           if (value === selectedSize) {
            hasScreenSize = true;
            break;
           }
           // Sayısal değer eşleşmesi kontrolü (örn: "32 inç" ve "32 inç (82 cm)")
           const productSizeNum = parseInt(value.match(/\d+/)?.[0] || "0");
           const selectedSizeNum = parseInt(selectedSize.match(/\d+/)?.[0] || "0");
           if (productSizeNum > 0 && productSizeNum === selectedSizeNum) {
            hasScreenSize = true;
            break;
           }
           // Birbirini içerme kontrolü
           if (value.includes(selectedSize) || selectedSize.includes(value)) {
            hasScreenSize = true;
            break;
           }
          }
          if (hasScreenSize) break;
         }
        }
       }
       if (hasScreenSize) break;
      }

      return hasScreenSize;
     });
    }

    // Cooling capacity filter (only for klima category)
    if (categorySlug === "klima" && filters.coolingCapacities.length > 0) {
     filteredProducts = filteredProducts.filter((p) => {
      // Ürünün specifications'ını kontrol et
      const allSpecs = [
       ...(p.specifications || []),
       ...(p.colors?.[0]?.specifications || [])
      ];

      // "Soğutma Kapasitesi" key'inde değer ara
      let hasCoolingCapacity = false;
      for (const spec of allSpecs) {
       if (spec.items) {
        for (const item of spec.items) {
         const key = (item.key || "").toLowerCase().trim();
         const value = (item.value || "").trim();

         // Key'de "soğutma" ve "kapasite" ara
         if (key.includes("soğutma") && key.includes("kapasite") && value) {
          // Seçili soğutma kapasiteleriyle karşılaştır
          for (const selectedCapacity of filters.coolingCapacities) {
           // Tam eşleşme kontrolü
           if (value === selectedCapacity) {
            hasCoolingCapacity = true;
            break;
           }
           // Sayısal değer eşleşmesi kontrolü (örn: "9000 BTU/h" ve "9000")
           const productCapacityNum = parseInt(value.match(/\d+/)?.[0] || "0");
           const selectedCapacityNum = parseInt(selectedCapacity.match(/\d+/)?.[0] || "0");
           if (productCapacityNum > 0 && productCapacityNum === selectedCapacityNum) {
            hasCoolingCapacity = true;
            break;
           }
           // Birbirini içerme kontrolü
           if (value.includes(selectedCapacity) || selectedCapacity.includes(value)) {
            hasCoolingCapacity = true;
            break;
           }
          }
          if (hasCoolingCapacity) break;
         }
        }
       }
       if (hasCoolingCapacity) break;
      }

      return hasCoolingCapacity;
     });
    }

    if (categorySlug === "yeni" || categorySlug === "yeniler" || categorySlug === "indirim") {
     if (filters.categories.length > 0) {
      filteredProducts = filteredProducts.filter((p) =>
       filters.categories.includes(p.category)
      );
     }
    }

    if (filters.specialFilters && filters.specialFilters.length > 0) {
     let specialFilteredProducts = filteredProducts.filter((p) => {
      let isValid = true;

      if (filters.specialFilters.includes("new")) {
       isValid = isValid && p.isNewProduct === true;
      }

      if (filters.specialFilters.includes("discounted")) {
       isValid = isValid && (p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price);
      }

      if (filters.specialFilters.includes("featured")) {
       isValid = isValid && p.isFeatured === true;
      }

      return isValid;
     });

     filteredProducts = specialFilteredProducts;
    }

    setProducts(filteredProducts);

    // Extract unique brands
    const brands = [...new Set(data.data.map((p) => p.brand).filter(Boolean))];
    setAvailableBrands(brands);

    if (categorySlug === "yeni" || categorySlug === "yeniler" || categorySlug === "indirim") {
     const categories = [...new Set(data.data.map((p) => p.category).filter(Boolean))];
     categories.sort((a, b) => a.localeCompare(b, 'tr'));
     setAvailableCategories(categories);
    } else {
     setAvailableCategories([]);
    }

    if (categorySlug === "televizyon") {
     const screenSizes = new Set();
     data.data.forEach((p) => {
      const allSpecs = [
       ...(p.specifications || []),
       ...(p.colors?.[0]?.specifications || [])
      ];
      for (const spec of allSpecs) {
       if (spec.items) {
        for (const item of spec.items) {
         const key = (item.key || "").trim();
         const keyLower = key.toLowerCase();
         const value = (item.value || "").trim();
         // ProductImportantFeatures.jsx'teki kontrolle aynı mantık
         const isScreenSizeKey = key === "Ekran Büyüklüğü" ||
          keyLower === "ekran büyüklüğü" ||
          (keyLower.includes("ekran") && keyLower.includes("büyüklük"));
         if (isScreenSizeKey && value) {
          screenSizes.add(value);
         }
        }
       }
      }
     });
     const sortedScreenSizes = Array.from(screenSizes).sort((a, b) => {
      // Sayısal değerleri çıkar ve karşılaştır (örn: "32 inç" -> 32)
      const numA = parseInt(a.match(/\d+/)?.[0] || "0");
      const numB = parseInt(b.match(/\d+/)?.[0] || "0");
      return numA - numB;
     });
     setAvailableScreenSizes(sortedScreenSizes);
    } else {
     setAvailableScreenSizes([]);
    }

    // Extract unique cooling capacities (only for klima category)
    if (categorySlug === "klima") {
     const coolingCapacities = new Set();
     data.data.forEach((p) => {
      const allSpecs = [
       ...(p.specifications || []),
       ...(p.colors?.[0]?.specifications || [])
      ];
      for (const spec of allSpecs) {
       if (spec.items) {
        for (const item of spec.items) {
         const key = (item.key || "").toLowerCase().trim();
         const value = (item.value || "").trim();
         // "soğutma kapasitesi" key'ini kontrol et
         if (key.includes("soğutma") && key.includes("kapasite") && value) {
          coolingCapacities.add(value);
         }
        }
       }
      }
     });
     const sortedCoolingCapacities = Array.from(coolingCapacities).sort((a, b) => {
      // Sayısal değerleri çıkar ve karşılaştır (örn: "9000 BTU/h" -> 9000)
      const numA = parseInt(a.match(/\d+/)?.[0] || "0");
      const numB = parseInt(b.match(/\d+/)?.[0] || "0");
      return numA - numB;
     });
     setAvailableCoolingCapacities(sortedCoolingCapacities);
    } else {
     setAvailableCoolingCapacities([]);
    }

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
   setProducts([]);
  } finally {
   setLoading(false);
  }
 }, [slug, filters.sortBy, filters.brands, filters.categories, filters.bagTypes, filters.screenSizes, filters.coolingCapacities, filters.minPrice, filters.maxPrice, filters.specialFilters]);

 // Ürün detay sayfası için fetch
 const fetchProductBySerialNumber = useCallback(async (serialNumber) => {
  setLoading(true);
  try {
   const res = await axiosInstance.get("/api/products?limit=1000");
   const data = res.data;

   if (data.success) {
    // Renk seviyesinde seri numarasına göre ürün bul
    const foundProduct = data.data.find((p) => {
     if (!p.colors || !Array.isArray(p.colors)) return false;
     return p.colors.some(c => {
      if (typeof c === 'object' && c.serialNumber) {
       return c.serialNumber === serialNumber;
      }
      return false;
     });
    });

    if (foundProduct) {
     // Seri numarasına sahip rengi bul
     const colorWithSerial = foundProduct.colors.find(c => {
      if (typeof c === 'object' && c.serialNumber) {
       return c.serialNumber === serialNumber;
      }
      return false;
     });

     setProduct(foundProduct);
     if (colorWithSerial) {
      setSelectedColor(colorWithSerial.name);
      setSelectedColorObj(colorWithSerial);
      setSelectedImage(0);
     } else if (foundProduct.colors && foundProduct.colors.length > 0) {
      const firstColor = typeof foundProduct.colors[0] === 'object' ? foundProduct.colors[0] : { name: foundProduct.colors[0] };
      setSelectedColor(firstColor.name);
      setSelectedColorObj(firstColor);
      setSelectedImage(0);
     }
     checkCanRate(foundProduct._id);
    }
   }
  } catch (error) {
  } finally {
   setLoading(false);
  }
 }, []);

 const checkCanRate = async (productId) => {
  try {
   setCheckingRating(true);
   const res = await axiosInstance.get(`/api/products/${productId}/rating`);
   const data = res.data;
   if (data.success) {
    setCanRate(data.canRate);
    setRatingMessage(data.message || "");
    if (data.userRating) {
     setUserRating(Number(data.userRating) || 0);
    }
   }
  } catch (error) {
   setCanRate(false);
   setRatingMessage("");
  } finally {
   setCheckingRating(false);
  }
 };

 const handleSubmitRating = async (rating) => {
  if (!product || !canRate) return;

  try {
   const res = await axiosInstance.post(`/api/products/${product._id}/rating`, {
    rating,
   });

   const data = res.data;

   if (data.success) {
    setRatingSubmitted(true);
    setCanRate(false);
    setProduct({
     ...product,
     rating: data.data.rating,
     reviewCount: data.data.reviewCount,
    });
    setToast({ show: true, message: "Puanınız başarıyla kaydedildi!", type: "success" });
   } else {
    setToast({ show: true, message: data.message || "Puan verilemedi", type: "error" });
   }
  } catch (error) {
   setToast({ show: true, message: "Bir hata oluştu. Lütfen tekrar deneyin.", type: "error" });
  }
 };

 const handleAddToCart = () => {
  if (!product) return;

  // Renk bazlı bilgileri hesapla
  const currentColorObj = selectedColorObj || (product.colors && product.colors.length > 0
   ? (typeof product.colors[0] === 'object' ? product.colors[0] : null)
   : null);

  const colorPrice = currentColorObj?.price || product.price;
  const colorDiscountPrice = currentColorObj?.discountPrice !== undefined ? currentColorObj.discountPrice : product.discountPrice;
  const colorImages = currentColorObj?.images && currentColorObj.images.length > 0 ? currentColorObj.images : product.images;
  const colorSerialNumber = currentColorObj?.serialNumber || product.serialNumber;
  const colorStock = currentColorObj?.stock !== undefined ? currentColorObj.stock : product.stock;

  const stockToCheck = colorStock;
  if (stockToCheck === 0) {
   setToast({ show: true, message: "Bu ürün stokta bulunmamaktadır.", type: "error" });
   return;
  }

  if (quantity > 10) {
   setToast({ show: true, message: "Bir üründen en fazla 10 adet alabilirsiniz.", type: "error" });
   setQuantity(10);
   return;
  }

  const productToAdd = {
   ...product,
   price: colorPrice,
   discountPrice: colorDiscountPrice,
   serialNumber: colorSerialNumber,
   images: colorImages,
   stock: stockToCheck,
  };

  addToCart(productToAdd, null, selectedColor, quantity);
  setAddedToCart(true);
  setTimeout(() => setAddedToCart(false), 2000);
 };

 const handleFavoriteToggle = () => {
  if (!product) return;

  if (isFavorite(product._id)) {
   removeFromFavorites(product._id);
  } else {
   addToFavorites(product);
  }
 };

 const handleComparisonToggle = () => {
  if (!product || !product._id) return;

  const productId = String(product._id);
  const isCurrentlyInComparison = isInComparison(productId);

  if (isCurrentlyInComparison) {
   removeFromComparison(productId);
  } else {
   addToComparison(product);
  }
 };

 useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'instant' });
 }, [slug]);

 useEffect(() => {
  if (isProductDetailPage) {
   const serialNumber = decodeURIComponent(slug[slug.length - 1]);
   fetchProductBySerialNumber(serialNumber);
  } else {
   fetchProducts();
  }
 }, [isProductDetailPage, slug, fetchProducts, fetchProductBySerialNumber]);


 const handleBrandToggle = (brand) => {
  setFilters((prev) => ({
   ...prev,
   brands: prev.brands.includes(brand)
    ? prev.brands.filter((b) => b !== brand)
    : [...prev.brands, brand],
  }));
 };

 const handleCategoryToggle = (category) => {
  setFilters((prev) => ({
   ...prev,
   categories: prev.categories.includes(category)
    ? prev.categories.filter((c) => c !== category)
    : [...prev.categories, category],
  }));
 };

 const handleBagTypeToggle = (bagType) => {
  setFilters((prev) => ({
   ...prev,
   bagTypes: prev.bagTypes.includes(bagType)
    ? prev.bagTypes.filter((b) => b !== bagType)
    : [...prev.bagTypes, bagType],
  }));
 };

 const handleScreenSizeToggle = (screenSize) => {
  setFilters((prev) => ({
   ...prev,
   screenSizes: prev.screenSizes.includes(screenSize)
    ? prev.screenSizes.filter((s) => s !== screenSize)
    : [...prev.screenSizes, screenSize],
  }));
 };

 const handleCoolingCapacityToggle = (coolingCapacity) => {
  setFilters((prev) => ({
   ...prev,
   coolingCapacities: prev.coolingCapacities.includes(coolingCapacity)
    ? prev.coolingCapacities.filter((c) => c !== coolingCapacity)
    : [...prev.coolingCapacities, coolingCapacity],
  }));
 };

 const handleSpecialFilterToggle = (filterId) => {
  setFilters((prev) => ({
   ...prev,
   specialFilters: prev.specialFilters.includes(filterId)
    ? prev.specialFilters.filter((f) => f !== filterId)
    : [...prev.specialFilters, filterId],
  }));
 };

 const clearFilters = () => {
  const hasActiveFilters =
   (slug.length > 1) ||
   (filters.minPrice && filters.minPrice !== "") ||
   (filters.maxPrice && filters.maxPrice !== "") ||
   (filters.brands && filters.brands.length > 0) ||
   (filters.categories && filters.categories.length > 0) ||
   (filters.bagTypes && filters.bagTypes.length > 0) ||
   (filters.screenSizes && filters.screenSizes.length > 0) ||
   (filters.coolingCapacities && filters.coolingCapacities.length > 0) ||
   (filters.specialFilters && filters.specialFilters.length > 0);

  if (!hasActiveFilters) {
   return;
  }

  setFilters({
   ...filters,
   minPrice: "",
   maxPrice: "",
   brands: [],
   categories: [],
   bagTypes: [],
   screenSizes: [],
   coolingCapacities: [],
   specialFilters: [],
  });

  if (slug.length > 1) {
   const categorySlug = decodeURIComponent(slug[0]);
   router.push(`/kategori/${categorySlug}`);
  }
 };

 const categoryNames = {
  yeni: "Yeniler",
  indirim: "İndirimler",
  kampanyalar: "Kampanyalar",
 };

 const getCategoryName = () => {
  if (slug.length === 0) return "Tüm Ürünler";

  const decodedSlug = decodeURIComponent(slug[0]);
  let mainCat = "";
  let subCat = "";

  let mainMenuItem = MENU_ITEMS.find(item => {
   const itemPath = item.path.replace('/kategori/', '');
   return itemPath === decodedSlug;
  });

  if (mainMenuItem) {
   mainCat = mainMenuItem.name;
  } else {
   for (const menuItem of MENU_ITEMS) {
    if (menuItem.subCategories) {
     const subCatItem = menuItem.subCategories.find(sub => {
      const subPath = sub.path.replace('/kategori/', '');
      return subPath === decodedSlug || subPath.endsWith('/' + decodedSlug);
     });
     if (subCatItem) {
      subCat = subCatItem.name;
      mainCat = menuItem.name;
      mainMenuItem = menuItem;
      break;
     }
    }
   }

   if (!mainCat) {
    mainCat = categoryNames[decodedSlug] || decodedSlug;
   }
  }

  if (slug.length > 1) {
   const decodedSubSlug = decodeURIComponent(slug[1]);

   if (!mainMenuItem) {
    mainMenuItem = MENU_ITEMS.find(item => {
     const itemPath = item.path.replace('/kategori/', '');
     return itemPath === decodedSlug;
    });
   }

   if (mainMenuItem && mainMenuItem.subCategories) {
    const subCatItem = mainMenuItem.subCategories.find(sub => {
     const subPath = sub.path.replace(`/kategori/${decodedSlug}/`, '').replace(/-/g, '');
     return subPath === decodedSubSlug.replace(/-/g, '');
    });
    if (subCatItem) {
     subCat = subCatItem.name;
    } else {
     subCat = decodedSubSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
   } else {
    subCat = decodedSubSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
   }

   return subCat || mainCat;
  }

  return subCat || mainCat;
 };

 let currentColorObj = null;
 let colorPrice = 0;
 let colorDiscountPrice = null;
 let colorImages = [];
 let colorSerialNumber = "";
 let colorStock = 0;
 let hasDiscount = false;
 let displayPrice = 0;
 let discountPercentage = 0;

 if (isProductDetailPage && product) {
  currentColorObj = selectedColorObj || (product.colors && product.colors.length > 0
   ? (typeof product.colors[0] === 'object' ? product.colors[0] : null)
   : null);

  colorPrice = currentColorObj?.price || (product.price || 0);
  colorDiscountPrice = currentColorObj?.discountPrice !== undefined ? currentColorObj.discountPrice : (product.discountPrice || null);
  colorImages = currentColorObj?.images && currentColorObj.images.length > 0 ? currentColorObj.images : (product.images || []);
  colorSerialNumber = currentColorObj?.serialNumber || product.serialNumber || "";
  colorStock = currentColorObj?.stock !== undefined ? currentColorObj.stock : (product.stock || 0);

  hasDiscount = colorDiscountPrice && colorDiscountPrice < colorPrice;
  displayPrice = hasDiscount ? colorDiscountPrice : colorPrice;
  discountPercentage = hasDiscount
   ? Math.round(((colorPrice - colorDiscountPrice) / colorPrice) * 100)
   : 0;
 }

 const handleColorSelect = (colorName) => {
  if (selectedColor === colorName) {
   return;
  }

  setSelectedColor(colorName);
  const color = product?.colors?.find(c => {
   if (typeof c === 'object') {
    return c.name === colorName;
   }
   return c === colorName;
  });
  if (color && typeof color === 'object') {
   setSelectedColorObj(color);
   setSelectedImage(0);

   const newSerialNumber = color.serialNumber;
   const currentSerialNumber = slug[slug.length - 1];
   if (newSerialNumber && newSerialNumber !== currentSerialNumber) {
    if (slug.length === 3) {
     const newUrl = `/kategori/${slug[0]}/${slug[1]}/${newSerialNumber}`;
     router.push(newUrl);
    } else if (slug.length === 2) {
     const newUrl = `/kategori/${slug[0]}/${newSerialNumber}`;
     router.push(newUrl);
    }
   }
  } else {
   setSelectedColorObj(null);
  }
 };

 const expandedProductsCount = useMemo(() => {
  return products.length;
 }, [products]);

 // Kampanyalar sayfası kontrolü
 const isCampaignsPage = useMemo(() => {
  return slug.length > 0 && decodeURIComponent(slug[0]) === "kampanyalar";
 }, [slug]);

 // Kampanyaları yükle
 useEffect(() => {
  if (isCampaignsPage) {
   const fetchCampaigns = async () => {
    try {
     const res = await axiosInstance.get("/api/campaigns");
     const data = res.data;
     if (data && data.success) {
      setCampaignsData(data.data || []);
     } else {
      setCampaignsData([]);
     }
    } catch (error) {
     setCampaignsData([]);
    } finally {
     setCampaignsLoading(false);
    }
   };
   fetchCampaigns();
  } else {
   setCampaignsLoading(false);
  }
 }, [isCampaignsPage]);

 if (isProductDetailPage) {
  if (loading) {
   return <ProductLoading />;
  }

  if (!product) {
   return <ProductNotFound />;
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr');

  // Breadcrumb items for structured data
  const breadcrumbItems = [
   { name: 'Ana Sayfa', url: '/' },
   { name: product.category || 'Kategori', url: `/kategori/${slug[0]}` },
  ];

  if (product.subCategory) {
   breadcrumbItems.push({
    name: product.subCategory,
    url: slug.length >= 2 ? `/kategori/${slug[0]}/${slug[1]}` : `/kategori/${slug[0]}`,
   });
  }

  // Ürün URL'ini getProductUrl ile oluştur
  const currentColorSerialNumber = selectedColorObj?.serialNumber ||
   (product.colors && product.colors.length > 0 && typeof product.colors[0] === 'object'
    ? product.colors[0].serialNumber
    : null) ||
   product.serialNumber;

  const productUrl = getProductUrl(product, currentColorSerialNumber);

  breadcrumbItems.push({
   name: product.name,
   url: productUrl,
  });

  return (
   <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8 lg:py-12">
    <Toast toast={toast} setToast={setToast} />

    {/* Structured Data */}
    <ProductSchema product={product} baseUrl={baseUrl} productUrl={productUrl} />
    <BreadcrumbSchema items={breadcrumbItems} baseUrl={baseUrl} />

    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 max-w-8xl">
     <ProductBreadcrumb product={product} />

     <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8">
      <div className="lg:col-span-5 lg:pr-8">
       <ProductImageGallery
        images={colorImages}
        selectedImage={selectedImage}
        onImageSelect={setSelectedImage}
        isNew={product.isNewProduct}
        discountPercentage={discountPercentage}
        productName={product.name}
       />
      </div>

      <div className="lg:col-span-7">
       {product.brand && (
        <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide mb-2">
         {product.brand}
         {colorSerialNumber && (
          <span className="ml-2 font-mono text-gray-900 font-semibold normal-case">- {colorSerialNumber}</span>
         )}
        </p>
       )}
       {!product.brand && colorSerialNumber && (
        <p className="text-xs sm:text-sm text-gray-500 mb-2">
         <span className="font-mono text-gray-600">Seri No: {colorSerialNumber}</span>
        </p>
       )}

       <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-3 sm:mb-4">{product.name}</h1>

       <ProductRating
        product={product}
        checkingRating={checkingRating}
        canRate={canRate}
        ratingSubmitted={ratingSubmitted}
        hoverRating={hoverRating}
        userRating={userRating}
        onHoverRating={setHoverRating}
        onRatingSubmit={handleSubmitRating}
       />

       <ProductPrice
        displayPrice={displayPrice}
        hasDiscount={hasDiscount}
        originalPrice={colorPrice}
       />

       <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed max-w-2xl wrap-break-word">
        {product.description}
       </p>

       <ProductColorSelector
        colors={product.colors}
        selectedColor={selectedColor}
        onColorSelect={handleColorSelect}
       />

       <ProductQuantitySelector
        quantity={quantity}
        stock={colorStock}
        onQuantityChange={setQuantity}
       />

       <ProductActions
        productId={product._id}
        stock={colorStock}
        addedToCart={addedToCart}
        isFavorite={isFavorite(product._id)}
        isInComparison={isInComparison(product._id)}
        onAddToCart={handleAddToCart}
        onFavoriteToggle={handleFavoriteToggle}
        onComparisonToggle={handleComparisonToggle}
       />

       <ProductFeatures />
      </div>
     </div>

     {/* Önemli Özellikler Bölümü */}
     <div className="mt-6 sm:mt-8 md:mt-12">
      <ProductImportantFeatures product={product} selectedColor={selectedColor} />
     </div>

     {/* Takım İçeriği Bölümü */}
     <ProductBundleItems product={product} selectedColor={selectedColor} />

     {/* Tüm Özellikler Bölümü */}
     <div className="mt-6 sm:mt-8 md:mt-12">
      <ProductAllFeatures product={product} selectedColor={selectedColor} />
     </div>

     {/* Benzer Ürünler Bölümü */}
     <ProductSimilarProducts product={product} />
    </div>
   </div>
  );
 }

 if (isCampaignsPage) {

  return (
   <div className="min-h-screen bg-gray-50">
    {/* Header */}
    <div className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-8 sm:py-10 md:py-14">
     <div className="container mx-auto px-4 sm:px-6 md:px-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 text-center">Kampanyalar</h1>
      <p className="text-lg sm:text-xl text-center text-indigo-100 max-w-2xl mx-auto">
       Özel fırsatlar ve kampanyalarımızı kaçırmayın!
      </p>
     </div>
    </div>

    {/* Kampanyalar Grid */}
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
     {campaignsLoading ? (
      <div className="text-center py-12">
       <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
       <p className="text-gray-600">Kampanyalar yükleniyor...</p>
      </div>
     ) : campaignsData.length === 0 ? (
      <div className="text-center py-12">
       <p className="text-gray-600 text-lg">Henüz kampanya bulunmamaktadır.</p>
      </div>
     ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 max-w-7xl mx-auto">
       {campaignsData.map((campaign) => (
        <div
         key={campaign._id}
         className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 flex flex-col"
        >
         {/* Görsel Container */}
         <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
          <Image
           src={campaign.image}
           alt={campaign.title}
           fill
           className="object-cover transition-transform duration-500 group-hover:scale-110"
           sizes="(max-width: 768px) 100vw, 50vw"
           priority={campaignsData.indexOf(campaign) === 0}
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
         </div>

         {/* İçerik */}
         <div className="p-6 sm:p-8 flex flex-col grow">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
           {campaign.title}
          </h2>
          {campaign.description && (
           <p className="text-gray-600 text-sm sm:text-base mb-4 line-clamp-2">
            {campaign.description}
           </p>
          )}
          <div className="mt-auto flex items-center justify-between gap-4 flex-wrap">
           <button
            className="inline-flex items-center px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg cursor-pointer"
            onClick={() => router.push(`/kategori/kampanyalar/${campaign._id}`)}
           >
            İncele
            <HiArrowRight className="ml-2 w-5 h-5" />
           </button>
           {campaign.endDate && (
            <div className="flex items-center text-gray-600">
             <HiCalendar className="w-5 h-5 mr-2 text-indigo-600" />
             <span className="text-sm font-semibold">
              Son Gün:{" "}
              <span className="text-gray-900">
               {new Date(campaign.endDate).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
               })}
              </span>
             </span>
            </div>
           )}
          </div>
         </div>
        </div>
       ))}
      </div>
     )}
    </div>
   </div>
  );
 }

 // Metadata for category listing page
 const categoryName = getCategoryName();

 return (
  <div className="min-h-screen bg-gray-50">
   <CategoryHeader categoryName={categoryName} productCount={expandedProductsCount} />
   <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
     <CategoryFiltersSidebar
      slug={slug}
      filters={filters}
      availableBrands={availableBrands}
      availableCategories={availableCategories}
      availableScreenSizes={availableScreenSizes}
      availableCoolingCapacities={availableCoolingCapacities}
      onClearFilters={clearFilters}
      onMinPriceChange={(value) => setFilters((prev) => ({ ...prev, minPrice: value }))}
      onMaxPriceChange={(value) => setFilters((prev) => ({ ...prev, maxPrice: value }))}
      onBrandToggle={handleBrandToggle}
      onCategoryToggle={handleCategoryToggle}
      onBagTypeToggle={handleBagTypeToggle}
      onScreenSizeToggle={handleScreenSizeToggle}
      onCoolingCapacityToggle={handleCoolingCapacityToggle}
      onSpecialFilterToggle={handleSpecialFilterToggle}
     />

     <div className="flex-1 min-w-0">
      <CategoryToolbar
       sortBy={filters.sortBy}
       onSortChange={(value) => setFilters({ ...filters, sortBy: value })}
       onFiltersClick={() => setShowFilters(true)}
       slug={slug}
      />

      <CategoryProducts
       loading={loading}
       products={products}
       sortBy={filters.sortBy}
       onClearFilters={clearFilters}
      />
     </div>
    </div>
   </div>

   <CategoryFiltersModal
    show={showFilters}
    slug={slug}
    filters={filters}
    availableBrands={availableBrands}
    availableCategories={availableCategories}
    availableScreenSizes={availableScreenSizes}
    availableCoolingCapacities={availableCoolingCapacities}
    onClose={() => setShowFilters(false)}
    onClearFilters={clearFilters}
    onMinPriceChange={(value) => setFilters((prev) => ({ ...prev, minPrice: value }))}
    onMaxPriceChange={(value) => setFilters((prev) => ({ ...prev, maxPrice: value }))}
    onBrandToggle={handleBrandToggle}
    onCategoryToggle={handleCategoryToggle}
    onBagTypeToggle={handleBagTypeToggle}
    onScreenSizeToggle={handleScreenSizeToggle}
    onCoolingCapacityToggle={handleCoolingCapacityToggle}
    onSpecialFilterToggle={handleSpecialFilterToggle}
   />
  </div>
 );
}
