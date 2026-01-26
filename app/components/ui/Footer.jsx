"use client";
import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { HiMail, HiLocationMarker, HiPhone } from "react-icons/hi";


const SOCIAL_LINKS = [
 { icon: FaFacebook, href: "https://www.facebook.com/inegolyaziciticaret/?locale=tr_TR", label: "Facebook" },
 { icon: FaInstagram, href: "https://www.instagram.com/yaziciticaret/", label: "Instagram" },
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

const CARDS = [
 { name: "Troy", href: "/troy.png" },
 { name: "Mastercard", href: "/mastercard.webp" },
 { name: "Amex", href: "/amex.png" },
 { name: "Visa", href: "/visa.png" },
 { name: "Iyzico", href: "/iyzico.png" },
];

const Footer = () => {
 const currentYear = new Date().getFullYear();

 return (
  <footer className="bg-gray-900 text-gray-300 mt-auto">
   <div className="container mx-auto px-4 py-12">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
     <div className="md:pr-10">
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
      <h4 className="text-white font-bold mb-4">Kurumsal</h4>
      <ul className="space-y-2">
       {POLICY_LINKS.map((link) => (
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
        <HiPhone size={18} className="mt-0.5 text-indigo-400 shrink-0" />
        <div className="flex flex-wrap items-center gap-2 text-sm">
         <Link href="tel:+905447967770" className="text-gray-300 hover:text-indigo-400 transition">
          0544 796 77 70
         </Link>
         <span className="text-gray-300">ve</span>
         <Link href="tel:+905013496991" className="text-gray-300 hover:text-indigo-400 transition">
          0501 349 69 91
         </Link>
        </div>
       </li>
       <li className="flex items-start gap-3">
        <HiLocationMarker size={18} className="mt-0.5 text-indigo-400 shrink-0" />
        <p className="text-sm text-gray-300">Atatürk Bulvarı, İnegöl/Bursa</p>
       </li>
      </ul>
     </div>
    </div>
   </div>

   <div className="border-t border-gray-800">
    <div className="container mx-auto px-4 py-6">
     <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col items-center gap-3 sm:gap-5 py-2 sm:py-4">
       <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
        {CARDS.map((card) => (
         <div key={card.name} className="flex items-center justify-center rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 h-12 w-20 sm:h-16 sm:w-24">
          <Image
           src={card.href}
           alt={card.name}
           width={80}
           height={48}
           className="object-contain w-full h-full"
          />
         </div>
        ))}
       </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
       <p className="text-xs sm:text-sm text-gray-400">
        © {currentYear} YAZICI TİCARET. Tüm hakları saklıdır.
       </p>
       <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-2">
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
          width={21}
          height={21}
          className="object-contain"
         />
        </Link>
       </p>
      </div>
     </div>
    </div>
   </div>
  </footer>
 );
};

export default Footer;