"use client";
import { HiX } from "react-icons/hi";

export default function CardModal({ show, editingCard, cardForm, setCardForm, cardErrors, setCardErrors, onSubmit, onClose }) {
 if (!show) return null;

 const getCardType = (cardNumber) => {
  if (!cardNumber || cardNumber.length === 0) return 'Kart';
  const cleaned = cardNumber.replace(/\D/g, "");
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

 const formatCardNumber = (value) => {
  const cleaned = value.replace(/\D/g, "");
  const cardType = getCardType(cleaned);

  // American Express için 4-6-5 formatı (15 hane)
  if (cardType === 'Amex') {
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
  const formatted = formatCardNumber(e.target.value);
  setCardForm({ ...cardForm, cardNumber: formatted });
  if (cardErrors.cardNumber) {
   setCardErrors({ ...cardErrors, cardNumber: "" });
  }
 };

 return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
   <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
     <h3 className="text-2xl font-bold">
      {editingCard ? "Kart Düzenle" : "Yeni Kart Ekle"}
     </h3>
     <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
      <HiX size={24} />
     </button>
    </div>

    <form onSubmit={onSubmit} className="p-6 space-y-4">
     <div>
      <label className="block text-sm font-semibold mb-2">Kart Başlığı <span className="text-red-500">*</span></label>
      <input
       type="text"
       value={cardForm.title}
       onChange={(e) => {
        setCardForm({ ...cardForm, title: e.target.value });
        if (cardErrors.title) {
         setCardErrors({ ...cardErrors, title: "" });
        }
       }}
       className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none ${cardErrors.title ? "border-red-500" : "border-gray-300"
        }`}
       placeholder="Ana Kart, İş Kartı, vb."
       required
      />
      {cardErrors.title && (
       <p className="text-xs text-red-500 mt-1">{cardErrors.title}</p>
      )}
     </div>

     <div>
      <label className="block text-sm font-semibold mb-2">Kart Numarası <span className="text-red-500">*</span></label>
      <input
       type="text"
       inputMode="numeric"
       value={cardForm.cardNumber}
       onChange={handleCardNumberChange}
       maxLength={getCardType(cardForm.cardNumber || "") === 'Amex' ? 17 : 19}
       className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none ${cardErrors.cardNumber ? "border-red-500" : "border-gray-300"
        }`}
       placeholder={getCardType(cardForm.cardNumber || "") === 'Amex' ? "1234 567890 12345" : "1234 5678 9012 3456"}
       required
       disabled={!!editingCard}
      />
      {cardErrors.cardNumber && (
       <p className="text-xs text-red-500 mt-1">{cardErrors.cardNumber}</p>
      )}
     </div>

     <div>
      <label className="block text-sm font-semibold mb-2">Kart Sahibi <span className="text-red-500">*</span></label>
      <input
       type="text"
       value={cardForm.cardHolder}
       onChange={(e) => {
        let value = e.target.value.replace(/[^\p{L}\s]/gu, "");

        value = value
         .split(/\s+/)
         .map(word => {
          if (word.length === 0) return word;
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
         })
         .join(' ');

        setCardForm({ ...cardForm, cardHolder: value });
        if (cardErrors.cardHolder) {
         setCardErrors({ ...cardErrors, cardHolder: "" });
        }
       }}
       className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none ${cardErrors.cardHolder ? "border-red-500" : "border-gray-300"
        }`}
       placeholder="Ad ve Soyad"
       required
      />
      {cardErrors.cardHolder && (
       <p className="text-xs text-red-500 mt-1">{cardErrors.cardHolder}</p>
      )}
     </div>

     <div className="grid md:grid-cols-3 gap-4">
      <div>
       <label className="block text-sm font-semibold mb-2">Son Kullanma Ayı <span className="text-red-500">*</span></label>
       <input
        type="number"
        inputMode="numeric"
        value={cardForm.month}
        onChange={(e) => {
         const value = e.target.value;
         if (value === "" || (value >= 1 && value <= 12)) {
          setCardForm({ ...cardForm, month: value });
          if (cardErrors.month) {
           setCardErrors({ ...cardErrors, month: "" });
          }
         }
        }}
        className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none ${cardErrors.month ? "border-red-500" : "border-gray-300"
         }`}
        placeholder="MM"
        min="1"
        max="12"
        required
       />
       {cardErrors.month && (
        <p className="text-xs text-red-500 mt-1">{cardErrors.month}</p>
       )}
      </div>

      <div>
       <label className="block text-sm font-semibold mb-2">Son Kullanma Yılı <span className="text-red-500">*</span></label>
       <input
        type="text"
        inputMode="numeric"
        value={cardForm.year}
        onChange={(e) => {
         const value = e.target.value.replace(/\D/g, "").slice(0, 2);
         setCardForm({ ...cardForm, year: value });
         if (cardErrors.year) {
          setCardErrors({ ...cardErrors, year: "" });
         }
        }}
        className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none ${cardErrors.year ? "border-red-500" : "border-gray-300"
         }`}
        placeholder="YY"
        maxLength="2"
        required
       />
       {cardErrors.year && (
        <p className="text-xs text-red-500 mt-1">{cardErrors.year}</p>
       )}
      </div>

      <div>
       <label className="block text-sm font-semibold mb-2">Güvenlik kodu <span className="text-red-500">*</span></label>
       <input
        type="text"
        inputMode="numeric"
        value={cardForm.cvc || ""}
        onChange={(e) => {
         const isAmex = editingCard ? (editingCard.cardType === "Amex") : (getCardType(cardForm.cardNumber || "") === "Amex");
         const maxLen = isAmex ? 4 : 3;
         const value = e.target.value.replace(/\D/g, "").slice(0, maxLen);
         setCardForm({ ...cardForm, cvc: value });
         if (cardErrors.cvc) {
          setCardErrors({ ...cardErrors, cvc: "" });
         }
        }}
        className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none ${cardErrors.cvc ? "border-red-500" : "border-gray-300"
         }`}
        placeholder={(editingCard ? (editingCard.cardType === "Amex") : (getCardType(cardForm.cardNumber || "") === "Amex")) ? "1234" : "123"}
        maxLength={(editingCard ? (editingCard.cardType === "Amex") : (getCardType(cardForm.cardNumber || "") === "Amex")) ? 4 : 3}
        required
       />
       {cardErrors.cvc && (
        <p className="text-xs text-red-500 mt-1">{cardErrors.cvc}</p>
       )}
      </div>
     </div>

     <div className="flex items-center gap-2">
      <input
       type="checkbox"
       id="isDefault"
       checked={Boolean(cardForm.isDefault)}
       onChange={(e) => setCardForm({ ...cardForm, isDefault: e.target.checked })}
       className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
      />
      <label htmlFor="isDefault" className="text-sm text-gray-700 cursor-pointer">
       Varsayılan kart olarak kaydet
      </label>
     </div>

     <div className="flex gap-3 pt-4">
      <button
       type="button"
       onClick={onClose}
       className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
      >
       İptal
      </button>
      <button
       type="submit"
       className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition cursor-pointer"
      >
       {editingCard ? "Güncelle" : "Kaydet"}
      </button>
     </div>
    </form>
   </div>
  </div>
 );
}
