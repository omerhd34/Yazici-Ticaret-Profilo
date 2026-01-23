"use client";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { HiUser, HiLocationMarker, HiCog, HiCamera, HiShoppingBag } from "react-icons/hi";
import { MdInventory2 } from "react-icons/md";
import { FaHeart, FaCreditCard } from "react-icons/fa";

export default function AccountSidebar({ userInfo, activeTab, onTabChange, onImageUpload, uploadingImage }) {
 const fileInputRef = useRef(null);

 return (
  <aside className="lg:col-span-1">
   <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="text-center mb-6 pb-6 border-b">
     <div className="relative w-20 h-20 mx-auto mb-3">
      {userInfo.profileImage ? (
       <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-md">
        <Image
         src={userInfo.profileImage}
         alt={userInfo.name}
         fill
         className="object-cover"
        />
       </div>
      ) : (
       <div className="w-20 h-20 bg-linear-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md">
        {userInfo.name.charAt(0).toUpperCase()}
       </div>
      )}
      <button
       onClick={() => fileInputRef.current?.click()}
       disabled={uploadingImage}
       className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
       title="Profil resmi değiştir"
      >
       <HiCamera size={16} />
      </button>
      <input
       ref={fileInputRef}
       type="file"
       accept="image/*"
       className="hidden"
       onChange={onImageUpload}
      />
      {uploadingImage && (
       <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
       </div>
      )}
     </div>
     <h3 className="font-bold text-gray-900">{userInfo.name}</h3>
     <p className="text-sm text-gray-500">{userInfo.email}</p>
    </div>

    <nav className="space-y-2">
     <button
      onClick={() => onTabChange("profil")}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold cursor-pointer transition ${activeTab === "profil"
       ? "bg-indigo-50 text-indigo-600"
       : "text-gray-700 hover:bg-gray-50"
       }`}
     >
      <HiUser size={20} />
      Profil Bilgileri
     </button>

     <button
      onClick={() => onTabChange("siparisler")}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold cursor-pointer transition ${activeTab === "siparisler"
       ? "bg-indigo-50 text-indigo-600"
       : "text-gray-700 hover:bg-gray-50"
       }`}
     >
      <MdInventory2 size={20} />
      Siparişlerim
     </button>

     <Link
      href="/favoriler"
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
     >
      <FaHeart size={20} />
      Favorilerim
     </Link>

     <button
      onClick={() => onTabChange("adresler")}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold cursor-pointer transition ${activeTab === "adresler"
       ? "bg-indigo-50 text-indigo-600"
       : "text-gray-700 hover:bg-gray-50"
       }`}
     >
      <HiLocationMarker size={20} />
      Adreslerim
     </button>

     <button
      onClick={() => onTabChange("kartlar")}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold cursor-pointer transition ${activeTab === "kartlar"
       ? "bg-indigo-50 text-indigo-600"
       : "text-gray-700 hover:bg-gray-50"
       }`}
     >
      <FaCreditCard size={20} />
      Kayıtlı Kartlarım
     </button>

     <button
      onClick={() => onTabChange("urun-istekleri")}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold cursor-pointer transition ${activeTab === "urun-istekleri"
       ? "bg-indigo-50 text-indigo-600"
       : "text-gray-700 hover:bg-gray-50"
       }`}
     >
      <HiShoppingBag size={20} />
      Ürün İsteklerim
     </button>

     <button
      onClick={() => onTabChange("ayarlar")}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold cursor-pointer transition ${activeTab === "ayarlar"
       ? "bg-indigo-50 text-indigo-600"
       : "text-gray-700 hover:bg-gray-50"
       }`}
     >
      <HiCog size={20} />
      Ayarlar
     </button>
    </nav>
   </div>
  </aside>
 );
}
