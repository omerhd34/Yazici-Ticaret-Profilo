"use client";
import { useState } from "react";
import { HiChevronDown } from "react-icons/hi";
import SuccessMessage from "./SuccessMessage";
import axiosInstance from "@/lib/axios";

export default function ContactForm() {
 const [formData, setFormData] = useState({
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
 });
 const [submitted, setSubmitted] = useState(false);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const [phoneError, setPhoneError] = useState("");

 // Telefon numarası formatlama
 const formatPhoneNumber = (value) => {
  // Sadece rakamları al
  const digits = value.replace(/\D/g, '');

  // Maksimum 11 haneli olabilir
  const limitedDigits = digits.slice(0, 11);

  // Formatla: 05XX XXX XX XX
  if (limitedDigits.length <= 4) {
   return limitedDigits;
  } else if (limitedDigits.length <= 7) {
   return `${limitedDigits.slice(0, 4)} ${limitedDigits.slice(4)}`;
  } else if (limitedDigits.length <= 9) {
   return `${limitedDigits.slice(0, 4)} ${limitedDigits.slice(4, 7)} ${limitedDigits.slice(7)}`;
  } else {
   return `${limitedDigits.slice(0, 4)} ${limitedDigits.slice(4, 7)} ${limitedDigits.slice(7, 9)} ${limitedDigits.slice(9)}`;
  }
 };

 // Telefon numarası validasyonu
 const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
   return ''; // Telefon opsiyonel
  }

  const digits = phone.replace(/\D/g, '');

  if (digits.length === 0) {
   return '';
  }

  if (digits.length !== 11) {
   return 'Telefon numarası 11 haneli olmalıdır! (Örn: 0XXXXXXXXXX)';
  }

  if (!digits.startsWith('0')) {
   return 'Telefon numarası 0 ile başlamalıdır!';
  }

  const operatorCode = digits.slice(1, 3);
  if (!['50', '51', '52', '53', '54', '55', '56', '57', '58', '59'].includes(operatorCode)) {
   return 'Geçerli bir cep telefonu numarası giriniz!';
  }

  return '';
 };

 const handlePhoneChange = (e) => {
  const formatted = formatPhoneNumber(e.target.value);
  setFormData({ ...formData, phone: formatted });

  const errorMsg = validatePhone(formatted);
  setPhoneError(errorMsg);
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setPhoneError("");

  // Telefon validasyonu
  const phoneValidationError = validatePhone(formData.phone);
  if (phoneValidationError) {
   setPhoneError(phoneValidationError);
   setLoading(false);
   return;
  }

  try {
   const submitData = {
    ...formData,
    phone: formData.phone.replace(/\D/g, '') || '',
   };
   const response = await axiosInstance.post("/api/contact", submitData);

   if (response.data.success) {
    setSubmitted(true);
    setTimeout(() => {
     setSubmitted(false);
     setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    }, 3000);
   } else {
    setError(response.data.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
   }
  } catch (err) {
   setError(err.response?.data?.message || "Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.");
  } finally {
   setLoading(false);
  }
 };

 if (submitted) {
  return <SuccessMessage />;
 }

 return (
  <form onSubmit={handleSubmit} className="space-y-6">
   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
     <label className="block text-sm font-semibold text-gray-700 mb-2">
      Ad Soyad <span className="text-red-600">*</span>
     </label>
     <input
      type="text"
      required
      value={formData.name || ""}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
      placeholder="Adınız ve soyadınız"
     />
    </div>

    <div>
     <label className="block text-sm font-semibold text-gray-700 mb-2">
      E-posta <span className="text-red-600">*</span>
     </label>
     <input
      type="email"
      required
      value={formData.email || ""}
      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
      placeholder="ornek@email.com"
     />
    </div>
   </div>

   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
     <label className="block text-sm font-semibold text-gray-700 mb-2">
      Telefon
     </label>
     <input
      type="tel"
      value={formData.phone || ""}
      onChange={handlePhoneChange}
      maxLength={14}
      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${phoneError ? 'border-red-500' : 'border-gray-300'
       }`}
      placeholder="0XXXXXXXXXX"
     />
     {phoneError && (
      <p className="text-xs text-red-500 mt-1">{phoneError}</p>
     )}
    </div>

    <div>
     <label className="block text-sm font-semibold text-gray-700 mb-2">
      Konu <span className="text-red-600">*</span>
     </label>
     <div className="relative">
      <select
       required
       value={formData.subject || ""}
       onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
       className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition appearance-none bg-white"
      >
       <option value="">Konu seçiniz</option>
       <option value="siparis">Sipariş Sorunu</option>
       <option value="iade">İade & Değişim</option>
       <option value="urun">Ürün Sorusu</option>
       <option value="kargo">Kargo Sorunu</option>
       <option value="odeme">Ödeme Sorunu</option>
       <option value="diger">Diğer</option>
      </select>
      <HiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
     </div>
    </div>
   </div>

   <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
     Mesajınız <span className="text-red-600">*</span>
    </label>
    <textarea
     required
     value={formData.message || ""}
     onChange={(e) => setFormData({ ...formData, message: e.target.value })}
     rows={6}
     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
     placeholder="Mesajınızı buraya yazın..."
    />
   </div>

   {error && (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
     {error}
    </div>
   )}

   <button
    type="submit"
    disabled={loading}
    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition shadow-lg hover:shadow-xl cursor-pointer"
   >
    {loading ? "Gönderiliyor..." : "Mesaj Gönder"}
   </button>
  </form>
 );
}
