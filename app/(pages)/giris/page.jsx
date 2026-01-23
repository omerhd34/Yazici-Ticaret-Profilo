"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import { HiLogin, HiUserAdd, HiArrowLeft } from "react-icons/hi";
import LoginForm from "@/app/components/auth/LoginForm";
import RegisterForm from "@/app/components/auth/RegisterForm";
import ForgotPasswordModal from "@/app/components/auth/ForgotPasswordModal";
import EmailVerificationModal from "@/app/components/auth/EmailVerificationModal";
import AlertMessage from "@/app/components/auth/AlertMessage";
import ConfirmDialog from "@/app/components/auth/ConfirmDialog";

export default function GirisPage() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const [activeTab, setActiveTab] = useState("giris");
 const [error, setError] = useState("");
 const [success, setSuccess] = useState("");
 const [showForgotPassword, setShowForgotPassword] = useState(false);
 const [showVerificationCode, setShowVerificationCode] = useState(false);

 // Sayfa yüklendiğinde sadece logout durumunu kontrol et
 useEffect(() => {
  const handleLogout = async () => {
   // Logout query parametresi varsa sadece logout işlemi yap
   if (searchParams.get('logout') === 'true') {
    // Logout API çağrısı yap
    try {
     await axiosInstance.post("/api/user/logout", {}, {
      cache: 'no-store',
     });
    } catch (error) {
    }

    // localStorage'a logout flag'i kaydet (sepet/favoriler silinmez; cart_${userId} ile kullanıcıya özel)
    if (typeof window !== 'undefined') {
     localStorage.setItem('just_logged_out', Date.now().toString());
     // Query parametresini temizle
     window.history.replaceState({}, '', '/giris');
     // Flag'i 5 saniye sonra temizle
     setTimeout(() => {
      localStorage.removeItem('just_logged_out');
     }, 5000);
    }
   }

   // Email doğrulama mesajları
   if (searchParams.get('verified') === 'true') {
    // Email doğrulandı, direkt hesap sayfasına yönlendir
    window.location.href = "/hesabim";
   } else if (searchParams.get('error')) {
    const errorMsg = searchParams.get('error');
    let message = "Bir hata oluştu.";
    if (errorMsg === 'gecersiz-link') message = "Geçersiz doğrulama linki.";
    else if (errorMsg === 'kullanici-bulunamadi') message = "Kullanıcı bulunamadı.";
    else if (errorMsg === 'gecersiz-kod') message = "Geçersiz doğrulama kodu.";
    else if (errorMsg === 'kod-suresi-doldu') message = "Doğrulama kodunun süresi dolmuş.";
    setError(message);
    window.history.replaceState({}, '', '/giris');
   }
  };

  handleLogout();
 }, [searchParams]);

 // Giriş yapmış kullanıcıları kontrol et ve yönlendir
 useEffect(() => {
  const checkAuth = async () => {
   if (searchParams.get('logout') === 'true') {
    return;
   }

   if (typeof window !== 'undefined') {
    const justLoggedOut = localStorage.getItem('just_logged_out');
    if (justLoggedOut) {
     const logoutTime = parseInt(justLoggedOut, 10);
     const now = Date.now();
     if (now - logoutTime < 300000) {
      return;
     }
    }
   }

   try {
    const res = await axiosInstance.get("/api/user/check", {
     cache: 'no-store',
    });

    const data = res.data;

    if (data.authenticated) {
     router.replace("/hesabim");
    }
   } catch (error) {
   }
  };

  checkAuth();
 }, [router, searchParams]);

 const [verificationUserId, setVerificationUserId] = useState("");
 const [verificationUserEmail, setVerificationUserEmail] = useState("");

 const handleLoginVerificationRequired = (userId, email) => {
  setVerificationUserId(userId);
  setVerificationUserEmail(email);
  setShowVerificationCode(true);
  setError("Email adresinizi doğrulamanız gerekiyor. E-posta adresinize doğrulama kodu gönderildi.");
 };

 const handleRegisterVerificationRequired = (userId, email) => {
  setVerificationUserId(userId);
  setVerificationUserEmail(email);
  setShowVerificationCode(true);
  setSuccess("E-posta adresinize doğrulama kodu gönderildi.");
 };

 const handleVerificationSuccess = () => {
  setShowVerificationCode(false);
  setVerificationUserId("");
  setVerificationUserEmail("");
  setActiveTab("giris");
  setError("");
  setSuccess("");
 };

 const handleRegisterSuccess = (data, email) => {
  setSuccess("Kayıt başarılı! Giriş yapabilirsiniz.");
  setTimeout(() => {
   setActiveTab("giris");
   setSuccess("");
  }, 2000);
 };

 return (
  <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 py-12">
   <div className="container mx-auto px-4">
    <div className="max-w-lg mx-auto">
     {/* Logo/Header */}
     <div className="text-center mb-8">
      <Link href="/" className="inline-block">
       <h1 className="text-4xl font-black text-gray-900 mb-2">
        YAZICI TİCARET
       </h1>
      </Link>
      <p className="text-gray-600">Hesabınıza giriş yapın veya yeni hesap oluşturun.</p>
     </div>

     {/* Tab Switcher */}
     <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="flex border-b">
       <button
        onClick={() => {
         setActiveTab("giris");
         setError("");
         setSuccess("");
        }}
        className={`flex-1 py-4 font-bold text-center transition cursor-pointer ${activeTab === "giris"
         ? "bg-indigo-600 text-white"
         : "bg-gray-50 text-gray-600 hover:bg-gray-100"
         }`}
       >
        <HiLogin className="inline mr-2" size={20} />
        Giriş Yap
       </button>
       <button
        onClick={() => {
         setActiveTab("kayit");
         setError("");
         setSuccess("");
        }}
        className={`flex-1 py-4 font-bold text-center transition cursor-pointer ${activeTab === "kayit"
         ? "bg-indigo-600 text-white"
         : "bg-gray-50 text-gray-600 hover:bg-gray-100"
         }`}
       >
        <HiUserAdd className="inline mr-2" size={20} />
        Kayıt Ol
       </button>
      </div>

      <div className="p-8">
       {/* Error/Success Messages */}
       {error && <AlertMessage message={error} type="error" />}
       {success && <AlertMessage message={success} type="success" />}

       {/* Giriş Formu */}
       {activeTab === "giris" && (
        <LoginForm
         onLogin={() => {
          window.location.href = "/hesabim";
         }}
         onForgotPassword={() => setShowForgotPassword(true)}
         onVerificationRequired={handleLoginVerificationRequired}
        />
       )}

       {/* Kayıt Formu */}
       {activeTab === "kayit" && (
        <RegisterForm
         onRegister={handleRegisterSuccess}
         onVerificationRequired={handleRegisterVerificationRequired}
        />
       )}
      </div>
     </div>

     {/* Back to Home */}
     <div className="mt-6 text-center">
      <Link
       href="/"
       className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition-colors duration-200"
      >
       <HiArrowLeft size={18} />
       Ana Sayfaya Dön
      </Link>
     </div>
    </div>
   </div>

   {/* Email Doğrulama Modal */}
   <EmailVerificationModal
    show={showVerificationCode}
    onClose={() => {
     setShowVerificationCode(false);
     setVerificationUserId("");
     setVerificationUserEmail("");
     setError("");
     setSuccess("");
    }}
    userId={verificationUserId}
    userEmail={verificationUserEmail}
    onSuccess={handleVerificationSuccess}
   />

   {/* Şifremi Unuttum Modal */}
   <ForgotPasswordModal
    show={showForgotPassword}
    onClose={() => {
     setShowForgotPassword(false);
     setError("");
     setSuccess("");
    }}
   />
  </div>
 );
}

