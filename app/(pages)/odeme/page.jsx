"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import PaymentHeader from "@/app/components/payment/PaymentHeader";
import PaymentLoading from "@/app/components/payment/PaymentLoading";
import PaymentEmptyCart from "@/app/components/payment/PaymentEmptyCart";
import DeliveryAddressSection from "@/app/components/payment/DeliveryAddressSection";
import PaymentMethodSection from "@/app/components/payment/PaymentMethodSection";
import OrderSummary from "@/app/components/payment/OrderSummary";
import CardForm from "@/app/components/payment/CardForm";
import SavedCardsSection from "@/app/components/payment/SavedCardsSection";

export default function OdemePage() {
 const router = useRouter();
 const { cart, clearCart } = useCart();
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
  setMounted(true);
 }, []);

 const cartTotal = useMemo(() => {
  return (cart || []).reduce((sum, item) => {
   const price = item.discountPrice && item.discountPrice < item.price
    ? item.discountPrice
    : item.price;
   return sum + (price || 0) * (item.quantity || 1);
  }, 0);
 }, [cart]);

 const shippingCost = cartTotal >= 500 ? 0 : 29.99;
 const grandTotal = cartTotal + shippingCost;


 const [addresses, setAddresses] = useState([]);
 const [addressesLoading, setAddressesLoading] = useState(true);
 const [selectedAddressId, setSelectedAddressId] = useState("");

 const [paymentMethod, setPaymentMethod] = useState({ type: "3dsecure" });
 const [selectedCardId, setSelectedCardId] = useState(null);
 const [cardData, setCardData] = useState({
  cardNumber: "",
  cardNumberFormatted: "",
  cardHolder: "",
  month: "",
  year: "",
  cvc: "",
 });

 const [acceptedTerms, setAcceptedTerms] = useState(false);
 const [error, setError] = useState("");
 const [isSubmitting, setIsSubmitting] = useState(false);

 const [savedCardsRefreshTrigger, setSavedCardsRefreshTrigger] = useState(0);
 const [saveCardLoading, setSaveCardLoading] = useState(false);
 const [saveCardError, setSaveCardError] = useState("");
 const [saveCardSuccess, setSaveCardSuccess] = useState(false);

 const fetchAddresses = useCallback(async () => {
  try {
   setAddressesLoading(true);
   const res = await axiosInstance.get("/api/user/addresses", {
    cache: "no-store",
   });
   const data = res.data || {};
   if (!data.success) {
    setAddresses([]);
    return;
   }
   const list = data.addresses || [];
   const sorted = [...list].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
   setAddresses(sorted);

   const defaultAddr = sorted.find((a) => a.isDefault) || sorted[0];
   const id = defaultAddr?._id?.toString ? defaultAddr._id.toString() : defaultAddr?._id;
   if (id) setSelectedAddressId(id);
  } finally {
   setAddressesLoading(false);
  }
 }, []);

 useEffect(() => {
  if (cart && cart.length > 0) {
   fetchAddresses();
  }
 }, [cart, fetchAddresses]);

 const canPay = useMemo(() => {
  if (!cart || cart.length === 0 || !acceptedTerms || !selectedAddressId) {
   return false;
  }

  // 3D Secure için kart bilgileri kontrolü
  // Eğer kayıtlı kart seçilmişse, CVC kontrolü yapılmaz (güvenli ödeme yöntemi)
  if (selectedCardId) {
   return true;
  }

  // Yeni kart girişi için tüm alanlar kontrol edilmeli
  if (!cardData.cardNumber || !cardData.cardHolder || !cardData.month || !cardData.year || !cardData.cvc) {
   return false;
  }

  // Kart numarası kontrolü (Amex için 15, diğerleri için 16)
  const cardNumberCleaned = cardData.cardNumber.replaceAll(" ", "");
  const getCardType = (cardNumber) => {
   if (!cardNumber || cardNumber.length === 0) return 'Kart';
   const firstTwoDigits = cardNumber.substring(0, 2);
   if (firstTwoDigits === '34' || firstTwoDigits === '37') return 'Amex';
   return 'Other';
  };
  const cardType = getCardType(cardNumberCleaned);
  const expectedLength = cardType === 'Amex' ? 15 : 16;
  const expectedCvcLen = cardType === 'Amex' ? 4 : 3;

  return cardNumberCleaned.length === expectedLength && cardData.cvc.length === expectedCvcLen;
 }, [acceptedTerms, cart, selectedAddressId, cardData, selectedCardId]);

 const handleCardSelect = (card) => {
  if (!card) {
   // Yeni kart girişi
   setSelectedCardId(null);
   setSaveCardError("");
   setSaveCardSuccess(false);
   setCardData({
    cardNumber: "",
    cardNumberFormatted: "",
    cardHolder: "",
    month: "",
    year: "",
    cvc: "",
   });
   return;
  }

  // Kayıtlı kart seçildi
  setSelectedCardId(card._id?.toString ? card._id.toString() : String(card._id || ''));
  const isAmex = (card.cardType || "").toLowerCase() === "amex";
  const fallbackMasked = isAmex
   ? `•••• •••••• ${card.cardNumberLast4 || ""}`
   : `•••• •••• •••• ${card.cardNumberLast4 || ""}`;
  const cardNumberMasked = card.cardNumberMasked
   ? String(card.cardNumberMasked).replace(/\*/g, "•")
   : fallbackMasked;
  setCardData({
   cardNumber: "",
   cardNumberFormatted: cardNumberMasked,
   cardHolder: card.cardHolder || "",
   month: card.month || "",
   year: card.year || "",
   cvc: "",
  });
 };

 const handleSaveCard = async () => {
  setSaveCardError("");
  setSaveCardSuccess(false);
  if (typeof globalThis.window !== "undefined" && globalThis.window.cardFormValidate) {
   if (!globalThis.window.cardFormValidate()) {
    setSaveCardError("Lütfen tüm kart bilgilerini doğru girin.");
    return;
   }
  }
  const raw = (cardData.cardNumber || "").replace(/\s/g, "");
  const two = raw.substring(0, 2);
  const isAmex = two === "34" || two === "37";
  const last = isAmex ? raw.slice(-5) : raw.slice(-4);
  const title = `Kart •••• ${last}`;

  setSaveCardLoading(true);
  try {
   const res = await axiosInstance.post("/api/user/cards", {
    title,
    cardNumber: raw,
    cardHolder: cardData.cardHolder?.trim() || "",
    month: String(cardData.month || ""),
    year: String(cardData.year || ""),
    cvc: String(cardData.cvc || "").trim(),
    isDefault: false,
   });
   const data = res.data || {};
   if (data.success) {
    setSaveCardSuccess(true);
    setSavedCardsRefreshTrigger((t) => t + 1);
   } else {
    setSaveCardError(data.message || "Kart kaydedilemedi.");
   }
  } catch (e) {
   const msg = e.response?.data?.message || "Kart kaydedilemedi.";
   setSaveCardError(msg);
  } finally {
   setSaveCardLoading(false);
  }
 };

 const handlePay = async () => {
  if (isSubmitting) return; // Çift tıklamayı engelle

  if (!selectedAddressId) {
   setError("Lütfen teslimat adresi seçin.");
   return;
  }

  // 3D Secure için kart bilgileri kontrolü
  // Eğer kayıtlı kart seçilmemişse, kart bilgilerini kontrol et
  if (!selectedCardId && (!cardData.cardNumber || !cardData.cardHolder || !cardData.month || !cardData.year || !cardData.cvc)) {
   setError("Lütfen tüm kart bilgilerini doldurun.");
   setIsSubmitting(false);
   return;
  }

  // Kart formu validasyonu
  if (globalThis.window?.cardFormValidate) {
   if (!globalThis.window.cardFormValidate()) {
    setError("Lütfen geçerli kart bilgileri girin.");
    setIsSubmitting(false);
    return;
   }
  }

  if (!acceptedTerms) {
   setError("Devam etmek için sözleşmeleri onaylamalısınız.");
   return;
  }
  setError("");
  setIsSubmitting(true);

  // 3D Secure Ödeme
  try {
   const selectedAddress = addresses.find((a) => String(a._id) === String(selectedAddressId));
   const addressSummary = selectedAddress
    ? `${selectedAddress.title} - ${selectedAddress.fullName}, ${selectedAddress.address}, ${selectedAddress.district}/${selectedAddress.city} (${selectedAddress.phone})`
    : "";
   const shippingAddress = selectedAddress
    ? {
     title: selectedAddress.title,
     fullName: selectedAddress.fullName,
     phone: selectedAddress.phone,
     address: selectedAddress.address,
     district: selectedAddress.district,
     city: selectedAddress.city,
    }
    : null;

   const payloadItems = (cart || []).map((i) => {
    const price = i.discountPrice && i.discountPrice < i.price ? i.discountPrice : i.price;
    return {
     productId: String(i._id || i.id),
     name: i.name,
     slug: i.slug,
     image: i?.images?.[0] || i.image || "",
     price: Number(price || 0),
     quantity: Number(i.quantity || 1),
     size: i.selectedSize || "",
     color: i.selectedColor || "",
    };
   });

   // Önce siparişi oluştur
   const orderRes = await axiosInstance.post("/api/user/orders", {
    items: payloadItems,
    total: grandTotal,
    paymentMethod: { type: "3dsecure" },
    address: {
     id: selectedAddressId,
     summary: addressSummary,
     shippingAddress,
     billingAddress: shippingAddress,
    },
   });

   const orderData = orderRes.data || {};
   if (!orderData.success) {
    setError(orderData.message || "Sipariş oluşturulamadı.");
    setIsSubmitting(false);
    return;
   }

   const orderId = orderData.orderId;

   // 3D Secure başlat
   // Eğer kayıtlı kart seçilmişse, kart ID'sini gönder
   const cardPayload = selectedCardId
    ? {
     cardId: selectedCardId,
     cvc: cardData.cvc,
    }
    : {
     cardNumber: cardData.cardNumber,
     cardHolder: cardData.cardHolder,
     month: cardData.month,
     year: cardData.year,
     cvc: cardData.cvc,
    };

   const tdsRes = await axiosInstance.post("/api/payment/3ds-initialize", {
    amount: grandTotal,
    referenceNo: orderId,
    cardData: cardPayload,
    address: {
     phone: selectedAddress?.phone || "",
     email: "",
    },
    items: payloadItems,
   });

   const tdsData = tdsRes.data || {};
   if (!tdsData.success) {
    setError(tdsData.message || "Ödeme işlemi başlatılamadı.");
    setIsSubmitting(false);
    return;
   }

   // OrderId'yi sessionStorage'a kaydet (callback için)
   if (globalThis.window !== undefined) {
    globalThis.window.sessionStorage.setItem("pendingOrderId", orderId);
   }

   // 3D Secure sayfasına yönlendir (iyzico htmlContent kullanır)
   if (tdsData.htmlContent) {
    // iyzico htmlContent'i direkt olarak bir form içerir, sayfaya ekle ve submit et
    const div = document.createElement("div");
    div.innerHTML = tdsData.htmlContent;
    document.body.appendChild(div);

    // Form'u bul ve submit et
    const form = div.querySelector("form");
    if (form) {
     form.submit();
    } else {
     // Eğer form yoksa, script tag'leri çalıştırılabilir
     const scripts = div.querySelectorAll("script");
     scripts.forEach(script => {
      const newScript = document.createElement("script");
      if (script.src) {
       newScript.src = script.src;
      } else {
       newScript.textContent = script.textContent;
      }
      document.body.appendChild(newScript);
     });
    }
   } else {
    setError("3D Secure sayfasına yönlendirilemedi.");
    setIsSubmitting(false);
   }
  } catch (e) {
   console.error("3D Secure ödeme hatası:", e);
   setError(e.response?.data?.message || "Ödeme işlemi başlatılamadı.");
   setIsSubmitting(false);
  }
 };

 if (!mounted) {
  return <PaymentLoading />;
 }

 if (!cart || cart.length === 0) {
  return <PaymentEmptyCart />;
 }

 return (
  <div className="min-h-screen bg-gray-50 py-12">
   <div className="container mx-auto px-4 max-w-5xl">
    <PaymentHeader />

    <div className="grid lg:grid-cols-3 gap-8">
     <div className="lg:col-span-2 space-y-6">
      <DeliveryAddressSection
       addresses={addresses}
       addressesLoading={addressesLoading}
       selectedAddressId={selectedAddressId}
       onAddressSelect={setSelectedAddressId}
      />

      <PaymentMethodSection>
       <SavedCardsSection
        onSelectCard={handleCardSelect}
        selectedCardId={selectedCardId}
        title="Kart Bilgileri"
        refreshTrigger={savedCardsRefreshTrigger}
       />
       {!selectedCardId && (
        <>
         <CardForm
          cardData={cardData}
          onCardDataChange={setCardData}
          isSavedCard={false}
         />
         <div className="mt-4 space-y-2">
          <button
           type="button"
           onClick={handleSaveCard}
           disabled={saveCardLoading}
           className="text-sm px-4 py-2 rounded-lg border border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
           {saveCardLoading ? "Kaydediliyor…" : "Kartı Kaydet"}
          </button>
          {saveCardError && (
           <p className="text-sm text-red-600">{saveCardError}</p>
          )}
          {saveCardSuccess && (
           <p className="text-sm text-green-600">Kart kayıtlı kartlara eklendi.</p>
          )}
         </div>
        </>
       )}
      </PaymentMethodSection>
     </div>

     <div className="lg:col-span-1">
      <OrderSummary
       cartTotal={cartTotal}
       shippingCost={shippingCost}
       grandTotal={grandTotal}
       acceptedTerms={acceptedTerms}
       onTermsChange={setAcceptedTerms}
       error={error}
       canPay={canPay && !isSubmitting}
       onPay={handlePay}
       paymentMethodType={paymentMethod.type}
       isSubmitting={isSubmitting}
      />
     </div>
    </div>
   </div>
  </div>
 );
}
