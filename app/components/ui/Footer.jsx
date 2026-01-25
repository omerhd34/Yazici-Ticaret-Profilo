"use client";
import Link from "next/link";
import Image from "next/image";

import { FaFacebook, FaInstagram, FaCcVisa, FaCcMastercard } from "react-icons/fa";
import { HiMail, HiLocationMarker, HiPhone } from "react-icons/hi";

const SOCIAL_LINKS = [
 { icon: FaFacebook, href: "https://www.facebook.com/inegolyaziciticaret/?locale=tr_TR", label: "Facebook" },
 { icon: FaInstagram, href: "https://www.instagram.com/yaziciticaret/", label: "Instagram" },
];

const QUICK_LINKS = [
 { name: "Ana Sayfa", href: "/" },
 { name: "Yeniler", href: "/kategori/yeniler" },
 { name: "İndirimler", href: "/kategori/indirim" },
 { name: "Favorilerim", href: "/favoriler" },
 { name: "Sepetim", href: "/sepet" },
];

const CUSTOMER_SERVICE_LINKS = [
 { name: "Hesabım", href: "/hesabim" },
 { name: "Siparişlerim", href: "/hesabim" },
 { name: "Destek", href: "/destek" },
 { name: "İade & Değişim", href: "/iade-degisim" },
 { name: "Sık Sorulan Sorular", href: "/sss" },
];

const POLICY_LINKS = [
 { name: "Biz Kimiz", href: "/biz-kimiz" },
 { name: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
 { name: "Kullanım Koşulları", href: "/kullanim-kosullari" },
 { name: "Çerez Politikası", href: "/cerez-politikasi" },
];

const Footer = () => {
 const currentYear = new Date().getFullYear();

 return (
  <footer className="bg-gray-900 text-gray-300 mt-auto">
   <div className="container mx-auto px-4 py-12">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
     <div>
      <div className="mb-4">
       <Link href="/" className="font-[Open_Sans] text-xl sm:text-2xl font-extrabold tracking-[0.25em] text-white select-none duration-1000 ease-out hover:text-indigo-600">
        YAZICI TİCARET
       </Link>
      </div>
      <p className="text-sm mb-4 leading-relaxed">
       Beyaz eşyadan elektroniğe, ankastreden klimalara kadar geniş ürün yelpazemizde en kaliteli ürünleri keşfedin. Modern teknoloji, güvenilir markalar ve müşteri memnuniyeti önceliğimizdir.
      </p>
      <div className="flex gap-3 mt-6">
       {SOCIAL_LINKS.map((social) => {
        const Icon = social.icon;
        return (
         <Link
          key={social.label}
          href={social.href}
          target="_blank"
          className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition"
          aria-label={social.label}
         >
          <Icon size={18} />
         </Link>
        );
       })}
      </div>
     </div>

     <div>
      <h4 className="text-white font-bold mb-4">Hızlı Linkler</h4>
      <ul className="space-y-2">
       {QUICK_LINKS.map((link) => (
        <li key={link.href}>
         <Link href={link.href} className="hover:text-indigo-400 transition text-sm">
          {link.name}
         </Link>
        </li>
       ))}
      </ul>
     </div>

     <div>
      <h4 className="text-white font-bold mb-4">Hesabım ve Destek</h4>
      <ul className="space-y-2">
       {CUSTOMER_SERVICE_LINKS.map((link) => (
        <li key={link.name}>
         <Link href={link.href} className="hover:text-indigo-400 transition text-sm">
          {link.name}
         </Link>
        </li>
       ))}
      </ul>
     </div>

     <div>
      <h4 className="text-white font-bold mb-4">İletişim</h4>
      <ul className="space-y-3">
       <li className="flex items-center gap-3">
        <HiMail size={18} className="text-indigo-400 shrink-0" />
        <Link href="mailto:info@yazici.gen.tr" className="text-sm hover:text-indigo-400 transition">
         info@yazici.gen.tr
        </Link>
       </li>
       <li className="flex items-start gap-3">
        <HiLocationMarker size={18} className="mt-0.5 text-indigo-400 shrink-0" />
        <div className="text-sm">
         <p className="text-gray-300">
          Kemalpaşa mahallesi, Atatürk bulvarı,
          <br />
          No:54/E, İnegöl/Bursa
         </p>
        </div>
       </li>
       <li className="flex items-start gap-3">
        <HiLocationMarker size={18} className="mt-0.5 text-indigo-400 shrink-0" />
        <div className="text-sm">
         <p className="text-gray-300">
          Cuma mahallesi, Atatürk bulvarı,
          <br />
          No:51, İnegöl/Bursa
         </p>
        </div>
       </li>
       <li className="flex items-start gap-3">
        <HiPhone size={18} className="mt-0.5 text-indigo-400 shrink-0" />
        <div className="text-sm">
         <p className="text-gray-300">0544 796 77 70</p>
        </div>
       </li>
       <li className="flex items-start gap-3">
        <HiPhone size={18} className="mt-0.5 text-indigo-400 shrink-0" />
        <div className="text-sm">
         <p className="text-gray-300">0501 349 69 91</p>
        </div>
       </li>
      </ul>
     </div>
    </div>
   </div>

   <div className="border-t border-gray-800">
    <div className="container mx-auto px-4 py-6">
     <div className="flex flex-col gap-6">
      {/* Ödeme Logoları */}
      <div className="flex flex-col items-center gap-5 py-4">
       <p className="text-sm text-gray-400 font-medium tracking-wide">Güvenli Ödeme</p>
       <div className="flex items-center justify-center gap-6 flex-wrap">
        <div className="flex items-center justify-center bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 h-16 w-20">
         <FaCcVisa
          size={48}
          className="text-blue-600"
          title="Visa"
         />
        </div>
        <div className="flex items-center justify-center bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 h-16 w-20">
         <FaCcMastercard
          size={48}
          className="text-orange-500"
          title="Mastercard"
         />
        </div>
        <div className="flex items-center justify-center bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 h-16 w-20">
         <Image
          src="/troy.png"
          alt="Troy"
          width={48}
          height={48}
          className="object-contain w-full h-full"
         />
        </div>
        <div className="flex items-center justify-center bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 h-16 w-20">
         <Image
          src="/iyzico.png"
          alt="iyzico ile Öde"
          width={80}
          height={48}
          className="object-contain w-full h-full"
         />
        </div>
       </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
       <div className="flex flex-col gap-1">
        <p className="text-sm text-gray-400">
         © {currentYear} YAZICI TİCARET. Tüm hakları saklıdır.
        </p>
        <p className="text-xs text-gray-500 inline-flex items-center gap-2">
         Site tasarımı ve geliştirme:{" "}
         <Link
          href="https://www.omerhalisdemir.com.tr/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 font-semibold hover:text-indigo-300 transition inline-flex items-center gap-1.5"
         >
          <Image
           src="/OHD-favicon.svg"
           alt="OHD Logo"
           width={24}
           height={24}
           className="object-contain"
          />
         </Link>
        </p>
       </div>
       <div className="flex gap-6 text-sm">
        {POLICY_LINKS.map((link) => (
         <Link key={link.href} href={link.href} className="hover:text-indigo-400 transition">
          {link.name}
         </Link>
        ))}
       </div>
      </div>
     </div>
    </div>
   </div>
  </footer>
 );
};

export default Footer;
