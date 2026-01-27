"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axios";
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
import ProductRequestsTab from "@/app/components/account/ProductRequestsTab";

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

  const allowedTabs = new Set(["profil", "siparisler", "favoriler", "adresler", "kartlar", "urun-istekleri", "ayarlar"]);
  if (allowedTabs.has(tab) && tab !== activeTab) {
   setActiveTab(tab);
  }
 }, [searchParams, activeTab]);

 // Toast bildirim state'i
 const [toast, setToast] = useState({ show: false, message: "", type: "success" });

 // Silme onay modal state'i
 const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: null, id: null }); // type: 'address'
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
   const res = await axiosInstance.get("/api/user/check", {
    cache: 'no-store',
   });

   const data = res.data;

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
    // Sepet/favoriler silinmez; kullanıcı tekrar giriş yaptığında kendi sepeti yüklenecek (cart_${userId})
    window.dispatchEvent(new Event('logout'));
   }

   // API'ye logout isteği gönder ve BEKLE
   try {
    await axiosInstance.post("/api/user/logout", {}, {
     cache: 'no-store',
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
  firstName: "",
  lastName: "",
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
 });

 const [addresses, setAddresses] = useState([]);
 const [showAddressModal, setShowAddressModal] = useState(false);
 const [editingAddress, setEditingAddress] = useState(null);
 const [addressErrors, setAddressErrors] = useState({});

 const [cards, setCards] = useState([]);
 const [showCardModal, setShowCardModal] = useState(false);
 const [editingCard, setEditingCard] = useState(null);
 const [cardForm, setCardForm] = useState({
  title: "",
  cardNumber: "",
  cardHolder: "",
  month: "",
  year: "",
  cvc: "",
  isDefault: false,
 });
 const [cardErrors, setCardErrors] = useState({});
 const [addressForm, setAddressForm] = useState({
  title: "",
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  city: "",
  district: "",
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
     const res = await axiosInstance.get("/api/user/profile");

     const contentType = res.headers["content-type"];
     if (!contentType || !contentType.includes("application/json")) {
      // Geriye dönük uyumluluk için: eğer firstName/lastName yoksa name'den ayır
      let firstName = currentUser.firstName || '';
      let lastName = currentUser.lastName || '';
      if (!firstName && !lastName && currentUser.name) {
       const parts = currentUser.name.trim().split(' ');
       firstName = parts[0] || '';
       lastName = parts.slice(1).join(' ') || '';
      }
      setUserInfo({
       firstName: firstName,
       lastName: lastName,
       name: currentUser.name || "",
       email: currentUser.email || "",
       phone: currentUser.phone || "",
       address: "",
       city: "",
       profileImage: currentUser.profileImage || "",
      });
      return;
     }

     const data = res.data;

     if (data.success && data.user) {
      let firstName = data.user.firstName || '';
      let lastName = data.user.lastName || '';
      if ((!firstName || firstName.trim() === '') && (!lastName || lastName.trim() === '') && data.user.name) {
       const parts = data.user.name.trim().split(' ').filter(p => p.length > 0);
       if (parts.length > 0) {
        lastName = parts[parts.length - 1] || '';
        firstName = parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0] || '';
       }
      }
      setUserInfo({
       firstName: firstName,
       lastName: lastName,
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
       });
      }
     } else {
      // Geriye dönük uyumluluk için: eğer firstName/lastName yoksa name'den ayır
      let firstName = currentUser.firstName || '';
      let lastName = currentUser.lastName || '';
      if (!firstName && !lastName && currentUser.name) {
       const parts = currentUser.name.trim().split(' ');
       firstName = parts[0] || '';
       lastName = parts.slice(1).join(' ') || '';
      }
      setUserInfo({
       firstName: firstName,
       lastName: lastName,
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
   const res = await axiosInstance.get("/api/user/addresses");

   // Response'un JSON olup olmadığını kontrol et
   const contentType = res.headers["content-type"];
   if (!contentType || !contentType.includes("application/json")) {
    showToast("Adresler yüklenirken bir hata oluştu. Lütfen tekrar giriş yapın.", "error");
    return;
   }

   const data = res.data;

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

 useEffect(() => {
  if (currentUser && activeTab === "adresler") {
   fetchAddresses();
  }
 }, [currentUser, activeTab, fetchAddresses]);

 const fetchCards = useCallback(async () => {
  try {
   const res = await axiosInstance.get("/api/user/cards");

   const contentType = res.headers["content-type"];
   if (!contentType || !contentType.includes("application/json")) {
    setCards([]);
    return;
   }

   const data = res.data;

   if (data.success) {
    const loadedCards = data.cards || [];
    const sortedCards = [...loadedCards].sort((a, b) => {
     if (a.isDefault && !b.isDefault) return -1;
     if (!a.isDefault && b.isDefault) return 1;
     return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    setCards(sortedCards);
   } else {
    setCards([]);
   }
  } catch (error) {
   setCards([]);
   showToast("Kartlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.", "error");
  }
 }, [showToast]);

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

  if (!addressForm.firstName || !addressForm.firstName.trim()) {
   errors.firstName = "Ad alanı zorunludur!";
  }

  if (!addressForm.lastName || !addressForm.lastName.trim()) {
   errors.lastName = "Soyad alanı zorunludur!";
  }

  const phoneDigits = addressForm.phone.replace(/\D/g, '');
  if (!phoneDigits || phoneDigits.length !== 11) {
   errors.phone = "Telefon numarası 11 haneli olmalıdır! (Örn: 05XXXXXXXXX)";
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

   const res = editingAddress
    ? await axiosInstance.put(url, {
     ...addressForm,
     phone: phoneDigits,
     title: addressForm.title.trim(),
     firstName: addressForm.firstName.trim(),
     lastName: addressForm.lastName.trim(),
     city: addressForm.city.trim(),
     district: addressForm.district.trim(),
     address: addressForm.address.trim(),
    })
    : await axiosInstance.post(url, {
     ...addressForm,
     phone: phoneDigits,
     title: addressForm.title.trim(),
     firstName: addressForm.firstName.trim(),
     lastName: addressForm.lastName.trim(),
     city: addressForm.city.trim(),
     district: addressForm.district.trim(),
     address: addressForm.address.trim(),
    });

   // Response'un JSON olup olmadığını kontrol et
   const contentType = res.headers["content-type"];
   if (!contentType || !contentType.includes("application/json")) {
    showToast("Sunucu hatası! Lütfen tekrar giriş yapın.", "error");
    return;
   }

   const data = res.data;

   if (!data.success) {
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
    const res = await axiosInstance.delete(`/api/user/addresses/${id}`);

    const data = res.data;

    if (!data.success) {
     showToast(data.message || "Adres silinemedi!", "error");
     return;
    }

    showToast("Adres silindi!", "success");
    await fetchAddresses();
   }

   if (deleteConfirm.type === 'card') {
    const res = await axiosInstance.delete(`/api/user/cards/${id}`);

    const data = res.data;

    if (!data.success) {
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
  let firstName = address.firstName || '';
  let lastName = address.lastName || '';
  if (!firstName && !lastName && address.fullName) {
   const parts = address.fullName.trim().split(' ');
   firstName = parts[0] || '';
   lastName = parts.slice(1).join(' ') || '';
  }
  setAddressForm({
   title: address.title,
   firstName: firstName,
   lastName: lastName,
   phone: address.phone,
   address: address.address,
   city: address.city,
   district: address.district,
   isDefault: address.isDefault,
  });
  setShowAddressModal(true);
 };

 const handleCardSubmit = async (e) => {
  e.preventDefault();

  setCardErrors({});

  // Validasyon
  const errors = {};

  if (!cardForm.title || !cardForm.title.trim()) {
   errors.title = "Kart başlığı zorunludur!";
  }

  if (!editingCard) {
   const cleanedCardNumber = cardForm.cardNumber.replace(/\s/g, "");

   // Kart tipini belirle
   const getCardType = (cardNumber) => {
    if (!cardNumber || cardNumber.length === 0) return 'Kart';
    const firstDigit = cardNumber[0];
    const firstTwoDigits = cardNumber.substring(0, 2);
    const firstFourDigits = cardNumber.substring(0, 4);

    if (firstDigit === '4') return 'Visa';
    if (firstTwoDigits >= '51' && firstTwoDigits <= '55') return 'Mastercard';
    if (firstFourDigits >= '2221' && firstFourDigits <= '2720') return 'Mastercard';
    if (firstFourDigits === '9792') return 'Troy';
    if (firstTwoDigits === '65') return 'Troy';
    if (firstTwoDigits === '34' || firstTwoDigits === '37') return 'Amex';

    return 'Kart';
   };

   const cardType = getCardType(cleanedCardNumber);
   const expectedLength = cardType === 'Amex' ? 15 : 16;

   if (!cleanedCardNumber || cleanedCardNumber.length !== expectedLength) {
    errors.cardNumber = `Kart numarası ${expectedLength} haneli olmalıdır!`;
   }
  }

  if (!cardForm.cardHolder || cardForm.cardHolder.trim().length < 3) {
   errors.cardHolder = "Kart sahibi adı en az 3 karakter olmalıdır!";
  }

  if (!cardForm.month || cardForm.month < 1 || cardForm.month > 12) {
   errors.month = "Geçerli bir ay seçiniz!";
  }

  if (!cardForm.year || cardForm.year.length !== 2) {
   errors.year = "Yıl 2 haneli olmalıdır!";
  }

  const isAmex = editingCard
   ? (editingCard.cardType === "Amex")
   : (() => {
    const cn = (cardForm.cardNumber || "").replace(/\s/g, "");
    return cn.startsWith("34") || cn.startsWith("37");
   })();
  const expectedCvcLen = isAmex ? 4 : 3;

  if (!cardForm.cvc || cardForm.cvc.trim() === "") {
   errors.cvc = "Güvenlik kodu (CVC/CVV) zorunludur!";
  } else if (cardForm.cvc.trim().length !== expectedCvcLen) {
   errors.cvc = isAmex
    ? "American Express kartlarında güvenlik kodu 4 haneli olmalıdır!"
    : "Güvenlik kodu (CVC/CVV) 3 haneli olmalıdır!";
  }

  if (Object.keys(errors).length > 0) {
   setCardErrors(errors);
   return;
  }

  try {
   const cardId = editingCard?._id?.toString ? editingCard._id.toString() : editingCard?._id;
   const url = editingCard ? `/api/user/cards/${cardId}` : "/api/user/cards";

   const cleanedCardNumber = cardForm.cardNumber.replace(/\s/g, "");

   const res = editingCard
    ? await axiosInstance.put(url, {
     title: cardForm.title,
     cardHolder: cardForm.cardHolder,
     month: cardForm.month,
     year: cardForm.year,
     cvc: cardForm.cvc,
     isDefault: cardForm.isDefault,
    })
    : await axiosInstance.post(url, {
     title: cardForm.title,
     cardNumber: cleanedCardNumber,
     cardHolder: cardForm.cardHolder,
     month: cardForm.month,
     year: cardForm.year,
     cvc: cardForm.cvc,
     isDefault: cardForm.isDefault,
    });

   const data = res.data;

   if (!data.success) {
    showToast(data.message || "İşlem başarısız!", "error");
    return;
   }

   showToast(editingCard ? "Kart güncellendi!" : "Kart eklendi!", "success");
   setShowCardModal(false);
   resetCardForm();

   // Eğer response'da cards array'i varsa direkt kullan, yoksa fetchCards çağır
   if (data.cards && Array.isArray(data.cards)) {
    const sortedCards = [...data.cards].sort((a, b) => {
     if (a.isDefault && !b.isDefault) return -1;
     if (!a.isDefault && b.isDefault) return 1;
     return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    setCards(sortedCards);
   } else {
    await fetchCards();
   }
  } catch (error) {
   showToast(error.response?.data?.message || "Bir hata oluştu! Lütfen tekrar deneyin.", "error");
  }
 };

 const handleEditCard = (card) => {
  setEditingCard(card);

  const isAmex = (card.cardType || "").toLowerCase() === "amex";
  // Amex: •••• •••••• 51251 (son 5). Diğerleri: •••• •••• •••• 1234 (son 4)
  let maskedNumber = isAmex ? "•••• •••••• •••••" : "•••• •••• •••• ••••";
  let lastDigits = "";

  if (card.cardNumberLast4 !== undefined && card.cardNumberLast4 !== null && card.cardNumberLast4 !== "") {
   const trimmed = String(card.cardNumberLast4).trim();
   if (trimmed.length >= (isAmex ? 5 : 4)) {
    lastDigits = isAmex ? trimmed.slice(-5) : trimmed.slice(-4);
    maskedNumber = isAmex ? `•••• •••••• ${lastDigits}` : `•••• •••• •••• ${lastDigits}`;
   } else if (trimmed.length > 0) {
    lastDigits = trimmed;
    maskedNumber = isAmex ? `•••• •••••• ${lastDigits}` : `•••• •••• •••• ${lastDigits}`;
   }
  }

  if (!lastDigits && card.cardNumberMasked) {
   const maskedStr = String(card.cardNumberMasked).trim();
   const lastMatch = RegExp(/(\d{4,5})[^\d]*$/).exec(maskedStr);
   if (lastMatch && lastMatch[1]) {
    lastDigits = lastMatch[1];
    maskedNumber = isAmex ? `•••• •••••• ${lastDigits}` : `•••• •••• •••• ${lastDigits}`;
   } else {
    maskedNumber = maskedStr.replace(/\*/g, "•");
   }
  }

  const isDefaultValue = card.isDefault === true || card.isDefault === 'true' || card.isDefault === 1;

  setCardForm({
   title: card.title || '',
   cardNumber: maskedNumber,
   cardHolder: card.cardHolder || '',
   month: card.month || '',
   year: card.year || '',
   cvc: card.cvc || '',
   isDefault: isDefaultValue,
  });
  setShowCardModal(true);
 };

 const resetAddressForm = () => {
  setAddressForm({
   title: "",
   firstName: "",
   lastName: "",
   phone: "",
   address: "",
   city: "",
   district: "",
   isDefault: false,
  });
  setEditingAddress(null);
  setAddressErrors({});
 };

 const resetCardForm = () => {
  setCardForm({
   title: "",
   cardNumber: "",
   cardHolder: "",
   month: "",
   year: "",
   cvc: "",
   isDefault: false,
  });
  setCardErrors({});
  setEditingCard(null);
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
   const res = await axiosInstance.get("/api/user/orders", {
    cache: 'no-store',
   });

   // Response'un JSON olup olmadığını kontrol et
   const contentType = res.headers["content-type"];
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

   const data = res.data;
   if (data.success) {
    setOrders(data.orders || []);
   } else {
    setOrders([]);
    showToast(data.message || "Siparişler yüklenemedi", "error");
   }
  } catch (error) {
   setOrders([]);
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

  if (!userInfo.firstName || !userInfo.firstName.trim()) {
   errors.firstName = "Ad alanı zorunludur!";
  }

  if (!userInfo.lastName || !userInfo.lastName.trim()) {
   errors.lastName = "Soyad alanı zorunludur!";
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
   errors.phone = "Telefon numarası 11 haneli olmalıdır! (Örn: 0XXXXXXXXXX)";
  }

  // Şehir ve Adres artık zorunlu değil 
  // Hata varsa göster ve dur
  if (Object.keys(errors).length > 0) {
   setProfileErrors(errors);
   return;
  }

  setUpdatingProfile(true);

  try {
   const res = await axiosInstance.put("/api/user/profile", {
    firstName: userInfo.firstName.trim(),
    lastName: userInfo.lastName.trim(),
    name: `${userInfo.firstName.trim()} ${userInfo.lastName.trim()}`.trim(), // Geriye dönük uyumluluk için
    email: userInfo.email.trim(),
    phone: phoneDigits, // Sadece rakamları gönder
    // city ve address artık gönderilmiyor - Adreslerim kısmından gelecek
   });

   const data = res.data;

   if (!data.success) {
    showToast(data.message || "Profil güncellenemedi!", "error");
    return;
   }

   showToast("Profil başarıyla güncellendi!", "success");
   // Geriye dönük uyumluluk için: eğer firstName/lastName yoksa name'den ayır
   let firstName = data.user.firstName || '';
   let lastName = data.user.lastName || '';
   let name = data.user.name || '';
   if (!firstName && !lastName && data.user.name) {
    const parts = data.user.name.trim().split(' ');
    firstName = parts[0] || '';
    lastName = parts.slice(1).join(' ') || '';
    name = data.user.name;
   } else if (firstName && lastName && !name) {
    name = `${firstName} ${lastName}`.trim();
   }
   setCurrentUser({
    ...currentUser,
    name: name,
    firstName: firstName,
    lastName: lastName,
    email: data.user.email,
   });
   // Form'u da güncelle
   setUserInfo({
    ...userInfo,
    firstName: firstName,
    lastName: lastName,
    name: name,
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
   const res = await axiosInstance.put("/api/user/profile", {
    currentPassword: passwordForm.currentPassword,
    newPassword: passwordForm.newPassword,
   });

   const data = res.data;

   if (!data.success) {
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

   const res = await axiosInstance.post("/api/upload", formData);

   const data = res.data;

   if (!data.success) {
    showToast(data.message || "Resim yüklenemedi!", "error");
    return;
   }

   // Profil resmini güncelle
   const updateRes = await axiosInstance.put("/api/user/profile", {
    profileImage: data.url,
   });

   const updateData = updateRes.data;

   if (!updateData.success) {
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
   const res = await axiosInstance.patch(`/api/user/orders/${targetOrderId}`, {
    status: "İptal Edildi",
   });

   const data = res.data;

   if (!data.success) {
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

 const handleReturnOrder = async (orderId, reason) => {
  const targetOrderId = orderId || returnOrderConfirm.orderId;
  if (!targetOrderId) return;

  if (!reason || !reason.trim()) {
   showToast("Lütfen iade nedeninizi belirtin.", "error");
   return;
  }

  try {
   const res = await axiosInstance.post(`/api/user/orders/${targetOrderId}/return`, {
    note: reason.trim(),
   });

   const data = res.data;

   if (!data.success) {
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
   const res = await axiosInstance.delete(`/api/user/orders/${targetOrderId}/return`);

   const data = res.data;

   if (!data.success) {
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
   const res = await axiosInstance.put("/api/user/profile", {
    notificationPreferences: updatedPreferences,
   });

   const data = res.data;

   if (!data.success) {
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
   const res = await axiosInstance.delete("/api/user/profile");

   const data = res.data;

   if (!data.success) {
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

      {activeTab === "urun-istekleri" && (
       <ProductRequestsTab />
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
