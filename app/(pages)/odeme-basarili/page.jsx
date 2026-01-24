"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MdCheckCircle, MdShoppingBag } from "react-icons/md";

export const dynamic = 'force-dynamic';

function OdemeBasariliContent() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const orderId = searchParams.get("orderId");

 useEffect(() => {
  const timer = setTimeout(() => {
   router.push("/hesabim?tab=siparisler");
  }, 2000);

  return () => clearTimeout(timer);
 }, [router]);

 return (
  <div className="min-h-screen bg-gray-50 py-12">
   <div className="container mx-auto px-4 max-w-2xl">
    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
     <div className="mb-6">
      <MdCheckCircle className="text-green-500 mx-auto" size={80} />
     </div>
     <h1 className="text-3xl font-bold text-gray-900 mb-4">Ödeme Başarılı!</h1>
     <p className="text-gray-600 mb-6">
      Siparişiniz başarıyla alındı. En kısa sürede hazırlanıp kargoya verilecektir.
     </p>
     {orderId && (
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
       <p className="text-sm text-gray-600 mb-1">Sipariş Numarası</p>
       <p className="text-lg font-bold text-indigo-600">{orderId}</p>
      </div>
     )}
     <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link
       href={`/hesabim?tab=siparisler`}
       className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
      >
       <MdShoppingBag size={20} />
       Siparişlerimi Görüntüle
      </Link>
      <Link
       href="/"
       className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
      >
       Ana Sayfaya Dön
      </Link>
     </div>
    </div>
   </div>
  </div>
 );
}

export default function OdemeBasariliPage() {
 return (
  <Suspense fallback={
   <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
     <p className="text-gray-600">Yükleniyor...</p>
    </div>
   </div>
  }>
   <OdemeBasariliContent />
  </Suspense>
 );
}