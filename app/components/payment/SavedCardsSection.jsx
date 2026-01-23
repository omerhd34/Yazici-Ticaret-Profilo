"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { FaStar, FaCcVisa, FaCreditCard } from "react-icons/fa";
import { GrAmex } from "react-icons/gr";
import Image from "next/image";

export default function SavedCardsSection({ onSelectCard, selectedCardId, cardData }) {
 const [cards, setCards] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showNewCard, setShowNewCard] = useState(false);

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
      alt="Mastercard"
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

 const fetchCards = async () => {
  try {
   setLoading(true);
   const res = await axiosInstance.get("/api/user/cards");
   const data = res.data || {};
   if (data.success) {
    const loadedCards = data.cards || [];
    const sortedCards = [...loadedCards].sort((a, b) => {
     if (a.isDefault && !b.isDefault) return -1;
     if (!a.isDefault && b.isDefault) return 1;
     return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    setCards(sortedCards);

    // Eğer varsayılan kart varsa ve hiç kart seçilmemişse, varsayılan kartı seç
    if (sortedCards.length > 0 && !selectedCardId && !showNewCard) {
     const defaultCard = sortedCards.find(c => c.isDefault) || sortedCards[0];
     if (defaultCard && onSelectCard) {
      onSelectCard(defaultCard);
     }
    }
   } else {
    setCards([]);
   }
  } catch (error) {
   console.error("Kartlar yüklenirken hata:", error);
   setCards([]);
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  fetchCards();
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 // Eğer yeni kart girişi yapılıyorsa, seçili kartı temizle
 useEffect(() => {
  if (showNewCard && selectedCardId && onSelectCard) {
   onSelectCard(null);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [showNewCard]);

 const handleCardSelect = (card) => {
  setShowNewCard(false);
  if (onSelectCard) {
   onSelectCard(card);
  }
 };

 const handleNewCardClick = () => {
  const newShowNewCard = !showNewCard;
  setShowNewCard(newShowNewCard);

  if (newShowNewCard) {
   // Yeni kart girişi moduna geçiliyorsa, seçili kartı temizle
   if (onSelectCard) {
    onSelectCard(null);
   }
  }
 };

 useEffect(() => {
  if (!showNewCard && cards.length > 0 && !selectedCardId && onSelectCard) {
   const defaultCard = cards.find(c => c.isDefault) || cards[0];
   if (defaultCard) {
    onSelectCard(defaultCard);
   }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [showNewCard, cards]);

 if (loading) {
  return (
   <div className="mb-4">
    <p className="text-sm text-gray-500">Kartlar yükleniyor...</p>
   </div>
  );
 }

 if (cards.length === 0) {
  return (
   <div className="mb-4">
    <p className="text-sm text-gray-600 mb-2">Kayıtlı kartınız bulunmamaktadır.</p>
    <button
     onClick={handleNewCardClick}
     className={`text-sm px-4 py-2 rounded-lg border transition ${showNewCard
      ? 'bg-indigo-600 text-white border-indigo-600'
      : 'bg-white text-indigo-600 border-indigo-600 hover:bg-indigo-50'
      }`}
    >
     Yeni Kart Bilgileri Gir
    </button>
   </div>
  );
 }

 return (
  <div className="mb-4">
   <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-semibold text-gray-700">Kayıtlı Kartlarım</h3>
    <button
     onClick={handleNewCardClick}
     className={`text-sm px-4 py-2 rounded-lg border transition cursor-pointer ${showNewCard
      ? 'bg-indigo-600 text-white border-indigo-600'
      : 'bg-white text-indigo-600 border-indigo-600 hover:bg-indigo-50'
      }`}
    >
     {showNewCard ? 'Kayıtlı Kart Seç' : 'Yeni Kart Bilgileri Gir'}
    </button>
   </div>

   {!showNewCard && (
    <div className="space-y-2">
     {cards.map((card) => {
      const cardId = card._id?.toString ? card._id.toString() : String(card._id || '');
      const isSelected = selectedCardId === cardId;
      const cardType = getCardType(card);

      return (
       <div
        key={cardId}
        onClick={() => handleCardSelect(card)}
        className={`border rounded-lg p-3 cursor-pointer transition ${isSelected
         ? 'border-indigo-600 bg-indigo-50'
         : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
         }`}
       >
        <div className="flex items-center gap-3">
         <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cardType === 'Troy' ? 'bg-gray-600' :
          cardType === 'Visa' ? 'bg-blue-600' :
           cardType === 'Mastercard' ? 'bg-orange-100' :
            cardType === 'Amex' ? 'bg-cyan-600' :
             'bg-indigo-600'
          }`}>
          {renderCardIcon(cardType)}
         </div>
         <div className="flex-1">
          <div className="flex items-center gap-2">
           <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${getCardTypeStyle(cardType)}`}>
            {cardType}
           </span>
           {card.isDefault && (
            <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
             <FaStar size={8} />
             Varsayılan
            </span>
           )}
          </div>
          <p className="text-sm text-gray-700 font-medium mt-1">
           {card.cardHolder}
          </p>
          <p className="text-xs text-gray-500">
           {cardType === "Amex" ? `•••• •••••• ${card.cardNumberLast4 || ""}` : `•••• •••• •••• ${card.cardNumberLast4 || ""}`}
          </p>
         </div>
         {isSelected && (
          <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
           <div className="w-2 h-2 rounded-full bg-white"></div>
          </div>
         )}
        </div>
       </div>
      );
     })}
    </div>
   )}
  </div>
 );
}
