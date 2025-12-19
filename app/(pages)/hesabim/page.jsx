"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Toast from "@/app/components/ui/Toast";
import AccountLoading from "@/app/components/account/AccountLoading";
import AccountHeader from "@/app/components/account/AccountHeader";
import AccountSidebar from "@/app/components/account/AccountSidebar";
import ProfileTab from "@/app/components/account/ProfileTab";
import OrdersTab from "@/app/components/account/OrdersTab";
import UserOrderDetailModal from "@/app/components/account/UserOrderDetailModal";
import CancelOrderModal from "@/app/components/account/CancelOrderModal";
import ReturnOrderModal from "@/app/components/account/ReturnOrderModal";
import CancelReturnModal from "@/app/components/account/CancelReturnModal";
import AddressesTab from "@/app/components/account/AddressesTab";
import AddressModal from "@/app/components/account/AddressModal";
import CardsTab from "@/app/components/account/CardsTab";
import CardModal from "@/app/components/account/CardModal";
import SettingsTab from "@/app/components/account/SettingsTab";
import DeleteConfirmModal from "@/app/components/account/DeleteConfirmModal";
import DeleteAccountModal from "@/app/components/account/DeleteAccountModal";

export default function Hesabim() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const [isAuthenticated, setIsAuthenticated] = useState(false);
 const [authLoading, setAuthLoading] = useState(true);
 const [currentUser, setCurrentUser] = useState(null);
 const [activeTab, setActiveTab] = useState("profil");
 const didInitTabFromUrl = useRef(false);

 // URL'den tab parametresini okuyup ilgili sekmeyi aç
 useEffect(() => {
  // tab parametresi sadece ilk açılışta uygulansın; yoksa kullanıcı sekme değiştiremiyor
  if (didInitTabFromUrl.current) return;

  const tab = searchParams?.get("tab");
  didInitTabFromUrl.current = true;
  if (!tab) return;

  const allowedTabs = new Set(["profil", "siparisler", "favoriler", "adresler", "kartlar", "ayarlar"]);
  if (allowedTabs.has(tab) && tab !== activeTab) {
   setActiveTab(tab);
  }
 }, [searchParams, activeTab]);

 // Toast bildirim state'i
 const [toast, setToast] = useState({ show: false, message: "", type: "success" });  // type: "success" | "error"

 // Silme onay modal state'i
 const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: null, id: null }); // type: 'address' | 'card'
 const [deleteAccountConfirm, setDeleteAccountConfirm] = useState(false);
 const [deletingAccount, setDeletingAccount] = useState(false);

 const showToast = useCallback((message, type = "success") => {
  setToast({ show: true, message, type });
 }, []);

 // Auth kontrolü
 useEffect(() => {
  checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const checkAuth = async () => {
  try {
   // Eğer yakın zamanda logout yapıldıysa direkt giriş sayfasına yönlendir
   if (typeof window !== 'undefined') {
    const justLoggedOut = localStorage.getItem('just_logged_out');
    if (justLoggedOut) {
     const logoutTime = parseInt(justLoggedOut, 10);
     const now = Date.now();
     // 5 dakika içindeyse direkt giriş sayfasına yönlendir (API kontrolü yapma)
     if (now - logoutTime < 300000) {
      setAuthLoading(false);
      // Cookie'yi client-side'dan da silmeyi dene
      document.cookie = 'user-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      document.cookie = 'user-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict;';
      // Hard redirect
      window.location.replace("/giris");
      return; // API kontrolü yapma, direkt giriş sayfasına git
     } else {
      // Süre dolmuşsa flag'i temizle
      localStorage.removeItem('just_logged_out');
     }
    }
   }

   // Fresh auth kontrolü yap (cache yok, credentials ile)
   const res = await fetch("/api/user/check", {
    cache: 'no-store',
    credentials: 'include',
   });

   const data = await res.json();

   if (data.authenticated) {
    setIsAuthenticated(true);
    setCurrentUser(data.user);
   } else {
    // Authenticated değilse giriş sayfasına yönlendir
    router.replace("/giris");
   }
  } catch (error) {
   router.replace("/giris");
  } finally {
   setAuthLoading(false);
  }
 };

 const handleLogout = async () => {
  try {
   // State'leri önce temizle
   setIsAuthenticated(false);
   setCurrentUser(null);
   setUserInfo({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
   });

   // Logout flag'i kaydet (hesabım sayfasına direkt girilmesini önlemek için)
   // 5 dakika boyunca aktif kalacak
   if (typeof window !== 'undefined') {
    localStorage.setItem('just_logged_out', Date.now().toString());
    sessionStorage.clear();
    // Cookie'yi client-side'dan da silmeyi dene
    document.cookie = 'user-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    document.cookie = 'user-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict;';
    // Custom event gönder
    window.dispatchEvent(new Event('logout'));
   }

   // API'ye logout isteği gönder ve BEKLE
   try {
    await fetch("/api/user/logout", {
     method: "POST",
     cache: 'no-store',
     credentials: 'include',
     headers: {
      'Cache-Control': 'no-cache',
     },
    });
   } catch (err) {
   }

   // Gecikme sonrası yönlendir (cookie'nin silinmesi için yeterli süre bekle)
   setTimeout(() => {
    if (typeof window !== 'undefined') {
     // Hard redirect - logout parametresi ile (auth kontrolü atlanacak)
     window.location.replace("/giris?logout=true&t=" + Date.now());
    }
   }, 500); // Cookie silme için daha uzun bekleme
  } catch (error) {
   // Hata olsa bile yönlendir
   if (typeof window !== 'undefined') {
    localStorage.setItem('just_logged_out', Date.now().toString());
    sessionStorage.clear();
    window.location.replace("/giris?logout=true&t=" + Date.now());
   }
  }
 };

 const [userInfo, setUserInfo] = useState({
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  profileImage: "",
 });
 const [uploadingImage, setUploadingImage] = useState(false);

 const [notificationPreferences, setNotificationPreferences] = useState({
  emailNotifications: true,
  campaignNotifications: false,
 });

 const [addresses, setAddresses] = useState([]);
 const [showAddressModal, setShowAddressModal] = useState(false);
 const [editingAddress, setEditingAddress] = useState(null);
 const [addressErrors, setAddressErrors] = useState({});
 const [addressForm, setAddressForm] = useState({
  title: "",
  fullName: "",
  phone: "",
  address: "",
  city: "",
  district: "",
  isDefault: false,
 });

 // Kart state'leri
 const [cards, setCards] = useState([]);
 const [showCardModal, setShowCardModal] = useState(false);
 const [editingCard, setEditingCard] = useState(null);
 const [cardErrors, setCardErrors] = useState({});
 const [cardForm, setCardForm] = useState({
  cardName: "",
  cardNumber: "",
  expiryDate: "",
  cvv: "",
  cardHolderName: "",
  isDefault: false,
 });

 // Şifre değiştirme state'leri
 const [passwordForm, setPasswordForm] = useState({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
 });
 const [passwordLoading, setPasswordLoading] = useState(false);
 const [passwordError, setPasswordError] = useState("");
 const [passwordSuccess, setPasswordSuccess] = useState("");

 useEffect(() => {
  const fetchUserProfile = async () => {
   if (currentUser) {
    try {
     const res = await fetch("/api/user/profile", {
      credentials: 'include',
     });

     const contentType = res.headers.get("content-type");
     if (!contentType || !contentType.includes("application/json")) {
      setUserInfo({
       name: currentUser.name || "",
       email: currentUser.email || "",
       phone: currentUser.phone || "",
       address: "",
       city: "",
       profileImage: currentUser.profileImage || "",
      });
      return;
     }

     const data = await res.json();

     if (data.success && data.user) {
      setUserInfo({
       name: data.user.name || "",
       email: data.user.email || "",
       phone: data.user.phone || "",
       address: "",
       city: "",
       profileImage: data.user.profileImage || "",
      });
      if (data.user.notificationPreferences) {
       setNotificationPreferences({
        emailNotifications: data.user.notificationPreferences.emailNotifications !== undefined ? data.user.notificationPreferences.emailNotifications : true,
        campaignNotifications: data.user.notificationPreferences.campaignNotifications !== undefined ? data.user.notificationPreferences.campaignNotifications : false,
       });
      }
     } else {
      setUserInfo({
       name: currentUser.name || "",
       email: currentUser.email || "",
       phone: currentUser.phone || "",
       address: "",
       city: "",
       profileImage: currentUser.profileImage || "",
      });
     }
    } catch (error) {
     setUserInfo({
      name: currentUser.name || "",
      email: currentUser.email || "",
      phone: currentUser.phone || "",
      address: "",
      city: "",
      profileImage: currentUser.profileImage || "",
     });
    }
   }
  };
  fetchUserProfile();
 }, [currentUser]);

 const fetchAddresses = useCallback(async () => {
  try {
   const res = await fetch("/api/user/addresses", {
    credentials: 'include',
   });

   // Response'un JSON olup olmadığını kontrol et
   const contentType = res.headers.get("content-type");
   if (!contentType || !contentType.includes("application/json")) {
    showToast("Adresler yüklenirken bir hata oluştu. Lütfen tekrar giriş yapın.", "error");
    return;
   }

   const data = await res.json();

   if (!res.ok) {
    showToast(data.message || "Adresler yüklenemedi", "error");
    return;
   }

   if (data.success) {
    const loadedAddresses = data.addresses || [];

    const sortedAddresses = [...loadedAddresses].sort((a, b) => {
     if (a.isDefault && !b.isDefault) return -1;
     if (!a.isDefault && b.isDefault) return 1;
     return 0;
    });

    setAddresses(sortedAddresses);
   } else {
    showToast(data.message || "Adresler yüklenemedi", "error");
   }
  } catch (error) {
   showToast("Adresler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.", "error");
  }
 }, [showToast]);

 const fetchCards = useCallback(async () => {
  try {
   const res = await fetch("/api/user/cards", {
    credentials: 'include',
   });

   const contentType = res.headers.get("content-type");
   if (!contentType || !contentType.includes("application/json")) {
    showToast("Kartlar yüklenirken bir hata oluştu. Lütfen tekrar giriş yapın.", "error");
    return;
   }

   const data = await res.json();

   if (!res.ok) {
    showToast(data.message || "Kartlar yüklenemedi", "error");
    return;
   }

   if (data.success) {
    const loadedCards = data.cards || [];

    // Varsayılan kartı en başa taşı
    const sortedCards = [...loadedCards].sort((a, b) => {
     if (a.isDefault && !b.isDefault) return -1;
     if (!a.isDefault && b.isDefault) return 1;
     return 0;
    });

    setCards(sortedCards);
   } else {
    showToast(data.message || "Kartlar yüklenemedi", "error");
   }
  } catch (error) {
   showToast("Kartlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.", "error");
  }
 }, [showToast]);

 useEffect(() => {
  if (currentUser && activeTab === "adresler") {
   fetchAddresses();
  }
 }, [currentUser, activeTab, fetchAddresses]);

 useEffect(() => {
  if (currentUser && activeTab === "kartlar") {
   fetchCards();
  }
 }, [currentUser, activeTab, fetchCards]);

 const handleAddressSubmit = async (e) => {
  e.preventDefault();

  setAddressErrors({});

  // Validasyon
  const errors = {};

  if (!addressForm.title || !addressForm.title.trim()) {
   errors.title = "Adres başlığı zorunludur!";
  }

  if (!addressForm.fullName || !addressForm.fullName.trim()) {
   errors.fullName = "Ad Soyad alanı zorunludur!";
  }

  const phoneDigits = addressForm.phone.replace(/\D/g, '');
  if (!phoneDigits || phoneDigits.length !== 11) {
   errors.phone = "Telefon numarası 11 haneli olmalıdır! (Örn: 05321234567)";
  }

  if (!addressForm.city || !addressForm.city.trim()) {
   errors.city = "Şehir alanı zorunludur!";
  }

  if (!addressForm.district || !addressForm.district.trim()) {
   errors.district = "İlçe alanı zorunludur!";
  }

  if (!addressForm.address || !addressForm.address.trim()) {
   errors.address = "Adres alanı zorunludur!";
  }

  // Hata varsa göster ve dur
  if (Object.keys(errors).length > 0) {
   setAddressErrors(errors);
   return;
  }

  try {
   const addressId = editingAddress?._id?.toString ? editingAddress._id.toString() : editingAddress?._id;
   const url = editingAddress ? `/api/user/addresses/${addressId}` : "/api/user/addresses";
   const method = editingAddress ? "PUT" : "POST";

   const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify({
     ...addressForm,
     phone: phoneDigits,
     title: addressForm.title.trim(),
     fullName: addressForm.fullName.trim(),
     city: addressForm.city.trim(),
     district: addressForm.district.trim(),
     address: addressForm.address.trim(),
    }),
   });

   // Response'un JSON olup olmadığını kontrol et
   const contentType = res.headers.get("content-type");
   if (!contentType || !contentType.includes("application/json")) {
    showToast("Sunucu hatası! Lütfen tekrar giriş yapın.", "error");
    return;
   }

   const data = await res.json();

   if (!res.ok || !data.success) {
    showToast(data.message || "İşlem başarısız!", "error");
    return;
   }

   // Başarılı - modal'ı kapat ve listeyi yenile
   showToast(editingAddress ? "Adres güncellendi!" : "Adres eklendi!", "success");
   setShowAddressModal(false);
   resetAddressForm();

   // Adresleri hemen yeniden yükle (varsayılan adres değişirse profil bilgileri güncellenecek)
   await fetchAddresses();
  } catch (error) {
   showToast("Bir hata oluştu! Lütfen tekrar deneyin.", "error");
  }
 };

 const handleDeleteClick = (addressId) => {
  setDeleteConfirm({ show: true, type: 'address', id: addressId });
 };

 const handleDeleteConfirm = async () => {
  if (!deleteConfirm.id || !deleteConfirm.type) return;

  try {
   // ID'yi string'e çevir - ObjectId veya string olabilir
   let id = deleteConfirm.id;
   if (typeof id === 'object' && id.toString) {
    id = id.toString();
   } else if (typeof id !== 'string') {
    id = String(id);
   }

   if (deleteConfirm.type === 'address') {
    const res = await fetch(`/api/user/addresses/${id}`, {
     method: "DELETE",
     credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
     showToast(data.message || "Adres silinemedi!", "error");
     return;
    }

    showToast("Adres silindi!", "success");
    await fetchAddresses();
   } else if (deleteConfirm.type === 'card') {
    const res = await fetch(`/api/user/cards/${id}`, {
     method: "DELETE",
     credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
     showToast(data.message || "Kart silinemedi!", "error");
     return;
    }

    showToast("Kart silindi!", "success");
    await fetchCards();
   }

   setDeleteConfirm({ show: false, type: null, id: null });
  } catch (error) {
   showToast("Bir hata oluştu! Lütfen tekrar deneyin.", "error");
  }
 };

 const handleEditAddress = (address) => {
  setEditingAddress(address);
  setAddressForm({
   title: address.title,
   fullName: address.fullName,
   phone: address.phone,
   address: address.address,
   city: address.city,
   district: address.district,
   isDefault: address.isDefault,
  });
  setShowAddressModal(true);
 };

 const resetAddressForm = () => {
  setAddressForm({
   title: "",
   fullName: "",
   phone: "",
   address: "",
   city: "",
   district: "",
   isDefault: false,
  });
  setEditingAddress(null);
  setAddressErrors({});
 };

 // Sipariş state'i
 const [orders, setOrders] = useState([]);
 const [ordersLoading, setOrdersLoading] = useState(false);
 const [selectedOrder, setSelectedOrder] = useState(null);
 const [showOrderModal, setShowOrderModal] = useState(false);
 const [cancelOrderConfirm, setCancelOrderConfirm] = useState({ show: false, orderId: null });
 const [returnOrderConfirm, setReturnOrderConfirm] = useState({ show: false, orderId: null });
 const [cancelReturnConfirm, setCancelReturnConfirm] = useState({ show: false, orderId: null });
 const [showAllOrders, setShowAllOrders] = useState(false);

 const formatOrderStatus = (status) => {
  if (!status) return "-";
  return String(status).replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
 };

 const getOrderStatusLabel = (order) => {
  const rr = String(order?.returnRequest?.status || "").trim();
  if (rr) {
   return `İade Talebi: ${rr}`;
  }
  return formatOrderStatus(order?.status);
 };

 // Siparişleri çek
 const fetchOrders = useCallback(async () => {
  try {
   setOrdersLoading(true);
   const res = await fetch("/api/user/orders", {
    credentials: 'include',
    cache: 'no-store',
   });

   // Response'un JSON olup olmadığını kontrol et
   const contentType = res.headers.get("content-type");
   if (!contentType || !contentType.includes("application/json")) {
    // HTML response geldi - muhtemelen authentication hatası
    setOrders([]);
    if (res.status === 401 || res.status === 403) {
     showToast("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.", "error");
    } else {
     showToast("Siparişler yüklenirken bir hata oluştu.", "error");
    }
    return;
   }

   const data = await res.json();
   if (data.success) {
    setOrders(data.orders || []);
   } else {
    setOrders([]);
    console.error('Siparişler yüklenemedi:', data.message || data.error);
    showToast(data.message || "Siparişler yüklenemedi", "error");
   }
  } catch (error) {
   setOrders([]);
   console.error('Siparişler yükleme hatası:', error);
   showToast("Siparişler yüklenirken bir hata oluştu.", "error");
  } finally {
   setOrdersLoading(false);
  }
 }, [showToast]);

 // Kullanıcı yüklendiğinde siparişleri çek
 useEffect(() => {
  if (currentUser && activeTab === "siparisler") {
   fetchOrders();
  } else if (!currentUser) {
   setOrders([]);
   setOrdersLoading(false);
  }
 }, [currentUser, activeTab, fetchOrders]);

 const [updatingProfile, setUpdatingProfile] = useState(false);
 const [profileErrors, setProfileErrors] = useState({});

 const handleUpdateProfile = async (e) => {
  e.preventDefault();

  // Hataları temizle
  setProfileErrors({});

  // Validasyon
  const errors = {};

  if (!userInfo.name || !userInfo.name.trim()) {
   errors.name = "Ad Soyad alanı zorunludur!";
  }

  if (!userInfo.email || !userInfo.email.trim()) {
   errors.email = "E-posta alanı zorunludur!";
  } else {
   // Daha sıkı e-posta validasyonu
   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
   const trimmedEmail = userInfo.email.trim();
   if (!emailRegex.test(trimmedEmail)) {
    errors.email = "Geçerli bir e-posta adresi giriniz! (Örn: ornek@email.com)";
   } else {
    // E-posta formatını kontrol et (sonunda nokta veya özel karakter olmamalı)
    const parts = trimmedEmail.split('@');
    if (parts.length !== 2) {
     errors.email = "Geçerli bir e-posta adresi giriniz!";
    } else {
     const domain = parts[1];
     // Domain'in sonunda nokta veya özel karakter olmamalı
     if (domain.endsWith('.') || !domain.includes('.') || domain.split('.').pop().length < 2) {
      errors.email = "E-posta adresinin domain kısmı geçersiz! (Örn: @gmail.com)";
     }
    }
   }
  }

  const phoneDigits = userInfo.phone.replace(/\D/g, '');
  if (!phoneDigits || phoneDigits.length !== 11) {
   errors.phone = "Telefon numarası 11 haneli olmalıdır! (Örn: 05321234567)";
  }

  // Şehir ve Adres artık zorunlu değil 
  // Hata varsa göster ve dur
  if (Object.keys(errors).length > 0) {
   setProfileErrors(errors);
   return;
  }

  setUpdatingProfile(true);

  try {
   const res = await fetch("/api/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     name: userInfo.name.trim(),
     email: userInfo.email.trim(),
     phone: phoneDigits, // Sadece rakamları gönder
     // city ve address artık gönderilmiyor - Adreslerim kısmından gelecek
    }),
   });

   const data = await res.json();

   if (!res.ok || !data.success) {
    showToast(data.message || "Profil güncellenemedi!", "error");
    return;
   }

   showToast("Profil başarıyla güncellendi!", "success");
   setCurrentUser({
    ...currentUser,
    name: data.user.name,
    email: data.user.email,
   });
   // Form'u da güncelle
   setUserInfo({
    ...userInfo,
    name: data.user.name,
    email: data.user.email,
    phone: data.user.phone || "",
    city: data.user.city || "",
    address: data.user.address || "",
    profileImage: data.user.profileImage || "",
   });
  } catch (error) {
   showToast("Bir hata oluştu! Lütfen tekrar deneyin.", "error");
  } finally {
   setUpdatingProfile(false);
  }
 };

 const resetCardForm = () => {
  setCardForm({
   cardName: "",
   cardNumber: "",
   cardHolderName: "",
   expiryDate: "",
   cvv: "",
   isDefault: false,
  });
  setCardErrors({});
  setEditingCard(null);
 };

 const handleCardSubmit = async (e) => {
  e.preventDefault();
  setCardErrors({});

  const errors = {};
  if (!cardForm.cardName.trim()) errors.cardName = "Kart adı gereklidir!";

  const cardNumberDigits = cardForm.cardNumber.replace(/\s/g, '');
  const isMaskedCardNumber = cardNumberDigits.startsWith('****');

  if (!isMaskedCardNumber && !cardNumberDigits.match(/^\d{16}$/)) {
   errors.cardNumber = "Geçerli bir 16 haneli kart numarası giriniz!";
  }

  if (!cardForm.cardHolderName.trim()) errors.cardHolderName = "Kart sahibi adı gereklidir!";
  if (!cardForm.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) errors.expiryDate = "Geçerli bir son kullanma tarihi giriniz (AA/YY)!";
  if (!cardForm.cvv.match(/^\d{3}$/)) errors.cvv = "Geçerli bir 3 haneli CVV giriniz!";

  if (Object.keys(errors).length > 0) {
   setCardErrors(errors);
   return;
  }

  try {
   const url = editingCard ? `/api/user/cards/${editingCard._id}` : "/api/user/cards";
   const method = editingCard ? "PUT" : "POST";

   // Eğer kart numarası maskelenmiş formattaysa, API'ye gönderme (sadece diğer alanları güncelle)
   const requestBody = {
    cardName: cardForm.cardName.trim(),
    cardHolderName: cardForm.cardHolderName.trim(),
    expiryDate: cardForm.expiryDate,
    cvv: cardForm.cvv,
    isDefault: cardForm.isDefault,
   };

   // Sadece kart numarası değiştirilmişse (maskelenmiş değilse) ekle
   if (!isMaskedCardNumber) {
    requestBody.cardNumber = cardNumberDigits;
   }

   const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify(requestBody),
   });

   const data = await res.json();

   if (!res.ok || !data.success) {
    showToast(data.message || "Kart kaydedilemedi!", "error");
    return;
   }

   showToast(editingCard ? "Kart başarıyla güncellendi!" : "Kart başarıyla eklendi!", "success");
   setShowCardModal(false);
   resetCardForm();
   fetchCards(); // Kartları yeniden yükle
  } catch (error) {
   showToast("Bir hata oluştu! Lütfen tekrar deneyin.", "error");
  }
 };

 const handleDeleteCard = (cardId) => {
  setDeleteConfirm({ show: true, type: 'card', id: cardId });
 };

 const handleEditCard = (card) => {
  setEditingCard(card);
  setCardForm({
   cardName: card.cardName || "",
   cardNumber: card.cardNumber || "",
   cardHolderName: card.cardHolderName || "",
   expiryDate: card.expiryDate || "",
   cvv: card.cvv || "",
   isDefault: card.isDefault || false,
  });
  setShowCardModal(true);
 };

 const handlePasswordChange = async (e) => {
  e.preventDefault();
  setPasswordError("");
  setPasswordSuccess("");
  setPasswordLoading(true);

  // Validasyon
  if (!passwordForm.currentPassword) {
   setPasswordError("Mevcut şifre gereklidir!");
   setPasswordLoading(false);
   return;
  }

  if (!passwordForm.newPassword) {
   setPasswordError("Yeni şifre gereklidir!");
   setPasswordLoading(false);
   return;
  }

  if (passwordForm.newPassword.length < 6) {
   setPasswordError("Yeni şifre en az 6 karakter olmalıdır!");
   setPasswordLoading(false);
   return;
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
   setPasswordError("Yeni şifreler eşleşmiyor!");
   setPasswordLoading(false);
   return;
  }

  try {
   const res = await fetch("/api/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify({
     currentPassword: passwordForm.currentPassword,
     newPassword: passwordForm.newPassword,
    }),
   });

   const data = await res.json();

   if (!res.ok || !data.success) {
    setPasswordError(data.message || "Şifre güncellenemedi!");
    setPasswordLoading(false);
    return;
   }

   setPasswordSuccess("Şifre başarıyla güncellendi!");
   setPasswordForm({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
   });

   // 3 saniye sonra başarı mesajını temizle
   setTimeout(() => {
    setPasswordSuccess("");
   }, 3000);
  } catch (error) {
   setPasswordError("Bir hata oluştu! Lütfen tekrar deneyin.");
  } finally {
   setPasswordLoading(false);
  }
 };

 const handleImageUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Dosya tipi kontrolü
  if (!file.type.startsWith('image/')) {
   showToast("Lütfen geçerli bir resim dosyası seçin!", "error");
   return;
  }

  // Dosya boyutu kontrolü (5MB)
  if (file.size > 5 * 1024 * 1024) {
   showToast("Resim boyutu 5MB'dan küçük olmalıdır!", "error");
   return;
  }

  setUploadingImage(true);

  try {
   const formData = new FormData();
   formData.append('file', file);

   const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
    credentials: 'include',
   });

   const data = await res.json();

   if (!res.ok || !data.success) {
    showToast(data.message || "Resim yüklenemedi!", "error");
    return;
   }

   // Profil resmini güncelle
   const updateRes = await fetch("/api/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify({
     profileImage: data.url,
    }),
   });

   const updateData = await updateRes.json();

   if (!updateRes.ok || !updateData.success) {
    showToast("Profil resmi güncellenemedi!", "error");
    return;
   }

   showToast("Profil resmi başarıyla güncellendi!", "success");
   setUserInfo({
    ...userInfo,
    profileImage: data.url,
   });
   setCurrentUser({
    ...currentUser,
    profileImage: data.url,
   });
  } catch (error) {
   showToast("Bir hata oluştu! Lütfen tekrar deneyin.", "error");
  } finally {
   setUploadingImage(false);
   // Input'u temizle
   if (e.target) {
    e.target.value = '';
   }
  }
 };

 const handleOrderClick = (order) => {
  setSelectedOrder(order);
  setShowOrderModal(true);
 };

 const handleCancelOrder = async (orderId) => {
  const targetOrderId = orderId || cancelOrderConfirm.orderId;
  if (!targetOrderId) return;

  try {
   const res = await fetch(`/api/user/orders/${targetOrderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify({ status: "İptal Edildi" }),
   });

   const data = await res.json();

   if (!res.ok || !data.success) {
    showToast(data.message || "Sipariş iptal edilemedi!", "error");
    return;
   }

   showToast("Sipariş başarıyla iptal edildi!", "success");
   setCancelOrderConfirm({ show: false, orderId: null });
   setShowOrderModal(false);
   setSelectedOrder(null);
   fetchOrders();
  } catch (error) {
   showToast("Bir hata oluştu! Lütfen tekrar deneyin.", "error");
  }
 };

 const handleReturnOrder = async (orderId) => {
  const targetOrderId = orderId || returnOrderConfirm.orderId;
  if (!targetOrderId) return;

  try {
   const res = await fetch(`/api/user/orders/${targetOrderId}/return`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify({
     note: "",
    }),
   });

   const data = await res.json();

   if (!res.ok || !data.success) {
    showToast(data.message || "İade talebi oluşturulamadı!", "error");
    return;
   }

   showToast("İade talebi başarıyla oluşturuldu!", "success");
   setReturnOrderConfirm({ show: false, orderId: null });

   // Eğer modal açıksa ve aynı sipariş gösteriliyorsa, selectedOrder'ı güncelle
   if (selectedOrder && selectedOrder.orderId === targetOrderId && data.returnRequest) {
    setSelectedOrder({
     ...selectedOrder,
     returnRequest: data.returnRequest,
    });
   }

   // Siparişleri güncelle
   fetchOrders();
  } catch (error) {
   showToast("Bir hata oluştu! Lütfen tekrar deneyin.", "error");
  }
 };

 const handleCancelReturnRequest = async (orderId) => {
  const targetOrderId = orderId || cancelReturnConfirm.orderId;
  if (!targetOrderId) return;

  try {
   const res = await fetch(`/api/user/orders/${targetOrderId}/return`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
   });

   const data = await res.json();

   if (!res.ok || !data.success) {
    showToast(data.message || "İade talebi iptal edilemedi!", "error");
    return;
   }

   showToast("İade talebi başarıyla iptal edildi!", "success");
   setCancelReturnConfirm({ show: false, orderId: null });

   // Eğer modal açıksa ve aynı sipariş gösteriliyorsa, selectedOrder'ı güncelle
   if (selectedOrder && selectedOrder.orderId === targetOrderId) {
    setSelectedOrder({
     ...selectedOrder,
     returnRequest: {
      ...selectedOrder.returnRequest,
      status: "İptal Edildi",
      cancelledAt: new Date().toISOString(),
     },
    });
   }

   // Siparişleri güncelle
   fetchOrders();
  } catch (error) {
   showToast("Bir hata oluştu! Lütfen tekrar deneyin.", "error");
  }
 };

 const handleNotificationChange = async (key, value) => {
  const updatedPreferences = {
   ...notificationPreferences,
   [key]: value,
  };
  setNotificationPreferences(updatedPreferences);

  try {
   const res = await fetch("/api/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify({
     notificationPreferences: updatedPreferences,
    }),
   });

   const data = await res.json();

   if (!res.ok || !data.success) {
    showToast(data.message || "Bildirim tercihleri güncellenemedi!", "error");
    setNotificationPreferences(notificationPreferences);
    return;
   }

   showToast("Bildirim tercihleri güncellendi!", "success");
  } catch (error) {
   showToast("Bir hata oluştu! Lütfen tekrar deneyin.", "error");
   setNotificationPreferences(notificationPreferences);
  }
 };

 const handleDeleteAccount = async () => {
  setDeletingAccount(true);
  try {
   const res = await fetch("/api/user/profile", {
    method: "DELETE",
    credentials: 'include',
   });

   const data = await res.json();

   if (!res.ok || !data.success) {
    showToast(data.message || "Hesap silinemedi!", "error");
    setDeletingAccount(false);
    setDeleteAccountConfirm(false);
    return;
   }

   showToast("Hesabınız başarıyla silindi!", "success");

   // State'leri temizle
   setIsAuthenticated(false);
   setCurrentUser(null);
   setUserInfo({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
   });

   // LocalStorage ve sessionStorage'ı temizle
   if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
    // Cookie'yi client-side'dan da silmeyi dene
    document.cookie = 'user-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    document.cookie = 'user-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict;';
   }

   // Ana sayfaya yönlendir
   setTimeout(() => {
    window.location.replace("/");
   }, 2000);
  } catch (error) {
   showToast("Bir hata oluştu! Lütfen tekrar deneyin.", "error");
   setDeletingAccount(false);
   setDeleteAccountConfirm(false);
  }
 };

 if (authLoading) {
  return <AccountLoading />;
 }

 if (!isAuthenticated) {
  return null;
 }

 return (
  <div className="min-h-screen bg-gray-50 py-12">
   {/* Toast Bildirimi */}
   <Toast toast={toast} setToast={setToast} />


   <div className="container mx-auto px-4">
    <AccountHeader onLogout={handleLogout} />

    <div className="grid lg:grid-cols-4 gap-6">
     <AccountSidebar
      userInfo={userInfo}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onImageUpload={handleImageUpload}
      uploadingImage={uploadingImage}
     />

     <main className="lg:col-span-3">
      {activeTab === "profil" && (
       <ProfileTab
        userInfo={userInfo}
        setUserInfo={setUserInfo}
        profileErrors={profileErrors}
        setProfileErrors={setProfileErrors}
        updatingProfile={updatingProfile}
        onSubmit={handleUpdateProfile}
       />
      )}

      {activeTab === "siparisler" && (
       <OrdersTab
        orders={orders}
        ordersLoading={ordersLoading}
        showAllOrders={showAllOrders}
        setShowAllOrders={setShowAllOrders}
        onOrderClick={handleOrderClick}
        getOrderStatusLabel={getOrderStatusLabel}
        formatOrderStatus={formatOrderStatus}
       />
      )}

      <UserOrderDetailModal
       show={showOrderModal}
       order={selectedOrder}
       addresses={addresses}
       onClose={() => {
        setShowOrderModal(false);
        setSelectedOrder(null);
       }}
       onCancel={(orderId) => setCancelOrderConfirm({ show: true, orderId })}
       onReturn={(orderId) => setReturnOrderConfirm({ show: true, orderId })}
       onCancelReturn={(orderId) => setCancelReturnConfirm({ show: true, orderId })}
       formatOrderStatus={formatOrderStatus}
      />

      <CancelOrderModal
       show={cancelOrderConfirm.show}
       orderId={cancelOrderConfirm.orderId}
       onConfirm={handleCancelOrder}
       onCancel={() => setCancelOrderConfirm({ show: false, orderId: null })}
      />

      <ReturnOrderModal
       show={returnOrderConfirm.show}
       orderId={returnOrderConfirm.orderId}
       onConfirm={handleReturnOrder}
       onCancel={() => setReturnOrderConfirm({ show: false, orderId: null })}
      />

      <CancelReturnModal
       show={cancelReturnConfirm.show}
       orderId={cancelReturnConfirm.orderId}
       onConfirm={handleCancelReturnRequest}
       onCancel={() => setCancelReturnConfirm({ show: false, orderId: null })}
      />

      {activeTab === "adresler" && (
       <AddressesTab
        addresses={addresses}
        onAddNew={() => {
         resetAddressForm();
         setShowAddressModal(true);
        }}
        onEdit={handleEditAddress}
        onDelete={(id) => setDeleteConfirm({ show: true, type: 'address', id })}
        showToast={showToast}
        fetchAddresses={fetchAddresses}
       />
      )}

      {activeTab === "kartlar" && (
       <CardsTab
        cards={cards}
        onAddNew={() => {
         resetCardForm();
         setShowCardModal(true);
        }}
        onEdit={handleEditCard}
        onDelete={(id) => setDeleteConfirm({ show: true, type: 'card', id })}
        showToast={showToast}
        fetchCards={fetchCards}
       />
      )}

      {activeTab === "ayarlar" && (
       <SettingsTab
        passwordForm={passwordForm}
        setPasswordForm={setPasswordForm}
        passwordError={passwordError}
        setPasswordError={setPasswordError}
        passwordSuccess={passwordSuccess}
        passwordLoading={passwordLoading}
        onPasswordChange={handlePasswordChange}
        notificationPreferences={notificationPreferences}
        setNotificationPreferences={setNotificationPreferences}
        onNotificationChange={handleNotificationChange}
        onDeleteAccount={() => setDeleteAccountConfirm(true)}
       />
      )}
     </main>
    </div>

    <AddressModal
     show={showAddressModal}
     editingAddress={editingAddress}
     addressForm={addressForm}
     setAddressForm={setAddressForm}
     addressErrors={addressErrors}
     setAddressErrors={setAddressErrors}
     onSubmit={handleAddressSubmit}
     onClose={() => {
      setShowAddressModal(false);
      resetAddressForm();
     }}
    />

    <CardModal
     show={showCardModal}
     editingCard={editingCard}
     cardForm={cardForm}
     setCardForm={setCardForm}
     cardErrors={cardErrors}
     setCardErrors={setCardErrors}
     onSubmit={handleCardSubmit}
     onClose={() => {
      setShowCardModal(false);
      resetCardForm();
     }}
    />

    <DeleteConfirmModal
     show={deleteConfirm.show}
     type={deleteConfirm.type}
     onConfirm={handleDeleteConfirm}
     onCancel={() => setDeleteConfirm({ show: false, type: null, id: null })}
    />

    <DeleteAccountModal
     show={deleteAccountConfirm}
     deletingAccount={deletingAccount}
     onConfirm={handleDeleteAccount}
     onCancel={() => setDeleteAccountConfirm(false)}
    />
   </div>
  </div>
 );
}
