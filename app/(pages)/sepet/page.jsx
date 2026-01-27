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

   // Ürünleri yükle
   const productsRes = await axiosInstance.get("/api/products?limit=1000");

   const productsData = productsRes.data;

   const allProducts = productsData.data || productsData.products || [];

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

    // Sepetteki ürünleri güncelle
    const updatedCart = cart.map(cartItem => {
     const productId = String(cartItem._id || cartItem.id);
     const currentProduct = allProducts.find(p => String(p._id) === productId);

     if (currentProduct) {
      const allColors = currentProduct._allColors || currentProduct.colors;
      const selectedColorObj = cartItem.selectedColor && allColors && Array.isArray(allColors)
       ? allColors.find(c => typeof c === 'object' && c.name === cartItem.selectedColor)
       : null;

      const colorSerialNumber = selectedColorObj?.serialNumber || currentProduct.serialNumber;

      return {
       ...cartItem,
       ...currentProduct,
       selectedSize: cartItem.selectedSize,
       selectedColor: cartItem.selectedColor,
       serialNumber: colorSerialNumber,
       quantity: cartItem.quantity,
       addedAt: cartItem.addedAt,
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
   const price = (item.discountPrice && item.discountPrice < item.price) ? item.discountPrice : item.price;
   return total + price * item.quantity;
  }, 0);
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
     />
    </div>
   </div>
  </div>
 );
}