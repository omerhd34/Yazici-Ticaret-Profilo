"use client";
import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";

const CartContext = createContext();

export function CartProvider({ children }) {
 const [cart, setCart] = useState(() => {
  if (typeof window === "undefined") return [];
  try {
   const savedCart = localStorage.getItem("cart");
   return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
   return [];
  }
 });

 const [favorites, setFavorites] = useState(() => {
  if (typeof window === "undefined") return [];
  try {
   const savedFavorites = localStorage.getItem("favorites");
   return savedFavorites ? JSON.parse(savedFavorites) : [];
  } catch (error) {
   return [];
  }
 });

 // MongoDB'den favorileri yükle ve geçersiz ürünleri temizle (eğer kullanıcı giriş yaptıysa)
 useEffect(() => {
  if (typeof window === "undefined") return;

  let isFetching = false;
  let lastFetchTime = 0;
  const FETCH_COOLDOWN = 5000;

  const fetchFavoritesFromDB = async () => {
   const now = Date.now();
   if (isFetching || (now - lastFetchTime < FETCH_COOLDOWN)) {
    return;
   }

   isFetching = true;
   lastFetchTime = now;

   try {
    const productsRes = await axiosInstance.get("/api/products?limit=1000");
    const productsData = productsRes.data;

    const allProducts = productsData.data || productsData.products || [];

    if (!productsData.success || allProducts.length === 0) {
     const localFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
     if (localFavorites.length > 0) {
      setFavorites([]);
      localStorage.removeItem("favorites");
     }
     return;
    }
    const allProductIds = new Set(allProducts.map(p => String(p._id)));

    let dbFavoriteIds = [];
    try {
     const res = await axiosInstance.get("/api/user/favorites");
     const data = res.data;

     if (data.success && data.favorites && data.favorites.length > 0) {
      dbFavoriteIds = data.favorites.map(fav => String(fav._id || fav)).filter(Boolean);
     }
    } catch (error) {
    }

    const localFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const localIds = localFavorites
     .map(fav => {
      const id = fav._id || fav.id;
      return id ? String(id) : null;
     })
     .filter(Boolean);

    const allFavoriteIds = [...new Set([...dbFavoriteIds, ...localIds])];

    const validFavoriteIds = allFavoriteIds.filter(id => allProductIds.has(id));

    const favoriteProducts = allProducts.filter(product =>
     validFavoriteIds.includes(String(product._id))
    );

    setFavorites(prevFavorites => {
     const prevIds = new Set(prevFavorites.map(f => String(f._id || f.id)));
     const newIds = new Set(favoriteProducts.map(f => String(f._id)));

     if (prevIds.size === newIds.size &&
      [...prevIds].every(id => newIds.has(id))) {
      return prevFavorites;
     }

     return favoriteProducts;
    });
   } catch (error) {
   } finally {
    isFetching = false;
   }
  };

  fetchFavoritesFromDB();

  const handleStorageChange = (e) => {
   if (e.key === 'favorites' || e.key === null) {
    fetchFavoritesFromDB();
   }
  };

  const handleFavoritesUpdate = () => {
   fetchFavoritesFromDB();
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("favoritesUpdated", handleFavoritesUpdate);

  return () => {
   window.removeEventListener("storage", handleStorageChange);
   window.removeEventListener("favoritesUpdated", handleFavoritesUpdate);
  };
 }, []);

 const updateCartPrices = async () => {
  if (cart.length === 0) return;

  try {
   const productsRes = await axiosInstance.get("/api/products?limit=1000");
   const productsData = productsRes.data;

   if (!productsData.success) return;

   const allProducts = productsData.data || productsData.products || [];
   if (allProducts.length === 0) return;

   setCart((prevCart) => {
    const updatedCart = prevCart.map((cartItem) => {
     const productId = String(cartItem._id || cartItem.id);
     const currentProduct = allProducts.find((p) => String(p._id) === productId);

     if (currentProduct) {
      return {
       ...cartItem,
       ...currentProduct,
       selectedSize: cartItem.selectedSize,
       selectedColor: cartItem.selectedColor,
       quantity: cartItem.quantity,
       addedAt: cartItem.addedAt,
      };
     }
     return cartItem;
    });

    const hasChanges = prevCart.some((oldItem, index) => {
     const newItem = updatedCart[index];
     if (!newItem) return true;
     const oldPrice = oldItem.discountPrice && oldItem.discountPrice < oldItem.price
      ? oldItem.discountPrice
      : oldItem.price;
     const newPrice = newItem.discountPrice && newItem.discountPrice < newItem.price
      ? newItem.discountPrice
      : newItem.price;
     return oldPrice !== newPrice || oldItem.stock !== newItem.stock;
    });

    return hasChanges ? updatedCart : prevCart;
   });
  } catch (error) {
  }
 };

 // Sepetteki ürünlerin fiyatlarını düzenli olarak güncelle
 useEffect(() => {
  if (typeof window === "undefined" || cart.length === 0) return;

  // İlk yüklemede güncelle (setTimeout ile async işlemi başlat)
  const timeoutId = setTimeout(() => {
   updateCartPrices();
  }, 1000); // 1 saniye bekle (sayfa yüklenmesini bekle)

  // Sayfa görünür olduğunda veya odaklandığında yeniden kontrol et
  const handleVisibilityChange = () => {
   if (!document.hidden) {
    updateCartPrices();
   }
  };

  const handleFocus = () => {
   updateCartPrices();
  };

  // Custom event dinle (sepet sayfası güncellediğinde)
  const handleCartUpdate = () => {
   updateCartPrices();
  };

  window.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("focus", handleFocus);
  window.addEventListener("cartUpdated", handleCartUpdate);

  return () => {
   clearTimeout(timeoutId);
   window.removeEventListener("visibilitychange", handleVisibilityChange);
   window.removeEventListener("focus", handleFocus);
   window.removeEventListener("cartUpdated", handleCartUpdate);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [cart.length]);

 useEffect(() => {
  if (typeof window === "undefined") return;
  if (cart.length > 0) {
   localStorage.setItem("cart", JSON.stringify(cart));
  } else {
   localStorage.removeItem("cart");
  }
 }, [cart]);

 useEffect(() => {
  if (typeof window === "undefined") return;
  if (favorites.length > 0) {
   localStorage.setItem("favorites", JSON.stringify(favorites));
  } else {
   localStorage.removeItem("favorites");
  }
 }, [favorites]);

 const addToCart = (product, selectedSize = null, selectedColor = null, quantity = 1) => {
  if (product.stock === 0 || product.stock < quantity) {
   return;
  }

  if (quantity > 10) {
   return;
  }

  setCart((prevCart) => {
   const existingItemIndex = prevCart.findIndex(
    (item) =>
     item._id === product._id &&
     item.selectedSize === selectedSize &&
     item.selectedColor === selectedColor
   );

   if (existingItemIndex > -1) {
    const updatedCart = [...prevCart];
    const newQuantity = updatedCart[existingItemIndex].quantity + quantity;
    const maxQuantity = Math.min(product.stock, 10);
    if (newQuantity > maxQuantity) {
     updatedCart[existingItemIndex].quantity = maxQuantity;
    } else {
     updatedCart[existingItemIndex].quantity = newQuantity;
    }
    return updatedCart;
   } else {
    return [
     ...prevCart,
     {
      ...product,
      selectedSize,
      selectedColor,
      quantity: Math.min(quantity, 10),
      addedAt: Date.now(),
     },
    ];
   }
  });
 };

 const removeFromCart = (productId, selectedSize = null, selectedColor = null) => {
  setCart((prevCart) =>
   prevCart.filter(
    (item) =>
     !(
      item._id === productId &&
      item.selectedSize === selectedSize &&
      item.selectedColor === selectedColor
     )
   )
  );
 };

 const updateQuantity = (productId, selectedSize, selectedColor, newQuantity) => {
  if (newQuantity <= 0) {
   removeFromCart(productId, selectedSize, selectedColor);
   return;
  }

  // Maksimum 10 adet kontrolü
  if (newQuantity > 10) {
   newQuantity = 10;
  }

  setCart((prevCart) =>
   prevCart.map((item) => {
    if (
     item._id === productId &&
     item.selectedSize === selectedSize &&
     item.selectedColor === selectedColor
    ) {
     const maxQuantity = Math.min(item.stock || 10, 10);
     return { ...item, quantity: Math.min(newQuantity, maxQuantity) };
    }
    return item;
   })
  );
 };

 const clearCart = () => {
  setCart([]);
  localStorage.removeItem("cart");
 };

 const getCartTotal = () => {
  return cart.reduce((total, item) => {
   const price = (item.discountPrice && item.discountPrice < item.price) ? item.discountPrice : item.price;
   return total + price * item.quantity;
  }, 0);
 };

 const getCartItemCount = () => {
  return cart.reduce((total, item) => total + item.quantity, 0);
 };

 const getFavoriteCount = () => {
  return favorites.length;
 };

 const addToFavorites = async (product) => {
  if (!product || !product._id) return;
  const productIdStr = String(product._id);
  let previousFavorites = favorites;

  setFavorites((prev) => {
   previousFavorites = prev;
   if (prev.some((item) => String(item._id || item.id) === productIdStr)) {
    return prev;
   }
   return [...prev, product];
  });

  const updatedFavorites = previousFavorites.some((item) => String(item._id || item.id) === productIdStr)
   ? previousFavorites
   : [...previousFavorites, product];

  if (typeof window !== "undefined") {
   localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
   window.dispatchEvent(new Event("favoritesUpdated"));
  }

  try {
   const res = await axiosInstance.post("/api/user/favorites", {
    productId: product._id,
   });
   const data = res.data;
   if (!data.success) {
    setFavorites(previousFavorites);
    if (typeof window !== "undefined") {
     localStorage.setItem("favorites", JSON.stringify(previousFavorites));
     window.dispatchEvent(new Event("favoritesUpdated"));
    }
   }
  } catch (error) {
   // Hata durumunda geri al
   setFavorites(previousFavorites);
   if (typeof window !== "undefined") {
    localStorage.setItem("favorites", JSON.stringify(previousFavorites));
    window.dispatchEvent(new Event("favoritesUpdated"));
   }
  }
 };

 const removeFromFavorites = async (productId) => {
  if (!productId) return;
  const productIdStr = String(productId);
  let previousFavorites = favorites;

  setFavorites((prev) => {
   previousFavorites = prev;
   return prev.filter((item) => String(item._id || item.id) !== productIdStr);
  });

  const updatedFavorites = previousFavorites.filter((item) => String(item._id || item.id) !== productIdStr);

  if (typeof window !== "undefined") {
   localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
   window.dispatchEvent(new Event("favoritesUpdated"));
  }

  try {
   const res = await axiosInstance.delete(`/api/user/favorites?productId=${productId}`);
   const data = res.data;
   if (!data.success) {
    setFavorites(previousFavorites);
    if (typeof window !== "undefined") {
     localStorage.setItem("favorites", JSON.stringify(previousFavorites));
     window.dispatchEvent(new Event("favoritesUpdated"));
    }
   } else {
    if (typeof window !== "undefined") {
     window.dispatchEvent(new Event("favoritesUpdated"));
    }
   }
  } catch (error) {
   setFavorites(previousFavorites);
   if (typeof window !== "undefined") {
    localStorage.setItem("favorites", JSON.stringify(previousFavorites));
    window.dispatchEvent(new Event("favoritesUpdated"));
   }
  }
 };

 const isFavorite = (productId) => {
  if (!productId) return false;
  const productIdStr = String(productId);
  return favorites.some((item) => String(item._id || item.id) === productIdStr);
 };

 useEffect(() => {
  if (typeof window === "undefined" || cart.length === 0) return;

  const updateCartPrices = async () => {
   try {
    const productsRes = await axiosInstance.get("/api/products?limit=1000");
    const productsData = productsRes.data;

    if (!productsData.success) return;

    const allProducts = productsData.data || productsData.products || [];
    if (allProducts.length === 0) return;

    setCart((prevCart) => {
     const updatedCart = prevCart.map((cartItem) => {
      const productId = String(cartItem._id || cartItem.id);
      const currentProduct = allProducts.find((p) => String(p._id) === productId);

      if (currentProduct) {
       return {
        ...cartItem,
        ...currentProduct,
        selectedSize: cartItem.selectedSize,
        selectedColor: cartItem.selectedColor,
        quantity: cartItem.quantity,
        addedAt: cartItem.addedAt,
       };
      }
      return cartItem;
     });

     const hasChanges = prevCart.some((oldItem, index) => {
      const newItem = updatedCart[index];
      if (!newItem) return true;
      const oldPrice = oldItem.discountPrice && oldItem.discountPrice < oldItem.price
       ? oldItem.discountPrice
       : oldItem.price;
      const newPrice = newItem.discountPrice && newItem.discountPrice < newItem.price
       ? newItem.discountPrice
       : newItem.price;
      return oldPrice !== newPrice || oldItem.stock !== newItem.stock;
     });

     return hasChanges ? updatedCart : prevCart;
    });
   } catch (error) {
   }
  };

  // İlk yüklemede güncelle
  const timeoutId = setTimeout(() => {
   updateCartPrices();
  }, 1000); // 1 saniye bekle (sayfa yüklenmesini bekle)

  // Sayfa görünür olduğunda veya odaklandığında yeniden kontrol et
  const handleVisibilityChange = () => {
   if (!document.hidden) {
    updateCartPrices();
   }
  };

  const handleFocus = () => {
   updateCartPrices();
  };

  // Custom event dinle (sepet sayfası güncellediğinde)
  const handleCartUpdate = () => {
   updateCartPrices();
  };

  window.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("focus", handleFocus);
  window.addEventListener("cartUpdated", handleCartUpdate);

  return () => {
   clearTimeout(timeoutId);
   window.removeEventListener("visibilitychange", handleVisibilityChange);
   window.removeEventListener("focus", handleFocus);
   window.removeEventListener("cartUpdated", handleCartUpdate);
  };
 }, [cart.length]);


 const value = {
  cart,
  favorites,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getCartTotal,
  getCartItemCount,
  getFavoriteCount,
  addToFavorites,
  removeFromFavorites,
  isFavorite,
  updateCartPrices,
 };

 return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
 const context = useContext(CartContext);
 if (!context) {
  throw new Error("useCart must be used within a CartProvider");
 }
 return context;
}