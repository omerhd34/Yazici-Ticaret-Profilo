"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import axiosInstance from "@/lib/axios";

const CartContext = createContext();

const getCartKey = (uid) => (uid ? `cart_${uid}` : "cart");
const getFavKey = (uid) => (uid ? `favorites_${uid}` : "favorites");

export function CartProvider({ children }) {
 const pathname = usePathname();
 const [userId, setUserId] = useState(null);
 const [cart, setCart] = useState([]);
 const [favorites, setFavorites] = useState([]);
 const [hasLoaded, setHasLoaded] = useState(false);

 // Admin sayfalarında sepet/favoriler gerekmez
 const isAdminPage = pathname?.startsWith('/admin');

 // Auth kontrolü: userId al, ardından ilgili sepet/favorileri yükle
 useEffect(() => {
  if (globalThis.window === undefined) return;

  const init = async () => {
   try {
    const res = await axiosInstance.get("/api/user/check", { cache: "no-store" });
    const data = res.data;
    const uid = data?.authenticated && data?.user?.id ? data.user.id : null;
    setUserId(uid);

    const cKey = getCartKey(uid);
    const fKey = getFavKey(uid);
    try {
     const savedCart = localStorage.getItem(cKey);
     const savedFav = localStorage.getItem(fKey);
     setCart(savedCart ? JSON.parse(savedCart) : []);
     setFavorites(savedFav ? JSON.parse(savedFav) : []);
    } catch (error_) {
     setCart([]);
     setFavorites([]);
    }
   } catch (error_) {
    setUserId(null);
    try {
     const savedCart = localStorage.getItem("cart");
     const savedFav = localStorage.getItem("favorites");
     setCart(savedCart ? JSON.parse(savedCart) : []);
     setFavorites(savedFav ? JSON.parse(savedFav) : []);
    } catch (error_) {
     setCart([]);
     setFavorites([]);
    }
   } finally {
    setHasLoaded(true);
   }
  };
  init();

  // Logout event dinleyicisi
  const handleLogout = () => {
   setUserId(null);
   setCart([]);
   setFavorites([]);
  };

  if (globalThis.window) {
   globalThis.window.addEventListener('logout', handleLogout);
  }

  return () => {
   if (globalThis.window) {
    globalThis.window.removeEventListener('logout', handleLogout);
   }
  };
 }, []);

 // Sepet verilerini veritabanından yükle ve senkronize et (giriş yapılmışsa)
 useEffect(() => {
  if (typeof globalThis.window === "undefined" || !hasLoaded || isAdminPage) return;
  const cKey = getCartKey(userId);

  let isFetching = false;
  let lastFetchTime = 0;
  const FETCH_COOLDOWN = 5000;

  const syncCartWithDB = async () => {
   const now = Date.now();
   if (isFetching || now - lastFetchTime < FETCH_COOLDOWN) return;
   isFetching = true;
   lastFetchTime = now;

   try {
    const localCart = JSON.parse(localStorage.getItem(cKey) || "[]");
    const localCartIds = localCart
     .map((item) => {
      const id = item._id || item.id;
      return id ? String(id) : null;
     })
     .filter(Boolean);

    let dbCartIds = [];
    // Sadece kullanıcı giriş yaptıysa veritabanından sepeti getir
    if (userId) {
     try {
      const res = await axiosInstance.get("/api/user/cart");
      const d = res.data;
      if (d.success && d.cart?.length) dbCartIds = d.cart.map((id) => String(id)).filter(Boolean);
     } catch (error_) {
      // 401 hatası = kullanıcı authenticated değil, sadece localStorage kullan
      if (error_?.response?.status === 401) {
       isFetching = false;
       return;
      }
      if (localCartIds.length > 0) {
       try {
        await axiosInstance.put("/api/user/cart", { productIds: localCartIds });
       } catch (__) { }
      }
      isFetching = false;
      return;
     }
    } else {
     // Kullanıcı giriş yapmamış, sadece localStorage kullan
     isFetching = false;
     return;
    }

    const allCartIds = [...new Set([...dbCartIds, ...localCartIds])];
    if (allCartIds.length > 0 && allCartIds.length !== dbCartIds.length) {
     try {
      await axiosInstance.put("/api/user/cart", { productIds: allCartIds });
     } catch (_) { }
    }
   } catch (_) {
   } finally {
    isFetching = false;
   }
  };

  syncCartWithDB();

  const onStorage = (e) => {
   if (e.key === cKey || e.key === "cart" || e.key === null) syncCartWithDB();
  };
  const onCartUpdate = () => syncCartWithDB();

  globalThis.addEventListener("storage", onStorage);
  globalThis.addEventListener("cartUpdated", onCartUpdate);

  return () => {
   globalThis.removeEventListener("storage", onStorage);
   globalThis.removeEventListener("cartUpdated", onCartUpdate);
  };
 }, [userId, hasLoaded, isAdminPage]);

 // Logout: sepet/favoriler silinmez (kullanıcı tekrar girişte kendi sepeti yüklenecek)
 useEffect(() => {
  const handleLogout = () => { /* no-op */ };
  window.addEventListener("logout", handleLogout);
  return () => window.removeEventListener("logout", handleLogout);
 }, []);

 useEffect(() => {
  if (typeof window === "undefined" || !hasLoaded || isAdminPage) return;
  const fKey = getFavKey(userId);

  let isFetching = false;
  let lastFetchTime = 0;
  const FETCH_COOLDOWN = 5000;

  const fetchFavoritesFromDB = async () => {
   const now = Date.now();
   if (isFetching || now - lastFetchTime < FETCH_COOLDOWN) return;
   isFetching = true;
   lastFetchTime = now;

   try {
    const productsRes = await axiosInstance.get("/api/products?limit=1000");
    const productsData = productsRes.data;
    const allProducts = productsData.data || productsData.products || [];

    if (!productsData.success || allProducts.length === 0) {
     const localFav = JSON.parse(localStorage.getItem(fKey) || "[]");
     if (localFav.length > 0) {
      setFavorites([]);
      localStorage.removeItem(fKey);
     }
     isFetching = false;
     return;
    }
    const allProductIds = new Set(allProducts.map((p) => String(p._id)));

    let dbFavoriteIds = [];
    // Sadece kullanıcı giriş yaptıysa veritabanından favorileri getir
    if (userId) {
     try {
      const res = await axiosInstance.get("/api/user/favorites");
      const data = res.data;
      if (data.success && data.favorites?.length)
       dbFavoriteIds = data.favorites.map((fav) => String(fav._id || fav)).filter(Boolean);
     } catch (error_) {
      // 401 hatası = kullanıcı authenticated değil, favorileri sadece localStorage'dan al
      if (error_?.response?.status === 401) {
       // Kullanıcı logout olmuş, sadece local favorileri kullan
       dbFavoriteIds = [];
      }
     }
    }

    const localFav = JSON.parse(localStorage.getItem(fKey) || "[]");
    const localIds = localFav
     .map((fav) => {
      const id = fav._id || fav.id;
      return id ? String(id) : null;
     })
     .filter(Boolean);

    const allFavoriteIds = [...new Set([...dbFavoriteIds, ...localIds])];
    const validFavoriteIds = new Set(allFavoriteIds.filter((id) => allProductIds.has(id)));
    const favoriteProducts = allProducts.filter((p) => validFavoriteIds.has(String(p._id)));

    setFavorites((prev) => {
     const prevIds = new Set(prev.map((f) => String(f._id || f.id)));
     const newIds = new Set(favoriteProducts.map((f) => String(f._id)));
     if (prevIds.size === newIds.size && [...prevIds].every((id) => newIds.has(id))) return prev;
     return favoriteProducts;
    });
   } catch (_) {
   } finally {
    isFetching = false;
   }
  };

  fetchFavoritesFromDB();

  const onStorage = (e) => {
   if (e.key === fKey || e.key === "favorites" || e.key === null) fetchFavoritesFromDB();
  };
  const onFavUpdate = () => fetchFavoritesFromDB();

  globalThis.addEventListener("storage", onStorage);
  globalThis.addEventListener("favoritesUpdated", onFavUpdate);

  return () => {
   globalThis.removeEventListener("storage", onStorage);
   globalThis.removeEventListener("favoritesUpdated", onFavUpdate);
  };
 }, [userId, hasLoaded, isAdminPage]);

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
  } catch (error_) {
  }
 };

 useEffect(() => {
  if (typeof globalThis.window === "undefined" || cart.length === 0 || isAdminPage) return;

  const timeoutId = setTimeout(() => {
   updateCartPrices();
  }, 1000);

  const handleVisibilityChange = () => {
   if (!document.hidden) {
    updateCartPrices();
   }
  };

  const handleFocus = () => {
   updateCartPrices();
  };

  const handleCartUpdate = () => {
   updateCartPrices();
  };

  globalThis.addEventListener("visibilitychange", handleVisibilityChange);
  globalThis.addEventListener("focus", handleFocus);
  globalThis.addEventListener("cartUpdated", handleCartUpdate);

  return () => {
   clearTimeout(timeoutId);
   globalThis.removeEventListener("visibilitychange", handleVisibilityChange);
   globalThis.removeEventListener("focus", handleFocus);
   globalThis.removeEventListener("cartUpdated", handleCartUpdate);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [cart.length, isAdminPage]);

 useEffect(() => {
  if (typeof globalThis.window === "undefined" || !hasLoaded || isAdminPage) return;
  const cKey = getCartKey(userId);
  if (cart.length > 0) {
   localStorage.setItem(cKey, JSON.stringify(cart));
  } else {
   localStorage.removeItem(cKey);
  }
 }, [cart, userId, hasLoaded, isAdminPage]);

 useEffect(() => {
  if (typeof globalThis.window === "undefined" || !hasLoaded || isAdminPage) return;
  const fKey = getFavKey(userId);
  if (favorites.length > 0) {
   localStorage.setItem(fKey, JSON.stringify(favorites));
  } else {
   localStorage.removeItem(fKey);
  }
 }, [favorites, userId, hasLoaded, isAdminPage]);

 const addToCart = async (product, selectedSize = null, selectedColor = null, quantity = 1) => {
  if (product.stock === 0 || product.stock < quantity) {
   return;
  }

  if (quantity > 10) {
   return;
  }

  // Yeni sepeti hesapla
  let newCart;
  setCart((prevCart) => {
   const existingItemIndex = prevCart.findIndex(
    (item) =>
     item._id === product._id &&
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
    newCart = updatedCart;
    return updatedCart;
   } else {
    newCart = [
     ...prevCart,
     {
      ...product,
      selectedColor,
      quantity: Math.min(quantity, 10),
      addedAt: Date.now(),
     },
    ];
    return newCart;
   }
  });

  // Veritabanına kaydet (giriş yapılmışsa)
  if (newCart) {
   try {
    const productIds = newCart.map(item => String(item._id || item.id)).filter(Boolean);
    await axiosInstance.put("/api/user/cart", { productIds });
   } catch (error) {
    // 401 hatası = kullanıcı authenticated değil, sessizce devam et
    // Sepet veritabanına kaydedilemedi - localStorage'da kalacak
   }
  }
 };

 const removeFromCart = async (productId, selectedSize = null, selectedColor = null) => {
  let newCart;
  setCart((prevCart) => {
   newCart = prevCart.filter(
    (item) =>
     !(
      item._id === productId &&
      item.selectedColor === selectedColor
     )
   );
   return newCart;
  });

  // Veritabanından sil (giriş yapılmışsa)
  // Eğer aynı ürünün başka varyantı sepetde kaldıysa silme
  try {
   const remainingItems = newCart.filter(
    (item) => item._id === productId && item.selectedColor !== selectedColor
   );
   if (remainingItems.length === 0) {
    // Aynı ürünün başka varyantı yoksa veritabanından sil
    await axiosInstance.delete(`/api/user/cart?productId=${productId}`);
   }
   // Sepeti tamamen güncelle
   const productIds = newCart.map(item => String(item._id || item.id)).filter(Boolean);
   await axiosInstance.put("/api/user/cart", { productIds });
  } catch (error) {
   // 401 hatası = kullanıcı authenticated değil, sessizce devam et
   // Giriş yapılmamışsa veya hata varsa sessizce devam et
  }
 };

 const updateQuantity = (productId, selectedSize, selectedColor, newQuantity) => {
  if (newQuantity <= 0) {
   removeFromCart(productId, selectedSize, selectedColor);
   return;
  }

  if (newQuantity > 10) {
   newQuantity = 10;
  }

  setCart((prevCart) =>
   prevCart.map((item) => {
    if (
     item._id === productId &&
     item.selectedColor === selectedColor
    ) {
     const maxQuantity = Math.min(item.stock || 10, 10);
     return { ...item, quantity: Math.min(newQuantity, maxQuantity) };
    }
    return item;
   })
  );
 };

 const clearCart = async () => {
  setCart([]);

  if (typeof globalThis.window !== "undefined") {
   // Tüm sepet anahtarlarını temizle
   const keysToRemove = ['cart'];

   // Mevcut userId'li sepeti temizle
   if (userId) {
    keysToRemove.push(`cart_${userId}`);
   }

   // localStorage'daki tüm cart ile başlayan anahtarları bul ve temizle
   try {
    for (let i = 0; i < localStorage.length; i++) {
     const key = localStorage.key(i);
     if (key && key.startsWith('cart')) {
      keysToRemove.push(key);
     }
    }
   } catch (e) {
    // localStorage erişim hatası
   }

   // Tüm sepet anahtarlarını temizle
   keysToRemove.forEach(key => {
    try {
     localStorage.removeItem(key);
    } catch (e) {
     // Silme hatası - devam et
    }
   });
  }

  // API'den de sepeti temizle
  try {
   await axiosInstance.put("/api/user/cart", { productIds: [] });
  } catch (error_) {
   // API hatası olsa bile localStorage temizlendi
  }

  // Cart updated event'i tetikle
  if (typeof globalThis.window !== "undefined") {
   globalThis.window.dispatchEvent(new Event('cartUpdated'));
  }
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
  const fKey = getFavKey(userId);

  setFavorites((prev) => {
   previousFavorites = prev;
   if (prev.some((item) => String(item._id || item.id) === productIdStr)) return prev;
   return [...prev, product];
  });

  const updatedFavorites = previousFavorites.some((item) => String(item._id || item.id) === productIdStr)
   ? previousFavorites
   : [...previousFavorites, product];

  if (typeof globalThis.window !== "undefined") {
   localStorage.setItem(fKey, JSON.stringify(updatedFavorites));
   globalThis.dispatchEvent(new Event("favoritesUpdated"));
  }

  try {
   const res = await axiosInstance.post("/api/user/favorites", { productId: product._id });
   const data = res.data;
   if (!data.success) {
    setFavorites(previousFavorites);
    if (typeof globalThis.window !== "undefined") {
     localStorage.setItem(fKey, JSON.stringify(previousFavorites));
     globalThis.dispatchEvent(new Event("favoritesUpdated"));
    }
   }
  } catch (error_) {
   // 401 hatası = kullanıcı authenticated değil, sadece localStorage'da tut
   if (error_?.response?.status === 401) {
    // Kullanıcı logout olmuş, favoriler sadece localStorage'da kalacak
    return;
   }
   setFavorites(previousFavorites);
   if (typeof globalThis.window !== "undefined") {
    localStorage.setItem(fKey, JSON.stringify(previousFavorites));
    globalThis.dispatchEvent(new Event("favoritesUpdated"));
   }
  }
 };

 const removeFromFavorites = async (productId) => {
  if (!productId) return;
  const productIdStr = String(productId);
  let previousFavorites = favorites;
  const fKey = getFavKey(userId);

  setFavorites((prev) => {
   previousFavorites = prev;
   return prev.filter((item) => String(item._id || item.id) !== productIdStr);
  });

  const updatedFavorites = previousFavorites.filter((item) => String(item._id || item.id) !== productIdStr);

  if (typeof window !== "undefined") {
   localStorage.setItem(fKey, JSON.stringify(updatedFavorites));
   window.dispatchEvent(new Event("favoritesUpdated"));
  }

  try {
   const res = await axiosInstance.delete(`/api/user/favorites?productId=${productId}`);
   const data = res.data;
   if (!data.success) {
    setFavorites(previousFavorites);
    if (typeof window !== "undefined") {
     localStorage.setItem(fKey, JSON.stringify(previousFavorites));
     window.dispatchEvent(new Event("favoritesUpdated"));
    }
   } else if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("favoritesUpdated"));
   }
  } catch (error_) {
   // 401 hatası = kullanıcı authenticated değil, sadece localStorage'da tut
   if (error_?.response?.status === 401) {
    // Kullanıcı logout olmuş, favoriler sadece localStorage'da kalacak
    return;
   }
   setFavorites(previousFavorites);
   if (typeof window !== "undefined") {
    localStorage.setItem(fKey, JSON.stringify(previousFavorites));
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
  if (typeof globalThis.window === "undefined" || cart.length === 0) return;

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
   } catch (error_) {
   }
  };

  const timeoutId = setTimeout(() => {
   updateCartPrices();
  }, 1000);

  const handleVisibilityChange = () => {
   if (!document.hidden) {
    updateCartPrices();
   }
  };

  const handleFocus = () => {
   updateCartPrices();
  };

  const handleCartUpdate = () => {
   updateCartPrices();
  };

  globalThis.addEventListener("visibilitychange", handleVisibilityChange);
  globalThis.addEventListener("focus", handleFocus);
  globalThis.addEventListener("cartUpdated", handleCartUpdate);

  return () => {
   clearTimeout(timeoutId);
   globalThis.removeEventListener("visibilitychange", handleVisibilityChange);
   globalThis.removeEventListener("focus", handleFocus);
   globalThis.removeEventListener("cartUpdated", handleCartUpdate);
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