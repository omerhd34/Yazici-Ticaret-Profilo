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
 const [cartWithCampaigns, setCartWithCampaigns] = useState(cart || []);

 useEffect(() => {
  setMounted(true);
 }, []);

 // Sepet değiştiğinde cartWithCampaigns'i güncelle
 useEffect(() => {
  if (cart && cart.length > 0) {
   setCartWithCampaigns(cart);
  } else {
   setCartWithCampaigns([]);
  }
 }, [cart]);

 // Sepetteki ürünlere kampanya kontrolü yap ve kampanya fiyatlarını uygula
 useEffect(() => {
  const checkCampaigns = async () => {
   if (!cart || cart.length === 0) {
    setCartWithCampaigns([]);
    return;
   }

   try {
    // Ürünleri ve kampanyaları paralel olarak yükle
    const [productsRes, campaignsRes] = await Promise.all([
     axiosInstance.get("/api/products?limit=1000"),
     axiosInstance.get("/api/campaigns")
    ]);

    const productsData = productsRes.data;
    const campaignsData = campaignsRes.data;

    const allProducts = productsData.data || productsData.products || [];
    const campaigns = campaignsData.success ? campaignsData.data || [] : [];

    if (productsData.success && allProducts.length > 0) {
     // Önce sepetteki tüm ürünlerin serialNumber'larını hesapla
     const cartWithSerialNumbers = cart.map(cartItem => {
      const productId = String(cartItem._id || cartItem.id);
      const currentProduct = allProducts.find(p => String(p._id) === productId);
      if (!currentProduct) return null;

      const allColors = currentProduct._allColors || currentProduct.colors;
      const selectedColorObj = cartItem.selectedColor && allColors && Array.isArray(allColors)
       ? allColors.find(c => typeof c === 'object' && c.name === cartItem.selectedColor)
       : null;

      const colorSerialNumber = selectedColorObj?.serialNumber || currentProduct.serialNumber;

      return {
       ...cartItem,
       product: currentProduct,
       serialNumber: colorSerialNumber,
      };
     }).filter(Boolean);

     // Her kampanya için kampanyadaki tüm ürünlerin sepette olup olmadığını kontrol et
     const campaignProductCounts = {};
     campaigns.forEach(campaign => {
      if (campaign.isActive && campaign.productCodes && Array.isArray(campaign.productCodes) && campaign.campaignPrice) {
       // Kampanyadaki toplam ürün sayısı (kampanya kodlarının sayısı)
       const campaignTotalProductCount = campaign.productCodes.length;

       // Sepetteki bu kampanyaya ait ürünlerin serialNumber'larını topla (seçili renge göre)
       const cartSerialNumbers = new Set();
       cartWithSerialNumbers.forEach(item => {
        // Seçili renge göre hesaplanmış serialNumber'ı kullan
        const itemSerialNumber = item.serialNumber;
        if (campaign.productCodes.includes(itemSerialNumber)) {
         cartSerialNumbers.add(itemSerialNumber);
        }
       });

       // Kampanyadaki TÜM ürün kodlarının sepette olup olmadığını kontrol et
       const allCampaignProductsInCart = campaign.productCodes.every(code =>
        cartSerialNumbers.has(code)
       );

       // Sadece kampanyadaki TÜM ürünler sepetteyse kampanya fiyatını uygula
       if (allCampaignProductsInCart && campaignTotalProductCount > 0) {
        const campaignIdStr = String(campaign._id);
        // Kampanya fiyatını kampanyadaki toplam ürün sayısına böl (kampanya sayfasındaki mantıkla aynı)
        campaignProductCounts[campaignIdStr] = {
         cartCount: campaignTotalProductCount,
         pricePerProduct: campaign.campaignPrice / campaignTotalProductCount,
         campaign,
        };
       }
      }
     });

     // Kampanyaları kontrol et ve sepetteki ürünlere uygula
     const updatedCart = cart.map(cartItem => {
      const productId = String(cartItem._id || cartItem.id);
      const currentProduct = allProducts.find(p => String(p._id) === productId);

      if (currentProduct) {
       const allColors = currentProduct._allColors || currentProduct.colors;
       const selectedColorObj = cartItem.selectedColor && allColors && Array.isArray(allColors)
        ? allColors.find(c => typeof c === 'object' && c.name === cartItem.selectedColor)
        : null;

       const colorSerialNumber = selectedColorObj?.serialNumber || currentProduct.serialNumber;

       // Kampanya bilgilerini kontrol et ve güncelle
       let campaignPrice = cartItem.campaignPrice;
       let campaignId = cartItem.campaignId;
       let campaignTitle = cartItem.campaignTitle;
       let campaignTotalPrice = cartItem.campaignTotalPrice;

       // Eğer kampanya bilgisi yoksa, aktif kampanyalarda bu ürünü ara
       if (!campaignPrice || !campaignId) {
        // Önceden hesaplanmış kampanya bilgilerini kullan (sadece kampanyadaki TÜM ürünler sepetteyse)
        for (const [campId, campaignInfo] of Object.entries(campaignProductCounts)) {
         const isInCampaign = campaignInfo.campaign.productCodes.includes(colorSerialNumber) ||
          campaignInfo.campaign.productCodes.includes(currentProduct.serialNumber);

         if (isInCampaign) {
          campaignPrice = campaignInfo.pricePerProduct;
          campaignId = campaignInfo.campaign._id;
          campaignTitle = campaignInfo.campaign.title;
          campaignTotalPrice = campaignInfo.campaign.campaignPrice;
          break; // İlk eşleşen kampanyayı kullan
         }
        }
       }

       return {
        ...cartItem,
        ...currentProduct,
        selectedSize: cartItem.selectedSize,
        selectedColor: cartItem.selectedColor,
        serialNumber: colorSerialNumber,
        quantity: cartItem.quantity,
        addedAt: cartItem.addedAt,
        // Kampanya bilgilerini güncelle
        campaignPrice: campaignPrice,
        campaignId: campaignId,
        campaignTitle: campaignTitle,
        campaignTotalPrice: campaignTotalPrice,
       };
      }
      return cartItem;
     });

     setCartWithCampaigns(updatedCart);
    } else {
     setCartWithCampaigns(cart);
    }
   } catch (error) {
    console.error("Kampanya kontrolü yapılırken hata:", error);
    setCartWithCampaigns(cart);
   }
  };

  checkCampaigns();
 }, [cart]);

 const cartTotal = useMemo(() => {
  return (cartWithCampaigns || cart || []).reduce((sum, item) => {
   let price = item.campaignPrice;
   if (!price) {
    price = item.discountPrice && item.discountPrice < item.price
     ? item.discountPrice
     : item.price;
   }
   return sum + (price || 0) * (item.quantity || 1);
  }, 0);
 }, [cartWithCampaigns, cart]);

 const shippingCost = cartTotal >= 500 ? 0 : 29.99;
 const grandTotal = cartTotal + shippingCost;

 // Kampanya bilgilerini topla
 const campaignInfo = useMemo(() => {
  const campaignItems = (cartWithCampaigns || cart || []).filter(item => item.campaignId && item.campaignTitle);
  if (campaignItems.length === 0) return null;

  const campaignGroups = {};
  campaignItems.forEach(item => {
   const key = `${item.campaignId}_${item.campaignTitle}`;
   if (!campaignGroups[key]) {
    campaignGroups[key] = {
     campaignId: item.campaignId,
     campaignTitle: item.campaignTitle,
     items: [],
     originalTotal: 0,
     campaignTotal: 0,
    };
   }
   // Kampanya fiyatı varsa, orijinal fiyat ürünün normal fiyatı olmalı
   const originalPrice = item.price;
   campaignGroups[key].items.push(item);
   campaignGroups[key].originalTotal += originalPrice * (item.quantity || 1);
   campaignGroups[key].campaignTotal += (item.campaignPrice || originalPrice) * (item.quantity || 1);
  });

  return Object.values(campaignGroups);
 }, [cartWithCampaigns, cart]);

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
  // Kart numarasını masked format'tan al veya last digits'ten oluştur (Amex: •••• •••••• 51251, diğer: •••• •••• •••• 1234)
  const isAmex = (card.cardType || "").toLowerCase() === "amex";
  const fallbackMasked = isAmex
   ? `•••• •••••• ${card.cardNumberLast4 || ""}`
   : `•••• •••• •••• ${card.cardNumberLast4 || ""}`;
  const cardNumberMasked = card.cardNumberMasked
   ? String(card.cardNumberMasked).replace(/\*/g, "•")
   : fallbackMasked;
  setCardData({
   cardNumber: "", // Kayıtlı kartlarda tam kart numarası saklanmıyor, API'den alınacak
   cardNumberFormatted: cardNumberMasked,
   cardHolder: card.cardHolder || "",
   month: card.month || "",
   year: card.year || "",
   cvc: "", // CVC her zaman kullanıcıdan alınmalı
  });
 };

 const handlePay = async () => {
  if (isSubmitting) return; // Çift tıklamayı engelle

  if (!selectedAddressId) {
   setError("Lütfen teslimat adresi seçin.");
   return;
  }

  // 3D Secure için kart bilgileri kontrolü
  if (selectedCardId) {
   // Kayıtlı kart seçilmişse, CVC kontrolü yapılmaz (güvenli ödeme yöntemi)
   // Doğrudan devam edebilir
  } else if (!cardData.cardNumber || !cardData.cardHolder || !cardData.month || !cardData.year || !cardData.cvc) {
   // Yeni kart girişi için tüm alanlar kontrol edilmeli
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

   const payloadItems = (cartWithCampaigns || cart || []).map((i) => {
    let price = i.campaignPrice;
    if (!price) {
     price = i.discountPrice && i.discountPrice < i.price ? i.discountPrice : i.price;
    }
    return {
     productId: String(i._id || i.id),
     name: i.name,
     slug: i.slug,
     image: i?.images?.[0] || i.image || "",
     price: Number(price || 0),
     quantity: Number(i.quantity || 1),
     size: i.selectedSize || "",
     color: i.selectedColor || "",
     campaignId: i.campaignId || null,
     campaignTitle: i.campaignTitle || null,
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
     email: "", // Kullanıcı email'i session'dan alınabilir
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

   // 3D Secure sayfasına yönlendir
   if (tdsData.postUrl) {
    globalThis.window.location.href = `${tdsData.postUrl}&orderId=${orderId}`;
   } else if (tdsData.htmlContent) {
    // HTML content varsa form oluştur ve submit et
    const form = document.createElement("form");
    form.method = "POST";
    form.action = tdsData.postUrl || "";
    form.innerHTML = tdsData.htmlContent;
    document.body.appendChild(form);
    form.submit();
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

      <PaymentMethodSection
       paymentMethod={paymentMethod}
       onPaymentMethodChange={setPaymentMethod}
      />

      <div className="bg-white rounded-xl shadow-sm p-6">
       <h2 className="text-xl font-bold text-gray-900 mb-4">Kart Bilgileri</h2>
       <SavedCardsSection
        onSelectCard={handleCardSelect}
        selectedCardId={selectedCardId}
        cardData={cardData}
       />
       {!selectedCardId && (
        <CardForm
         cardData={cardData}
         onCardDataChange={setCardData}
         isSavedCard={false}
        />
       )}
       {selectedCardId && (
        <div className="mt-4">
         <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">Kayıtlı kart seçildi. Güvenli ödeme yöntemi ile devam edebilirsiniz.</p>
         </div>
        </div>
       )}
      </div>
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
       campaignInfo={campaignInfo}
      />
     </div>
    </div>
   </div>
  </div>
 );
}
