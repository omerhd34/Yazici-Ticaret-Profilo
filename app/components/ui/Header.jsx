"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { HiSearch, HiUser, HiHeart, HiMenu, HiX, HiPhone, HiChevronDown, HiArrowRight } from "react-icons/hi";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import axiosInstance from "@/lib/axios";

export const MENU_ITEMS = [
 { name: "YENİ GELENLER", path: "/kategori/yeni", isSpecial: true },
 {
  name: "Giyim",
  path: "/kategori/giyim",
  isSpecial: false,
  subCategories: [
   { name: "Jean", path: "/kategori/giyim/jean" },
   { name: "Pantolon", path: "/kategori/giyim/pantolon" },
   { name: "Tişört", path: "/kategori/giyim/tisort" },
   { name: "Gömlek", path: "/kategori/giyim/gomlek" },
   { name: "Sweatshirt", path: "/kategori/giyim/sweatshirt" },
   { name: "Eşofman", path: "/kategori/giyim/esofman" },
   { name: "Kazak", path: "/kategori/giyim/kazak" },
   { name: "Dış Giyim", path: "/kategori/giyim/dis-giyim" },
   { name: "İç Giyim", path: "/kategori/giyim/ic-giyim" },
   { name: "Pijama", path: "/kategori/giyim/elbise" },
   { name: "Takım Elbisesi", path: "/kategori/giyim/takim-elbisesi" },
   { name: "Kravat", path: "/kategori/aksesuar/kravat" },
   { name: "Çorap", path: "/kategori/giyim/corap" },
   { name: "Kemer", path: "/kategori/giyim/kemer" },
  ]
 },
 {
  name: "Ayakkabı", path: "/kategori/ayakkabi", isSpecial: false,
  subCategories: [
   { name: "Günlük Ayakkabı", path: "/kategori/ayakkabi/gunluk-ayakkabi" },
   { name: "Spor Ayakkabı", path: "/kategori/ayakkabi/spor-ayakkabi" },
   { name: "Bot", path: "/kategori/ayakkabi/bot" },
   { name: "Terlik", path: "/kategori/ayakkabi/terlik" },
  ]
 },
 {
  name: "Aksesuar", path: "/kategori/aksesuar", isSpecial: false, subCategories: [
   { name: "Takı", path: "/kategori/aksesuar/takı" },
   { name: "Güneş Gözlüğü", path: "/kategori/aksesuar/gunes-gozluğu" },
   { name: "Kuyruklu Takı", path: "/kategori/aksesuar/kuyruklu-takı" },
   { name: "Kolye", path: "/kategori/aksesuar/kolye" },
   { name: "Parfüm", path: "/kategori/aksesuar/parfum" },
  ]
 },
 { name: "İndirimler", path: "/kategori/indirim", isSpecial: false },
];

