"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useCart } from "@/context/CartContext";
import PaymentLoading from "@/app/components/payment/PaymentLoading";

export default function OdemeCallbackPage() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const { clearCart } = useCart();
 const [status, setStatus] = useState("processing"); // processing, success, error
 const [message, setMessage] = useState("Ödeme işlemi kontrol ediliyor...");

 useEffect(() => {
  const processPayment = async () => {
   try {
    // URL'den gelen parametreleri al
    const sessionId = searchParams.get("session_id");
    const tokenId = searchParams.get("token_id");
    const orderId = searchParams.get("orderId") || sessionStorage.getItem("pendingOrderId");

    if (!sessionId || !tokenId || !orderId) {
     setStatus("error");
     setMessage("Ödeme bilgileri bulunamadı. Lütfen tekrar deneyin.");
     return;
    }

    // 3D Secure charge işlemini tamamla
    const response = await axiosInstance.post("/api/payment/3ds-charge", {
     sessionId,
     tokenId,
     orderId,
    });

    const data = response.data;

    if (data.success) {
     setStatus("success");
     setMessage("Ödeme başarıyla tamamlandı!");
     clearCart();
     sessionStorage.removeItem("pendingOrderId");
     
     // 2 saniye sonra siparişler sayfasına yönlendir
     setTimeout(() => {
      router.push(`/hesabim?tab=siparisler`);
     }, 2000);
    } else {
     setStatus("error");
     setMessage(data.message || "Ödeme işlemi başarısız oldu.");
    }
   } catch (error) {
    console.error("Ödeme işleme hatası:", error);
    setStatus("error");
    setMessage(
     error.response?.data?.message || "Ödeme işlemi sırasında bir hata oluştu."
    );
   }
  };

  processPayment();
 }, [searchParams, router, clearCart]);

 return (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
   <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
    {status === "processing" && (
     <>
      <PaymentLoading />
      <h2 className="text-xl font-bold text-gray-900 mt-4">Ödeme İşleniyor</h2>
      <p className="text-gray-600 mt-2">{message}</p>
     </>
    )}

    {status === "success" && (
     <>
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
       <svg
        className="w-8 h-8 text-green-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
       >
        <path
         strokeLinecap="round"
         strokeLinejoin="round"
         strokeWidth={2}
         d="M5 13l4 4L19 7"
        />
       </svg>
      </div>
      <h2 className="text-xl font-bold text-green-600 mb-2">Ödeme Başarılı!</h2>
      <p className="text-gray-600">{message}</p>
      <p className="text-sm text-gray-500 mt-4">Siparişler sayfasına yönlendiriliyorsunuz...</p>
     </>
    )}

    {status === "error" && (
     <>
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
       <svg
        className="w-8 h-8 text-red-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
       >
        <path
         strokeLinecap="round"
         strokeLinejoin="round"
         strokeWidth={2}
         d="M6 18L18 6M6 6l12 12"
        />
       </svg>
      </div>
      <h2 className="text-xl font-bold text-red-600 mb-2">Ödeme Başarısız</h2>
      <p className="text-gray-600 mb-4">{message}</p>
      <button
       onClick={() => router.push("/odeme")}
       className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
      >
       Ödeme Sayfasına Dön
      </button>
     </>
    )}
   </div>
  </div>
 );
}
