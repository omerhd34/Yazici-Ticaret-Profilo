"use client";
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/axios";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import CartLoading from "@/app/components/cart/CartLoading";
import CartEmpty from "@/app/components/cart/CartEmpty";
import CartItemsList from "@/app/components/cart/CartItemsList";
import CartOrderSummary from "@/app/components/cart/CartOrderSummary";

export default function SepetPage() {
 const { cart: localStorageCart, removeFromCart, updateQuantity, clearCart } = useCart();
 const router = useRouter();
 const [cartItems, setCartItems] = useState([]);
 const [loading, setLoading] = useState(true);

 const fetchCartProducts = useCallback(async () => {
  const cart = localStorageCart;
  if (cart.length === 0) {
   setCartItems([]);
   setLoading(false);
   return;
  }

  setLoading(true);
  try {
   const cartProductIds = cart.map(item => String(item._id || item.id)).filter(Boolean);

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
      let campaignPrice = null;
      let campaignId = null;
      let campaignTitle = null;
      let campaignTotalPrice = null;

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

    setCartItems(updatedCart);

    if (typeof window !== "undefined") {
     window.dispatchEvent(new Event("cartUpdated"));
    }
   } else {
    setCartItems(cart);
   }
  } catch (error) {
   setCartItems(cart);
  } finally {
   setLoading(false);
  }
 }, [localStorageCart]);

 useEffect(() => {
  fetchCartProducts();
 }, [fetchCartProducts]);

 useEffect(() => {
  if (localStorageCart.length === 0) {
   setCartItems([]);
   return;
  }

  setCartItems(prevItems => {
   return localStorageCart.map(cartItem => {
    const existingItem = prevItems.find(item =>
     String(item._id || item.id) === String(cartItem._id || cartItem.id) &&
     item.selectedSize === cartItem.selectedSize &&
     item.selectedColor === cartItem.selectedColor
    );

    if (existingItem) {
     return {
      ...existingItem,
      quantity: cartItem.quantity,
     };
    }
    return cartItem;
   });
  });
 }, [localStorageCart]);

 const getCartTotal = () => {
  return cartItems.reduce((total, item) => {
   // Kampanya fiyatı varsa onu kullan
   let price = item.campaignPrice;
   if (!price) {
    price = (item.discountPrice && item.discountPrice < item.price) ? item.discountPrice : item.price;
   }
   return total + price * item.quantity;
  }, 0);
 };

 // Kampanya bilgilerini topla
 const getCampaignInfo = () => {
  const campaignItems = cartItems.filter(item => item.campaignId && item.campaignTitle);
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
   campaignGroups[key].originalTotal += originalPrice * item.quantity;
   campaignGroups[key].campaignTotal += (item.campaignPrice || originalPrice) * item.quantity;
  });

  return Object.values(campaignGroups);
 };

 const handleCheckout = () => {
  if (!canCheckout) return;
  router.push("/odeme");
 };

 if (loading) {
  return <CartLoading />;
 }

 if (cartItems.length === 0) {
  return <CartEmpty />;
 }

 const shippingCost = getCartTotal() >= 500 ? 0 : 29.99;
 const total = getCartTotal() + shippingCost;
 const minOrderTotal = 300;
 const canCheckout = getCartTotal() >= minOrderTotal;

 return (
  <div className="min-h-screen bg-gray-50 py-12">
   <div className="container mx-auto px-4">
    <h1 className="text-3xl font-black mb-8">Sepetim ({cartItems.length} Ürün)</h1>

    <div className="grid lg:grid-cols-3 gap-8">
     <CartItemsList
      cartItems={cartItems}
      onUpdateQuantity={updateQuantity}
      onRemove={removeFromCart}
      onClearCart={clearCart}
     />

     <CartOrderSummary
      cartTotal={getCartTotal()}
      shippingCost={shippingCost}
      total={total}
      canCheckout={canCheckout}
      minOrderTotal={minOrderTotal}
      onCheckout={handleCheckout}
      campaignInfo={getCampaignInfo()}
     />
    </div>
   </div>
  </div>
 );
}