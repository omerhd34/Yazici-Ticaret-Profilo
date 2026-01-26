"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdPhone, MdEmail, MdLocationOn, MdAccessTime } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import { HiExternalLink, HiX, HiChevronLeft, HiChevronRight } from "react-icons/hi";

export default function StoreCard({ title, adres, telefon, whatsappLink, email, mapUrl, images }) {
 const [lightboxOpen, setLightboxOpen] = useState(false);
 const [lightboxIndex, setLightboxIndex] = useState(0);

 const addressForMaps = encodeURIComponent(adres);
 const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${addressForMaps}`;
 const mapViewUrl = `https://www.google.com/maps/search/?api=1&query=${addressForMaps}`;

 useEffect(() => {
  const handleEscape = (e) => {
   if (e.key === 'Escape' && lightboxOpen) {
    setLightboxOpen(false);
   }
  };
  window.addEventListener('keydown', handleEscape);
  return () => window.removeEventListener('keydown', handleEscape);
 }, [lightboxOpen]);

 const openLightbox = (index) => {
  setLightboxIndex(index);
  setLightboxOpen(true);
 };

 const closeLightbox = () => {
  setLightboxOpen(false);
 };

 const nextImage = () => {
  setLightboxIndex((prev) => (prev + 1) % images.length);
 };

 const prevImage = () => {
  setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
 };

 return (
  <div className="bg-white rounded-xl shadow-md overflow-hidden">
   {/* Header */}
   <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-4">
    <h3 className="text-2xl font-bold text-white">{title}</h3>
   </div>

   {/* Contact Info */}
   <div className="p-6 space-y-4">
    {/* Phone */}
    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
     <div className="flex items-center gap-3">
      <div className="bg-indigo-100 p-2 rounded-lg">
       <MdPhone className="text-indigo-600" size={20} />
      </div>
      <div>
       <p className="text-sm text-gray-500">Telefon</p>
       <a href={`tel:${telefon}`} className="text-gray-900 font-semibold hover:text-indigo-600 transition">
        {telefon}
       </a>
      </div>
     </div>
     <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="text-green-600 hover:text-green-700 transition"
      aria-label="WhatsApp"
     >
      <FaWhatsapp size={24} />
     </a>
    </div>

    {/* Email */}
    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
     <div className="flex items-center gap-3">
      <div className="bg-indigo-100 p-2 rounded-lg">
       <MdEmail className="text-indigo-600" size={20} />
      </div>
      <div>
       <p className="text-sm text-gray-500">Mail</p>
       <a href={`mailto:${email}`} className="text-gray-900 font-semibold hover:text-indigo-600 transition">
        {email}
       </a>
      </div>
     </div>
     <a
      href={`mailto:${email}`}
      className="text-indigo-600 hover:text-indigo-700 transition"
      aria-label="E-posta gönder"
     >
      <HiExternalLink size={20} />
     </a>
    </div>

    {/* Address */}
    <div className="bg-gray-50 rounded-lg p-4">
     <div className="flex items-start gap-3">
      <div className="bg-indigo-100 p-2 rounded-lg">
       <MdLocationOn className="text-indigo-600" size={20} />
      </div>
      <div>
       <p className="text-sm text-gray-500 mb-1">Adres</p>
       <p className="text-gray-900 font-semibold">{adres}</p>
      </div>
     </div>
    </div>

    {/* Working Hours */}
    <div className="bg-gray-50 rounded-lg p-4">
     <div className="flex items-start gap-3">
      <div className="bg-indigo-100 p-2 rounded-lg">
       <MdAccessTime className="text-indigo-600" size={20} />
      </div>
      <div>
       <p className="text-sm text-gray-500 mb-1">Çalışma Saatleri</p>
       <p className="text-gray-900 font-semibold">
        Hafta içi: 09:00 - 19:00
        <br />
        Cumartesi: 09:00 - 19:00
        <br />
        Pazar: 12:00 - 17:00
       </p>
      </div>
     </div>
    </div>

    {/* Map */}
    <div className="rounded-lg overflow-hidden border border-gray-200">
     <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <iframe
       src={mapUrl}
       width="100%"
       height="100%"
       style={{ position: 'absolute', top: 0, left: 0 }}
       allowFullScreen
       loading="lazy"
       referrerPolicy="no-referrer-when-downgrade"
       className="w-full h-full"
      />
     </div>
     <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
      <Link
       href={mapDirectionsUrl}
       target="_blank"
       rel="noopener noreferrer"
       className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-2 transition"
      >
       Yol Tarifi <HiExternalLink size={16} />
      </Link>
      <Link
       href={mapViewUrl}
       target="_blank"
       rel="noopener noreferrer"
       className="text-gray-600 hover:text-gray-700 text-sm flex items-center gap-2 transition"
      >
       Daha büyük haritayı görüntüle <HiExternalLink size={16} />
      </Link>
     </div>
    </div>

    {/* Store Images */}
    {images && images.length > 0 && (
     <div className="grid grid-cols-2 gap-3">
      {images.map((img, idx) => (
       <div
        key={idx}
        className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
        onClick={() => openLightbox(idx)}
       >
        <Image
         src={img.url}
         alt={img.alt || `${title} - Görsel ${idx + 1}`}
         fill
         className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
       </div>
      ))}
     </div>
    )}
   </div>

   {/* Lightbox */}
   {lightboxOpen && images && images.length > 0 && (
    <div className="fixed inset-0 bg-black/90 z-100 flex items-center justify-center p-4">
     <button
      onClick={closeLightbox}
      className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-10 cursor-pointer"
      aria-label="Kapat"
     >
      <HiX size={32} />
     </button>

     {images.length > 1 && (
      <>
       <button
        onClick={prevImage}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition z-10 cursor-pointer"
        aria-label="Önceki"
       >
        <HiChevronLeft size={28} />
       </button>
       <button
        onClick={nextImage}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition z-10 cursor-pointer"
        aria-label="Sonraki"
       >
        <HiChevronRight size={28} />
       </button>
      </>
     )}

     <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
      <Image
       src={images[lightboxIndex].url}
       alt={images[lightboxIndex].alt || `${title} - Görsel ${lightboxIndex + 1}`}
       width={1200}
       height={800}
       className="max-w-full max-h-full object-contain"
       priority
      />
      {images.length > 1 && (
       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
        {lightboxIndex + 1} / {images.length}
       </div>
      )}
     </div>
    </div>
   )}
  </div>
 );
}