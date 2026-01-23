"use client";
import { FaTrash, FaEdit, FaStar, FaCcVisa, FaCreditCard } from "react-icons/fa";
import { GrAmex } from "react-icons/gr";

import Image from "next/image";

export default function CardCard({ card, onEdit, onDelete, onSetDefault }) {
 const getCardType = (card) => {
  if (card.cardType && card.cardType.trim() !== '' && card.cardType !== 'Kart') {
   return card.cardType;
  }
  return "Kart";
 };

 const getCardTypeStyle = (cardType) => {
  switch (cardType) {
   case 'Visa':
    return 'bg-blue-100 text-blue-700 border-blue-200';
   case 'Mastercard':
    return 'bg-orange-100 text-orange-700 border-orange-200';
   case 'Troy':
    return 'bg-gray-400 text-gray-700 border-gray-200';
   case 'Amex':
    return 'bg-cyan-100 text-cyan-700 border-cyan-200';
   default:
    return 'bg-indigo-100 text-indigo-700 border-indigo-200';
  }
 };

 // Kart tipine göre ikon render et
 const renderCardIcon = (cardType) => {
  const iconSize = 35;
  const iconClass = "text-white";

  switch (cardType) {
   case 'Visa':
    return <FaCcVisa className={iconClass} size={iconSize} />;
   case 'Mastercard':
    return (
     <Image
      src="/mastercard.webp"
      alt="Troy"
      width={iconSize}
      height={iconSize}
      className="object-contain"
     />
    );
   case 'Amex':
    return <GrAmex className={iconClass} size={iconSize} />;
   case 'Troy':
    return (
     <Image
      src="/troy.png"
      alt="Troy"
      width={iconSize}
      height={iconSize}
      className="object-contain"
      style={{ filter: 'brightness(0) invert(1)' }}
     />
    );
   default:
    return <FaCreditCard className={iconClass} size={iconSize} />;
  }
 };

 return (
  <div className="border rounded-xl p-4 bg-linear-to-br from-indigo-50 to-purple-50 border-indigo-200 hover:shadow-md transition-shadow">
   <div className="flex items-start justify-between mb-3">
    <div className="flex items-center gap-3">
     <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCardType(card) === 'Troy' ? 'bg-gray-600' :
      getCardType(card) === 'Visa' ? 'bg-blue-600' :
       getCardType(card) === 'Mastercard' ? 'bg-orange-100' :
        getCardType(card) === 'Amex' ? 'bg-cyan-600' :
         'bg-indigo-600'
      }`}>
      {renderCardIcon(getCardType(card))}
     </div>
     <div>
      <h3 className="font-bold text-gray-900">{card.title}</h3>
      <div className="flex items-center gap-2">
       <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${getCardTypeStyle(getCardType(card))}`}>
        {getCardType(card)}
       </span>
       <p className="text-sm text-gray-600">
        {getCardType(card) === "Amex" ? `•••• •••••• ${card.cardNumberLast4 || ""}` : `•••• ${card.cardNumberLast4 || ""}`}
       </p>
      </div>
     </div>
    </div>
    {card.isDefault && (
     <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
      <FaStar size={10} />
      Varsayılan
     </span>
    )}
   </div>

   <div className="mb-3">
    <p className="text-sm text-gray-700">
     <span className="font-semibold">Kart Sahibi:</span> {card.cardHolder}
    </p>
    <p className="text-sm text-gray-700">
     <span className="font-semibold">Son Kullanma Tarihi:</span> {card.month}/{card.year}
    </p>
    <p className="text-sm text-gray-700">
     <span className="font-semibold">Güvenlik kodu(CVC/CVV):</span> {card.cvc && card.cvc.trim() !== '' ? card.cvc : 'Yok'}
    </p>
   </div>

   <div className="flex items-center gap-2 pt-3 border-t border-indigo-200">
    {!card.isDefault && (
     <button
      onClick={onSetDefault}
      className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
     >
      <FaStar size={14} />
      Varsayılan Yap
     </button>
    )}
    <button
     onClick={() => onEdit(card)}
     className="flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
     title="Düzenle"
    >
     <FaEdit size={14} />
    </button>
    <button
     onClick={() => {
      const cardId = card._id?.toString ? card._id.toString() : String(card._id || '');
      onDelete(cardId);
     }}
     className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
     title="Sil"
    >
     <FaTrash size={14} />
    </button>
   </div>
  </div>
 );
}
