"use client";
import Link from "next/link";
import { MENU_ITEMS } from "@/app/utils/menuItems";

export default function SubCategoryFilter({ slug, onLinkClick }) {
 const categorySlug = slug.length > 0 ? decodeURIComponent(slug[0]) : "";
 const menuItem = MENU_ITEMS.find(item => {
  const itemPath = item.path.replace('/kategori/', '');
  return itemPath === categorySlug && item.subCategories;
 });

 if (!menuItem || !menuItem.subCategories || menuItem.subCategories.length === 0) {
  return null;
 }

 return (
  <div className="mb-6 pb-6 border-b">
   <h4 className="font-semibold mb-4">Alt Kategoriler</h4>
   <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
    {menuItem.subCategories.map((subCat) => {
     const subCatSlug = subCat.path.split('/').pop();
     const currentSubSlug = slug.length > 1 ? decodeURIComponent(slug[1]) : "";
     const isActive = currentSubSlug.replace(/-/g, '') === subCatSlug.replace(/-/g, '');
     return (
      <Link
       key={subCat.path}
       href={isActive ? menuItem.path : subCat.path}
       onClick={onLinkClick}
       className={`block px-4 py-2 rounded-lg text-sm font-medium transition ${isActive
        ? "bg-indigo-600 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
       {subCat.name}
      </Link>
     );
    })}
   </div>
  </div>
 );
}