"use client";
import { FaCreditCard, FaShieldAlt } from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import { HiCheckCircle } from "react-icons/hi";
import Image from "next/image";

export default function PaymentMethodSection({ children }) {
 return (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
   {/* Header */}
   <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-4">
    <h2 className="text-xl font-bold text-white flex items-center gap-2">
     <MdPayment className="text-white" size={24} />
     Ödeme Yöntemi
    </h2>
   </div>

   <div className="p-6 space-y-6">
    {/* Payment Method Card */}
    <div className="relative group">
     <div className="absolute inset-0 bg-linear-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
     <div className="relative border-2 border-indigo-200 rounded-2xl p-6 bg-linear-to-br from-indigo-50/50 to-purple-50/30 hover:shadow-md transition-all duration-300">
      {/* Payment Method Header */}
      <div className="flex items-center justify-between mb-4">
       <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-3 rounded-xl shadow-lg">
         <FaCreditCard className="text-white" size={22} />
        </div>
        <div>
         <h3 className="font-bold text-gray-900 text-lg">Kart ile Ödeme</h3>
         <p className="text-sm text-indigo-600 font-medium flex items-center gap-1">
          <FaShieldAlt size={12} />
          3D Secure ile Güvenli
         </p>
        </div>
       </div>
       <div className="hidden sm:flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold">
        <HiCheckCircle size={16} />
        Güvenli
       </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
       <p className="text-sm text-gray-700 leading-relaxed">
        <span className="font-semibold text-indigo-600">iyzico</span> aracılığıyla banka veya kredi kartı bilgilerinizi girerek{" "}
        <span className="font-semibold text-purple-600">3D Secure</span> doğrulaması ile güvenli ödeme yapabilirsiniz.
        Ödeme işlemi bankanızın güvenlik sayfasında doğrulanacak ve SMS kodu ile onaylanacaktır.
        Tüm ödeme işlemleriniz güvenli bir şekilde gerçekleştirilmektedir.
       </p>
      </div>

      {/* Payment Logos */}
      <div className="mt-6 pt-5 border-t border-gray-200">
       <p className="text-xs text-gray-500 font-semibold mb-4 text-center uppercase tracking-wide">
        Güvenli Ödeme Yöntemleri
       </p>
       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center justify-items-center">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow w-full flex items-center justify-center h-16">
         <Image
          src="/visa.png"
          alt="Visa"
          width={60}
          height={40}
          className="object-contain w-full h-full"
         />
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow w-full flex items-center justify-center h-16">
         <Image
          src="/mastercard.webp"
          alt="Mastercard"
          width={60}
          height={40}
          className="object-contain w-full h-full"
         />
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow w-full flex items-center justify-center h-16">
         <Image
          src="/troy.png"
          alt="Troy"
          width={60}
          height={40}
          className="object-contain w-full h-full"
         />
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow w-full flex items-center justify-center sm:col-span-1 col-span-2 h-16">
         <Image
          src="/iyzico.png"
          alt="iyzico ile Öde"
          width={60}
          height={40}
          className="object-contain w-full h-full"
         />
        </div>
       </div>
      </div>
     </div>
    </div>

    {children && (
     <div className="pt-6 mt-2 border-t-2 border-gray-100">
      {children}
     </div>
    )}
   </div>
  </div>
 );
}
