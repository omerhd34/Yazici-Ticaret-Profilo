"use client";
import Link from "next/link";
import { MENU_ITEMS } from "@/app/utils/menuItems";

const categoryToSlug = (categoryName) => {
 if (!categoryName) return "";
 return categoryName
  .toLowerCase()
  .replace(/ğ/g, 'g')
  .replace(/ü/g, 'u')
  .replace(/ş/g, 's')
  .replace(/ı/g, 'i')
  .replace(/ö/g, 'o')
  .replace(/ç/g, 'c')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');
};

export default function ProductBreadcrumb({ product }) {
 // MENU_ITEMS'den kategori path'lerini bul
 let categoryPath = "";
 let subCategoryPath = "";

 const mainMenuItem = MENU_ITEMS.find(item => item.name === product.category);
 if (mainMenuItem) {
  categoryPath = mainMenuItem.path.replace('/kategori/', '');

  if (product.subCategory && product.subCategory.trim() && mainMenuItem.subCategories) {
   const subCat = mainMenuItem.subCategories.find(sub => sub.name === product.subCategory);
   if (subCat) {
    subCategoryPath = subCat.path.replace(`/kategori/${categoryPath}/`, '');
   }
  }
 }

 if (!categoryPath) {
  categoryPath = categoryToSlug(product.category);
 }
 // Alt kategori path'i oluştur (sadece gerçekten alt kategori varsa ve kategori ile aynı değilse)
 if (!subCategoryPath && product.subCategory && product.subCategory.trim()) {
  const subCategorySlug = categoryToSlug(product.subCategory);
  // Alt kategori slug'ı kategori slug'ı ile aynı değilse ekle
  if (subCategorySlug && subCategorySlug !== categoryPath) {
   subCategoryPath = subCategorySlug;
  }
 }

 const categoryUrl = categoryPath ? `/kategori/${categoryPath}` : "#";
 const subCategoryUrl = subCategoryPath ? `/kategori/${categoryPath}/${subCategoryPath}` : categoryUrl;

 return (
  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm mb-4 sm:mb-6 md:mb-8 text-gray-600 flex-wrap">
   <Link href="/" className="hover:text-indigo-600">Ana Sayfa</Link>
   <span>/</span>
   <Link href={categoryUrl} className="hover:text-indigo-600 truncate max-w-[150px] sm:max-w-none">
    {product.category}
   </Link>
   {product.subCategory && (
    <>
     <span>/</span>
     <Link href={subCategoryUrl} className="hover:text-indigo-600 truncate max-w-[150px] sm:max-w-none">
      {product.subCategory}
     </Link>
    </>
   )}
  </div>
 );
}
