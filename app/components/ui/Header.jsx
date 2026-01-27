"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { HiSearch, HiUser, HiHeart, HiMenu, HiX, HiPhone, HiChevronDown, HiArrowRight, HiClipboardList, HiTruck, HiTag, HiGift } from "react-icons/hi";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import axiosInstance from "@/lib/axios";
import { getProductUrl } from "@/app/utils/productUrl";
import ProductRequestModal from "@/app/components/product/ProductRequestModal";
import { MENU_ITEMS } from "@/app/utils/menuItems";
const HEADER_MESSAGES = [
 "Tüm Türkiye'ye nakliye ve montaj hizmeti !",
 "Bursa'ya özel ücretsiz kargo fırsatı !"
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
 const [showProductRequestModal, setShowProductRequestModal] = useState(false);
 const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
 const [expandedMobileMenu, setExpandedMobileMenu] = useState(null);
 const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

 useLayoutEffect(() => {
  setIsClient(true);
 }, []);

 useEffect(() => {
  const interval = setInterval(() => {
   setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % HEADER_MESSAGES.length);
  }, 5000);

  return () => clearInterval(interval);
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
  setExpandedMobileMenu(null);
 };

 const closeSearchModal = () => {
  setIsSearchModalOpen(false);
  setSearchTerm("");
  setShowSuggestions(false);
  setSearchResults([]);
 };

 const toggleMobileSubmenu = (itemName) => {
  setExpandedMobileMenu(expandedMobileMenu === itemName ? null : itemName);
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

 useEffect(() => {
  if (isMobileMenuOpen) {
   document.body.style.overflow = 'hidden';
  } else {
   document.body.style.overflow = '';
  }

  return () => {
   document.body.style.overflow = '';
  };
 }, [isMobileMenuOpen]);

 return (
  <header className="w-full bg-white shadow-sm sticky top-0 z-50 font-sans">
   <div className="bg-slate-900 text-white text-[10px] sm:text-[11px] font-medium py-2 sm:py-2.5 tracking-wide" onMouseEnter={() => setActiveMenu(null)}>
    <div className="container mx-auto px-3 sm:px-4 flex justify-between items-center">
     <p className="hidden sm:flex items-center gap-1 sm:gap-1.5 text-xs sm:text-[11px]">
      <HiTruck color="red" size={18} />
      <span>{HEADER_MESSAGES[currentMessageIndex]}</span>
     </p>
     <div className="flex items-center justify-end gap-3 sm:gap-4 lg:gap-5">
      <button
       onClick={() => setShowProductRequestModal(true)}
       className="flex items-center gap-1 sm:gap-1.5 hover:text-slate-300 transition cursor-pointer text-xs sm:text-[11px]"
      >
       <HiClipboardList size={18} />
       <span>Ürün İsteği</span>
      </button>
      <Link href="/destek" className="flex items-center  gap-1 sm:gap-1.5 hover:text-slate-300 transition text-xs sm:text-[11px]">
       <HiPhone size={18} />
       <span>Destek</span>
      </Link>
     </div>
    </div>
   </div>

   <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 lg:py-5" onMouseEnter={() => setActiveMenu(null)}>
    <div className="flex justify-between items-center gap-2 sm:gap-4 lg:gap-6">
     <Link href="/" className="flex items-center group shrink-0" onClick={closeMenu}>
      <div className="flex flex-col leading-tight">
       <div className="block max-[450px]:hidden">
        <span className="font-[Open_Sans] text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-[0.15em] md:tracking-[0.2em] lg:tracking-[0.25em] text-indigo-600 transition-colors duration-1000 ease-out group-hover:text-blue-900 select-none">
         YAZICI TİCARET
        </span>
       </div>
       <div className="hidden max-[450px]:flex flex-col">
        <span className="font-[Open_Sans] text-xl font-extrabold tracking-[0.15em] text-indigo-600 transition-colors duration-1000 ease-out group-hover:text-blue-900 select-none">
         YAZICI
        </span>
        <span className="font-[Open_Sans] text-xl font-extrabold tracking-[0.15em] text-indigo-600 transition-colors duration-1000 ease-out group-hover:text-blue-900 select-none">
         TİCARET
        </span>
       </div>
      </div>
     </Link>
     <div className="flex items-center gap-1 md:gap-2 lg:gap-3 xl:gap-4 text-slate-700">
      <button
       onClick={() => setIsSearchModalOpen(true)}
       className="search-icon-button flex flex-col items-center group hover:bg-slate-50 p-1 sm:p-2 rounded-lg transition cursor-pointer"
      >
       <HiSearch size={22} className="group-hover:text-indigo-600 transition" />
      </button>

      <button
       onClick={handleHesabimClick}
       className="flex flex-col items-center group hover:bg-slate-50 p-1 sm:p-2 rounded-lg transition cursor-pointer"
      >
       <HiUser size={22} className="group-hover:text-indigo-600 transition" />
      </button>

      <Link href="/sepet" className="flex flex-col items-center group relative hover:bg-slate-50 p-1 sm:p-2 rounded-lg transition">
       <div className="relative">
        <FaShoppingCart size={22} className="group-hover:text-indigo-600 transition" />
        {isClient && getCartItemCount() > 0 && (
         <span className={`absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm leading-none ${getCartItemCount() >= 9 ? "px-1.5 min-w-[20px] h-5" : "w-4 h-4"}`}>
          {getCartItemCount() >= 9 ? "9+" : getCartItemCount()}
         </span>
        )}
       </div>
      </Link>

      <Link href="/favoriler" className="flex flex-col items-center group relative hover:bg-slate-50 p-1 sm:p-2 rounded-lg transition">
       <div className="relative">
        <HiHeart size={22} className="group-hover:text-indigo-600 transition" />
        {isClient && getFavoriteCount() > 0 && (
         <span className={`absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm leading-none ${getFavoriteCount() >= 9 ? "px-1.5 min-w-[20px] h-5" : "w-4 h-4"}`}>
          {getFavoriteCount() >= 9 ? "9+" : getFavoriteCount()}
         </span>
        )}
       </div>
      </Link>

      <button
       className="md:hidden text-slate-900 p-1 sm:p-2 cursor-pointer"
       onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
       {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </button>
     </div>
    </div>
   </div>

   <nav className="hidden md:block border-t relative border-gray-100 bg-gray-100 z-40">
    <div className="container mx-auto px-4">
     <ul className="flex items-center gap-3 md:gap-4 lg:gap-6 xl:gap-8 2xl:gap-10 text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] font-bold text-slate-700 tracking-tight">
      {MENU_ITEMS.map((item) => (
       <li
        key={item.path}
        className={`py-3 lg:py-4 ${item.isSpecial ? 'hidden lg:block' : ''}`}
       >
        <Link
         href={item.path}
         onClick={closeMenu}
         onMouseEnter={item.subCategories ? () => setActiveMenu(item.name) : undefined}
         className={`flex items-center gap-1 lg:gap-2 transition-colors py-1 border-b-2 border-transparent whitespace-nowrap ${item.isSpecial
          ? "text-red-600 hover:border-red-600"
          : "hover:text-indigo-600 hover:border-indigo-600"
          } ${activeMenu === item.name ? "text-indigo-600 border-indigo-600" : ""}`}
         suppressHydrationWarning
        >
         {item.name}
         {item.subCategories && (
          <HiChevronDown
           size={14}
           className={`transition-transform duration-300 opacity-50 ${activeMenu === item.name ? "rotate-180 opacity-100" : ""}`}
           suppressHydrationWarning
          />
         )}
        </Link>

        {item.subCategories && (
         <div
          className={`absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out transform z-50 
                    ${activeMenu === item.name ? "visible opacity-100 translate-y-0" : "invisible opacity-0 translate-y-2"}`}
          onMouseLeave={() => setActiveMenu(null)}
          suppressHydrationWarning
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
                 className="text-slate-500 hover:text-indigo-600 hover:translate-x-1 transition-all duration-200 text-[14px] flex items-center gap-2 group/link"
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
              suppressHydrationWarning
             >
              Tüm {item.name} Ürünlerini Gör <HiArrowRight size={14} />
             </Link>
            </div>

            <div className="w-1/3 hidden lg:block">
             {(() => {
              const activeMenuItem = MENU_ITEMS.find(item => item.name === activeMenu);
              const bannerImage = activeMenuItem?.bannerImg || "/products/beyaz-esya.webp";
              return (
               <div className="relative h-full min-h-[200px] rounded-xl overflow-hidden group/card">
                <Image
                 src={bannerImage}
                 alt={activeMenu || "Yeni Sezon"}
                 width={600}
                 height={400}
                 className="object-cover w-full h-full transition-transform duration-700 group-hover/card:scale-105"
                 unoptimized
                 priority={false}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                 <span className="text-white text-xs font-bold uppercase mb-2 bg-indigo-600 w-fit px-2 py-1 rounded">Özel Fırsatlar</span>
                 <h4 className="text-white font-bold text-xl leading-tight">Koleksiyonumuzu Keşfedin</h4>
                </div>
               </div>
              );
             })()}
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
    <>
     <div
      className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ease-out"
      onClick={closeMenu}
     />
     <div className="md:hidden fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-linear-to-r from-indigo-600 to-purple-600 text-white z-10 shadow-lg">
       <div className="flex items-center justify-end px-4 sm:px-5 py-3">
        <button
         onClick={closeMenu}
         className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 cursor-pointer active:scale-95"
         aria-label="Menüyü Kapat"
        >
         <HiX size={22} className="text-white" />
        </button>
       </div>
      </div>

      <nav className="py-2 bg-gray-50">
       {/* Ana Kategoriler */}
       <div className="bg-white mb-2">
        <div className="px-4 sm:px-5 py-3 border-b border-gray-100">
         <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kategoriler</h3>
        </div>
        <ul className="flex flex-col">
         {MENU_ITEMS.filter(item => !item.isSpecial).map((item, index) => (
          <li key={item.path} className="border-b border-gray-100 last:border-none">
           {item.subCategories ? (
            <div className="flex flex-col">
             <button
              onClick={() => toggleMobileSubmenu(item.name)}
              className="flex items-center justify-between px-4 sm:px-5 py-4 font-semibold text-gray-900 hover:bg-indigo-50 active:bg-indigo-100 transition-all duration-200 w-full text-left group cursor-pointer"
             >
              <div className="flex items-center gap-3">
               <span className="text-base">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
               <span className="text-xs text-gray-400 font-normal">
                {item.subCategories.length} alt kategori
               </span>
               <HiChevronDown
                size={20}
                className={`text-gray-400 group-hover:text-indigo-600 transition-all duration-300 ${expandedMobileMenu === item.name ? 'rotate-180 text-indigo-600' : ''
                 }`}
               />
              </div>
             </button>
             <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedMobileMenu === item.name
               ? 'max-h-[1000px] opacity-100'
               : 'max-h-0 opacity-0'
               }`}
             >
              <ul className="bg-linear-to-b from-gray-50 to-white px-4 sm:px-5 py-3 space-y-1">
               {item.subCategories.map((sub, subIndex) => (
                <li key={sub.path}>
                 <Link
                  href={sub.path}
                  className="flex items-center gap-2 py-2.5 px-3 text-sm text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 font-medium hover:translate-x-1 active:scale-95"
                  onClick={closeMenu}
                 >
                  {sub.name}
                 </Link>
                </li>
               ))}
               <li className="pt-2 mt-2 border-t border-gray-200">
                <Link
                 href={item.path}
                 className="flex items-center justify-between gap-2 py-2.5 px-3 text-sm font-bold text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all duration-200 group/link active:scale-95"
                 onClick={closeMenu}
                >
                 <span>Tüm {item.name} Ürünleri</span>
                 <HiArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
               </li>
              </ul>
             </div>
            </div>
           ) : (
            <Link
             href={item.path}
             className="flex items-center gap-3 px-4 sm:px-5 py-4 font-semibold text-gray-900 hover:bg-indigo-50 active:bg-indigo-100 transition-all duration-200 text-base"
             onClick={closeMenu}
            >
             {item.name}
            </Link>
           )}
          </li>
         ))}
        </ul>
       </div>

       {/* Özel Kategoriler ve Favoriler */}
       <div className="bg-white px-4 sm:px-5 py-4">
        <div className="mb-3">
         <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Özel Fırsatlar</h3>
        </div>
        <div className="flex flex-col gap-2.5">
         {MENU_ITEMS.filter(item => item.isSpecial).map((item) => {
          const getItemStyles = () => {
           if (item.name === "Yeniler") {
            return {
             textColor: "text-red-600",
             bgFrom: "from-red-50",
             bgTo: "to-red-50/50",
             hoverFrom: "hover:from-red-100",
             hoverTo: "hover:to-red-100/50",
             borderColor: "border-red-100",
             iconBg: "bg-red-100"
            };
           } else if (item.name === "İndirimler") {
            return {
             textColor: "text-green-600",
             bgFrom: "from-green-50",
             bgTo: "to-green-50/50",
             hoverFrom: "hover:from-green-100",
             hoverTo: "hover:to-green-100/50",
             borderColor: "border-green-100",
             iconBg: "bg-green-100"
            };
           }
           return {
            textColor: "text-red-600",
            bgFrom: "from-red-50",
            bgTo: "to-red-50/50",
            hoverFrom: "hover:from-red-100",
            hoverTo: "hover:to-red-100/50",
            borderColor: "border-red-100",
            iconBg: "bg-red-100"
           };
          };
          const styles = getItemStyles();
          return (
           <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 px-4 py-3.5 font-bold ${styles.textColor} bg-linear-to-r ${styles.bgFrom} ${styles.bgTo} ${styles.hoverFrom} ${styles.hoverTo} rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 border ${styles.borderColor}`}
            onClick={closeMenu}
           >
            <div className={`w-10 h-10 ${styles.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
             {item.name === "Yeniler" && <HiGift size={20} className="text-red-600" />}
             {item.name === "İndirimler" && <HiTag size={20} className="text-green-600" />}
            </div>
            <span className="text-base">{item.name}</span>
           </Link>
          );
         })}
        </div>
       </div>
      </nav>
     </div>
    </>
   )}

   <ProductRequestModal show={showProductRequestModal} onClose={() => setShowProductRequestModal(false)} />

   {isSearchModalOpen && (
    <div className="fixed inset-0 bg-black/50 z-100 flex items-start justify-center pt-20 px-4" onClick={closeSearchModal}>
     <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl relative search-container" onClick={(e) => e.stopPropagation()}>
      <div className="p-6">
       <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">Arama Yap</h2>
        <button
         onClick={closeSearchModal}
         className="p-2 hover:bg-slate-100 rounded-lg transition cursor-pointer"
        >
         <HiX size={24} className="text-slate-600" />
        </button>
       </div>
       <form
        className="w-full relative group"
        onSubmit={(e) => {
         e.preventDefault();
         const term = searchTerm.trim();
         if (term) {
          closeSearchModal();
          window.location.href = `/arama?q=${encodeURIComponent(term)}`;
         }
        }}
       >
        <input
         type="text"
         name="search"
         value={searchTerm || ""}
         onChange={handleSearchChange}
         onFocus={() => {
          if (searchResults.length > 0) {
           setShowSuggestions(true);
          }
         }}
         placeholder="Ürün, kategori, marka veya seri no ara..."
         className="w-full bg-slate-100 border border-transparent rounded-full py-3 pl-5 pr-12 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-100 transition-all outline-none text-sm font-medium placeholder:text-slate-500"
         autoFocus
        />
        <button
         type="submit"
         className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-full text-white cursor-pointer hover:bg-indigo-700 shadow-md hover:scale-105 active:scale-95 transition-all"
        >
         <HiSearch size={18} />
        </button>
       </form>

       {showSuggestions && searchResults.length > 0 && (
        <div className="mt-4 bg-white rounded-xl border border-gray-200 max-h-96 overflow-y-auto">
         <div className="p-2">
          {searchResults.map((product) => {
           const productUrl = getProductUrl(product);
           return (
            <Link
             key={product._id}
             href={productUrl}
             onClick={closeSearchModal}
             className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition cursor-pointer group"
            >
             <div className="w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0 relative flex items-center justify-center p-1">
              {product.images?.[0] && (
               <Image
                src={product.images[0]}
                alt={product.name}
                width={64}
                height={64}
                className="w-full h-full object-contain"
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
           );
          })}
          {searchTerm && (
           <Link
            href={`/arama?q=${encodeURIComponent(searchTerm)}`}
            onClick={() => {
             setShowSuggestions(false);
             setIsSearchModalOpen(false);
            }}
            className="block p-3 text-center text-indigo-600 font-semibold hover:bg-indigo-50 rounded-lg transition border-t border-gray-100 mt-2"
           >
            Tüm sonuçları gör
           </Link>
          )}
         </div>
        </div>
       )}
      </div>
     </div>
    </div>
   )}
  </header>
 );
};

export default Header;