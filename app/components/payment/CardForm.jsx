"use client";
import { useState, useEffect, useCallback } from "react";
import { FaLock } from "react-icons/fa";

export default function CardForm({ onCardDataChange, cardData, isSavedCard = false }) {
 const [errors, setErrors] = useState({});

 const getCardType = (cardNumber) => {
  if (!cardNumber || cardNumber.length === 0) return 'Kart';
  const cleaned = cardNumber.replaceAll(" ", "");
  const firstDigit = cleaned[0];
  const firstTwoDigits = cleaned.substring(0, 2);
  const firstFourDigits = cleaned.substring(0, 4);

  if (firstDigit === '4') return 'Visa';
  if (firstTwoDigits >= '51' && firstTwoDigits <= '55') return 'Mastercard';
  if (firstFourDigits >= '2221' && firstFourDigits <= '2720') return 'Mastercard';
  if (firstFourDigits === '9792') return 'Troy';
  if (firstTwoDigits === '65') return 'Troy';
  if (firstTwoDigits === '34' || firstTwoDigits === '37') return 'Amex';

  return 'Kart';
 };

 const validateCardNumber = useCallback((value) => {
  const cleaned = value.replaceAll(" ", "");
  const cardType = getCardType(cleaned);
  // American Express: 15 haneli, diğerleri: 16 haneli
  const expectedLength = cardType === 'Amex' ? 15 : 16;
  return new RegExp(String.raw`^\d{${expectedLength}}$`).test(cleaned);
 }, []);

 const validateMonth = (value) => {
  const month = Number.parseInt(value, 10);
  return month >= 1 && month <= 12;
 };

 const validateYear = (value) => {
  if (!value || value.length !== 2) return false;
  const year = Number.parseInt(value, 10);
  const currentYear = new Date().getFullYear() % 100; // Son 2 haneyi al
  return year >= currentYear && year <= 99;
 };

 const validateCVC = useCallback((value, cardNumber) => {
  const cardType = getCardType(cardNumber || "");
  const expectedLen = cardType === "Amex" ? 4 : 3;
  return new RegExp(String.raw`^\d{${expectedLen}}$`).test(String(value || "").trim());
 }, []);

 const formatCardNumber = (value) => {
  const cleaned = value.replaceAll(" ", "");
  const cardType = getCardType(cleaned);

  // American Express için 4-6-5 formatı (15 hane)
  if (cardType === 'Amex') {
   const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
   // İlk 4, sonra 6, sonra 5 hane
   if (cleaned.length > 4) {
    const part1 = cleaned.substring(0, 4);
    const part2 = cleaned.substring(4, 10);
    const part3 = cleaned.substring(10, 15);
    if (part3) {
     return `${part1} ${part2} ${part3}`.trim();
    } else if (part2) {
     return `${part1} ${part2}`.trim();
    }
    return part1;
   }
   return cleaned.slice(0, 15);
  }

  // Diğer kartlar için 4-4-4-4 formatı (16 hane)
  const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
  return formatted.slice(0, 19);
 };

 const handleCardNumberChange = (e) => {
  // Sadece sayıları kabul et
  const inputValue = e.target.value.replace(/\D/g, "");
  const formatted = formatCardNumber(inputValue);
  const cleaned = formatted.replaceAll(" ", "");

  setErrors((prev) => ({ ...prev, cardNumber: "" }));
  onCardDataChange({ ...cardData, cardNumber: cleaned, cardNumberFormatted: formatted });
 };

 const handleMonthChange = (e) => {
  const value = e.target.value;
  if (value === "" || (value >= 1 && value <= 12)) {
   setErrors((prev) => ({ ...prev, month: "" }));
   onCardDataChange({ ...cardData, month: value });
  }
 };

 const handleYearChange = (e) => {
  // Sadece sayıları kabul et ve maksimum 2 haneli yap
  const inputValue = e.target.value.replace(/\D/g, "").slice(0, 2);
  setErrors((prev) => ({ ...prev, year: "" }));
  onCardDataChange({ ...cardData, year: inputValue });
 };

 const handleCVCChange = (e) => {
  const cardType = getCardType(cardData.cardNumber || "");
  const maxLen = cardType === "Amex" ? 4 : 3;
  const value = e.target.value.replace(/\D/g, "").slice(0, maxLen);
  setErrors((prev) => ({ ...prev, cvc: "" }));
  onCardDataChange({ ...cardData, cvc: value });
 };

 const handleCardHolderChange = (e) => {
  // Sadece harfleri ve boşlukları kabul et (Türkçe karakterler dahil)
  let inputValue = e.target.value.replace(/[^\p{L}\s]/gu, "");

  // Her kelimenin ilk harfini büyük yap (title case)
  inputValue = inputValue
   .split(/\s+/)
   .map(word => {
    if (word.length === 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
   })
   .join(' ');

  setErrors((prev) => ({ ...prev, cardHolder: "" }));
  onCardDataChange({ ...cardData, cardHolder: inputValue });
 };

 // validate fonksiyonunu dışarıya aç (useEffect içinde)
 useEffect(() => {
  const validate = () => {
   const newErrors = {};

   if (!cardData.cardNumber || !validateCardNumber(cardData.cardNumber)) {
    const cardType = getCardType(cardData.cardNumber);
    const expectedLength = cardType === 'Amex' ? 15 : 16;
    newErrors.cardNumber = `Kart numarası ${expectedLength} haneli olmalıdır`;
   }

   if (!cardData.month || !validateMonth(cardData.month)) {
    newErrors.month = "Geçerli bir ay seçiniz";
   }

   if (!cardData.year || !validateYear(cardData.year)) {
    newErrors.year = "Yıl 2 haneli olmalıdır!";
   }

   if (!cardData.cvc || !validateCVC(cardData.cvc, cardData.cardNumber)) {
    const cardType = getCardType(cardData.cardNumber || "");
    newErrors.cvc = cardType === "Amex"
     ? "American Express kartlarında güvenlik kodu 4 haneli olmalıdır"
     : "Güvenlik kodu (CVC/CVV) 3 haneli olmalıdır";
   }

   if (!cardData.cardHolder || cardData.cardHolder.trim().length < 3) {
    newErrors.cardHolder = "Kart sahibi adı en az 3 karakter olmalıdır";
   }

   setErrors(newErrors);
   return Object.keys(newErrors).length === 0;
  };

  if (globalThis.window !== undefined) {
   globalThis.window.cardFormValidate = validate;
  }

  // Cleanup: component unmount olduğunda temizle
  return () => {
   if (globalThis.window !== undefined) {
    delete globalThis.window.cardFormValidate;
   }
  };
 }, [cardData, validateCardNumber, validateCVC]);

 return (
  <div className={`space-y-4 ${isSavedCard ? 'opacity-50 pointer-events-none' : ''}`}>
   {isSavedCard && (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
     <p className="text-sm text-blue-700">Kayıtlı kart seçildi. Sadece Güvenlik kodu(CVC/CVV) kodunu giriniz.</p>
    </div>
   )}
   <div>
    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
     Kart Numarası {!isSavedCard && <span className="text-red-500">*</span>}
    </label>
    <input
     id="cardNumber"
     type="text"
     inputMode="numeric"
     autoComplete="cc-number"
     placeholder={getCardType(cardData.cardNumber || "") === 'Amex' ? "1234 567890 12345" : "1234 5678 9012 3456"}
     value={cardData.cardNumberFormatted || ""}
     onChange={handleCardNumberChange}
     maxLength={getCardType(cardData.cardNumber || "") === 'Amex' ? 17 : 19}
     className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.cardNumber ? "border-red-500" : "border-gray-300"
      }`}
    />
    {errors.cardNumber && (
     <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
    )}
   </div>

   <div>
    <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-2">
     Kart Sahibi
    </label>
    <input
     id="cardHolder"
     type="text"
     autoComplete="cc-name"
     placeholder="Ad ve Soyad"
     value={cardData.cardHolder || ""}
     onChange={handleCardHolderChange}
     className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.cardHolder ? "border-red-500" : "border-gray-300"
      }`}
    />
    {errors.cardHolder && (
     <p className="mt-1 text-sm text-red-600">{errors.cardHolder}</p>
    )}
   </div>

   <div className="grid grid-cols-3 gap-4">
    <div>
     <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
      Son Kullanma Ayı
     </label>
     <input
      id="month"
      type="number"
      inputMode="numeric"
      autoComplete="cc-exp-month"
      placeholder="MM"
      min="1"
      max="12"
      value={cardData.month || ""}
      onChange={handleMonthChange}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.month ? "border-red-500" : "border-gray-300"
       }`}
     />
     {errors.month && (
      <p className="mt-1 text-sm text-red-600">{errors.month}</p>
     )}
    </div>

    <div>
     <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
      Son Kullanma Yılı
     </label>
     <input
      id="year"
      type="text"
      inputMode="numeric"
      autoComplete="cc-exp-year"
      placeholder="YY"
      maxLength="2"
      value={cardData.year || ""}
      onChange={handleYearChange}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.year ? "border-red-500" : "border-gray-300"
       }`}
     />
     {errors.year && (
      <p className="mt-1 text-sm text-red-600">{errors.year}</p>
     )}
    </div>

    <div>
     <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-2">
      CVC
     </label>
     <input
      id="cvc"
      type="text"
      inputMode="numeric"
      autoComplete="cc-csc"
      placeholder={getCardType(cardData.cardNumber || "") === "Amex" ? "1234" : "123"}
      maxLength={getCardType(cardData.cardNumber || "") === "Amex" ? 4 : 3}
      value={cardData.cvc || ""}
      onChange={handleCVCChange}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.cvc ? "border-red-500" : "border-gray-300"
       }`}
     />
     {errors.cvc && (
      <p className="mt-1 text-sm text-red-600">{errors.cvc}</p>
     )}
    </div>
   </div>

   <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
    <FaLock className="text-indigo-600" size={16} />
    <span>Kart bilgileriniz SSL ile şifrelenerek güvenli bir şekilde işlenmektedir.</span>
   </div>
  </div>
 );
}