const Header = () => {
 const router = useRouter();
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const [activeMenu, setActiveMenu] = useState(null);
 const [isAuthenticated, setIsAuthenticated] = useState(false);
 const [searchTerm, setSearchTerm] = useState("");
 const [searchResults, setSearchResults] = useState([]);
 const [showSuggestions, setShowSuggestions] = useState(false);
 const [searchTimeout, setSearchTimeout] = useState(null);
 const { getCartItemCount, getFavoriteCount } = useCart();
 const [isClient, setIsClient] = useState(false);

 useLayoutEffect(() => {
  setIsClient(true);
 }, []);

 useEffect(() => {
  let isChecking = false;
  let lastCheckTime = 0;
  const CHECK_COOLDOWN = 10000;

  const checkAuth = async () => {
   const now = Date.now();
   if (isChecking || (now - lastCheckTime < CHECK_COOLDOWN)) {
    return;
   }

   isChecking = true;
   lastCheckTime = now;

   try {
    const res = await axiosInstance.get("/api/user/check", {
     cache: 'no-store',
    });
    const data = res.data;
    setIsAuthenticated(data.authenticated || false);
   } catch (error) {
    setIsAuthenticated(false);
   } finally {
    isChecking = false;
   }
  };

  checkAuth();

  const handleStorageChange = (e) => {
   if (e.key === null || e.key === 'logout') {
    setIsAuthenticated(false);
   } else {
    checkAuth();
   }
  };

  const handleLogoutEvent = () => {
   setIsAuthenticated(false);
  };

  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('logout', handleLogoutEvent);

  return () => {
   window.removeEventListener('storage', handleStorageChange);
   window.removeEventListener('logout', handleLogoutEvent);
  };
 }, []);

 const handleHesabimClick = async (e) => {
  e.preventDefault();

  if (typeof window !== 'undefined') {
   const justLoggedOut = localStorage.getItem('just_logged_out');
   if (justLoggedOut) {
    const logoutTime = parseInt(justLoggedOut, 10);
    const now = Date.now();
    if (now - logoutTime < 300000) {
     document.cookie = 'user-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;';
     document.cookie = 'user-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict;';
     window.location.href = "/giris";
     return;
    } else {
     localStorage.removeItem('just_logged_out');
    }
   }
  }

  try {
   const res = await axiosInstance.get("/api/user/check", {
    cache: 'no-store',
   });
   const data = res.data;

   if (data.authenticated) {
    router.push("/hesabim");
   } else {
    router.push("/giris");
   }
  } catch (error) {
   router.push("/giris");
  }
 };

 const closeMenu = () => {
  setActiveMenu(null);
  setIsMobileMenuOpen(false);
 };

 const fetchSearchSuggestions = async (term) => {
  if (!term || term.trim().length < 2) {
   setSearchResults([]);
   setShowSuggestions(false);
   return;
  }

  try {
   const res = await axiosInstance.get(`/api/products?search=${encodeURIComponent(term)}&limit=3`);
   const data = res.data;

   if (data.success) {
    setSearchResults(data.data);
    setShowSuggestions(data.data.length > 0);
   } else {
    setSearchResults([]);
    setShowSuggestions(false);
   }
  } catch (error) {
   setSearchResults([]);
   setShowSuggestions(false);
  }
 };

 const handleSearchChange = (e) => {
  const value = e.target.value;
  setSearchTerm(value);

  if (searchTimeout) {
   clearTimeout(searchTimeout);
  }

  const timeout = setTimeout(() => {
   fetchSearchSuggestions(value);
  }, 500);

  setSearchTimeout(timeout);
 };

 useEffect(() => {
  const handleClickOutside = (e) => {
   if (!e.target.closest('.search-container')) {
    setShowSuggestions(false);
   }
  };

  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
 }, []);

 return (
  <header className="w-full bg-white shadow-sm sticky top-0 z-50 font-sans">

   <div className="bg-slate-900 text-white text-[11px] font-medium py-2.5 px-4 tracking-wide">
    <div className="container mx-auto flex justify-between items-center">
     <p>🎉 500 TL ve üzeri siparişlerde kargo bedava!</p>
     <div className="hidden sm:flex items-center gap-5">
      <Link href="/destek" className="flex items-center gap-1.5 hover:text-slate-300 transition">
       <HiPhone size={13} /> Destek
      </Link>
     </div>
    </div>
   </div>

   <div className="container mx-auto px-4 py-5">
    <div className="flex justify-between items-center gap-6">

     <Link href="/" className="text-3xl font-black tracking-tighter text-slate-900" onClick={closeMenu}>
      SHOP<span className="text-indigo-600">.CO</span>
     </Link>

     <div className="hidden md:flex flex-1 max-w-xl relative search-container">
      <form
       className="w-full relative group"
       onSubmit={(e) => {
        e.preventDefault();
        const term = searchTerm.trim();
        if (term) {
         setShowSuggestions(false);
         window.location.href = `/arama?q=${encodeURIComponent(term)}`;
        }
       }}
      >
       <input
        type="text"
        name="search"
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => {
         if (searchResults.length > 0) {
          setShowSuggestions(true);
         }
        }}
        placeholder="Ürün, kategori veya marka ara..."
        className="w-full bg-slate-100 border border-transparent rounded-full py-3 pl-5 pr-12 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-100 transition-all outline-none text-sm font-medium placeholder:text-slate-500"
       />
       <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 shadow-md hover:scale-105 active:scale-95 transition-all"
       >
        <HiSearch size={18} />
       </button>
      </form>

      {showSuggestions && searchResults.length > 0 && (
       <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
        <div className="p-2">
         {searchResults.map((product) => (
          <Link
           key={product._id}
           href={`/urun/${product.slug}`}
           onClick={() => setShowSuggestions(false)}
           className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition cursor-pointer group"
          >
           <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
            {product.images?.[0] && (
             <Image
              src={product.images[0]}
              alt={product.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
             />
            )}
           </div>
           <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-800 truncate group-hover:text-indigo-600 transition">
             {product.name}
            </h4>
            {product.brand && (
             <p className="text-xs text-gray-500">{product.brand}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
             {product.discountPrice && product.discountPrice < product.price ? (
              <>
               <span className="text-sm font-bold text-indigo-600">
                {product.discountPrice} ₺
               </span>
               <span className="text-xs text-gray-400 line-through">
                {product.price} ₺
               </span>
              </>
             ) : (
              <span className="text-sm font-bold text-gray-800">
               {product.price} ₺
              </span>
             )}
            </div>
           </div>
          </Link>
         ))}
         {searchTerm && (
          <Link
           href={`/arama?q=${encodeURIComponent(searchTerm)}`}
           onClick={() => setShowSuggestions(false)}
           className="block p-3 text-center text-indigo-600 font-semibold hover:bg-indigo-50 rounded-lg transition border-t border-gray-100 mt-2"
          >
           Tüm sonuçları gör
          </Link>
         )}
        </div>
       </div>
      )}
     </div>

     <div className="flex items-center gap-1 sm:gap-4 text-slate-700">
      <button
       onClick={handleHesabimClick}
       className="flex flex-col items-center gap-1 group hover:bg-slate-50 p-2 rounded-lg transition cursor-pointer"
      >
       <HiUser size={22} className="group-hover:text-indigo-600 transition" />
       <span className="text-[10px] font-bold hidden sm:block group-hover:text-indigo-600">Hesabım</span>
      </button>

      <Link href="/favoriler" className="flex flex-col items-center gap-1 group relative hover:bg-slate-50 p-2 rounded-lg transition">
       <div className="relative">
        <HiHeart size={22} className="group-hover:text-indigo-600 transition" />
        {isClient && getFavoriteCount() > 0 && (
         <span className={`absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm ${getFavoriteCount() >= 9 ? "px-1.5 min-w-[20px] h-5" : "w-4 h-4"}`}>
          {getFavoriteCount() >= 9 ? "9+" : getFavoriteCount()}
         </span>
        )}
       </div>
       <span className="text-[10px] font-bold hidden sm:block group-hover:text-indigo-600">Favoriler</span>
      </Link>

      <Link href="/sepet" className="flex flex-col items-center gap-1 group relative hover:bg-slate-50 p-2 rounded-lg transition">
       <div className="relative">
        <FaShoppingCart size={22} className="group-hover:text-indigo-600 transition" />
        {isClient && getCartItemCount() > 0 && (
         <span className={`absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm ${getCartItemCount() >= 9 ? "px-1.5 min-w-[20px] h-5" : "w-4 h-4"}`}>
          {getCartItemCount() >= 9 ? "9+" : getCartItemCount()}
         </span>
        )}
       </div>
       <span className="text-[10px] font-bold hidden sm:block group-hover:text-indigo-600">Sepetim</span>
      </Link>

      <button
       className="md:hidden ml-2 text-slate-900 p-2"
       onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
       {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </button>
     </div>
    </div>

    <form
     className="md:hidden mt-4 relative"
     onSubmit={(e) => {
      e.preventDefault();
      const searchTerm = e.target.searchMobile.value.trim();
      if (searchTerm) {
       window.location.href = `/arama?q=${encodeURIComponent(searchTerm)}`;
      }
     }}
    >
     <input
      type="text"
      name="searchMobile"
      placeholder="Ne aramıştınız?"
      className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
     />
     <HiSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </form>
   </div>

   <nav className="hidden md:block border-t border-slate-100 relative bg-white z-40">
    <div className="container mx-auto px-4">
     <ul className="flex items-center gap-8 text-[14px] font-bold text-slate-700 tracking-tight">
      {MENU_ITEMS.map((item) => (
       <li
        key={item.path}
        className="py-4"
        onMouseEnter={() => setActiveMenu(item.name)}
        onMouseLeave={() => setActiveMenu(null)}
       >
        <Link
         href={item.path}
         onClick={closeMenu}
         className={`flex items-center gap-1 transition-colors py-1 border-b-2 border-transparent ${item.isSpecial
          ? "text-red-600 hover:border-red-600"
          : `hover:text-indigo-600 hover:border-indigo-600 ${activeMenu === item.name ? "text-indigo-600 border-indigo-600" : ""}`
          }`}
        >
         {item.name}
         {item.subCategories && (
          <HiChevronDown
           size={14}
           className={`transition-transform duration-300 opacity-50 ${activeMenu === item.name ? "rotate-180 opacity-100" : ""}`}
          />
         )}
        </Link>

        {item.subCategories && (
         <div
          className={`absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out transform z-50 
                    ${activeMenu === item.name ? "visible opacity-100 translate-y-0" : "invisible opacity-0 translate-y-2"}`}
         >
          <div className="container mx-auto p-8">
           <div className="flex gap-12">

            <div className="flex-1">
             <h3 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider flex items-center gap-2">
              {item.name} Koleksiyonu
              <span className="h-px flex-1 bg-slate-100"></span>
             </h3>
             <ul className="grid grid-cols-3 gap-x-8 gap-y-3">
              {item.subCategories.map((subItem) => (
               <li key={subItem.path}>
                <Link
                 href={subItem.path}
                 onClick={closeMenu}
                 className="text-slate-500 hover:text-indigo-600 hover:translate-x-1 transition-all duration-200 text-[14px] flex items-center justify-between group/link"
                >
                 {subItem.name}
                </Link>
               </li>
              ))}
             </ul>

             <Link
              href={item.path}
              onClick={closeMenu}
              className="inline-flex items-center gap-2 mt-8 text-xs font-bold text-indigo-600 uppercase hover:underline"
             >
              Tüm {item.name} Ürünlerini Gör <HiArrowRight size={14} />
             </Link>
            </div>

            <div className="w-1/4 hidden lg:block">
             <div className="relative h-full min-h-[250px] rounded-xl overflow-hidden group/card">
              <Image
               src="/6.webp"
               alt="Yeni Sezon"
               width={600}
               height={400}
               className="object-cover w-full h-full transition-transform duration-700 group-hover/card:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
               <span className="text-white text-xs font-bold uppercase mb-2 bg-indigo-600 w-fit px-2 py-1 rounded">Yeni Sezon</span>
               <h4 className="text-white font-bold text-xl leading-tight">Yaz Koleksiyonunu Keşfet</h4>
              </div>
             </div>
            </div>

           </div>
          </div>
         </div>
        )}
       </li>
      ))}
     </ul>
    </div>
   </nav>

   {isMobileMenuOpen && (
    <div className="md:hidden bg-white border-t border-slate-200 absolute w-full left-0 shadow-lg h-[calc(100vh-64px)] overflow-y-auto z-50">
     <ul className="flex flex-col py-2">
      {MENU_ITEMS.map((item) => (
       <li key={item.path} className="border-b border-slate-50 last:border-none">
        <div className="flex flex-col">
         <Link
          href={item.path}
          className={`block px-5 py-4 font-bold ${item.isSpecial ? "text-red-600" : "text-slate-800"}`}
          onClick={closeMenu}
         >
          {item.name}
         </Link>
         {item.subCategories && (
          <ul className="bg-slate-50 px-5 py-3 grid grid-cols-2 gap-2">
           {item.subCategories.map((sub) => (
            <li key={sub.path}>
             <Link
              href={sub.path}
              className="block py-2 text-sm text-slate-500 hover:text-slate-900"
              onClick={closeMenu}
             >
              {sub.name}
             </Link>
            </li>
           ))}
          </ul>
         )}
        </div>
       </li>
      ))}
     </ul>
    </div>
   )}
  </header>
 );
};

export default Header;
