"use client";
import axiosInstance from "@/lib/axios";
import { HiPlus } from "react-icons/hi";
import { FaCreditCard } from "react-icons/fa";
import CardCard from "./CardCard";

export default function CardsTab({ cards, onAddNew, onEdit, onDelete, showToast, fetchCards }) {
 return (
  <div className="bg-white rounded-xl shadow-sm p-6">
   <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold">Kayıtlı Kartlarım</h2>
    <button
     onClick={onAddNew}
     className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition cursor-pointer"
    >
     <HiPlus size={20} />
     Yeni Kart Ekle
    </button>
   </div>

   {cards.length === 0 ? (
    <div className="text-center py-12">
     <FaCreditCard size={64} className="mx-auto text-gray-300 mb-4" />
     <p className="text-gray-500 text-lg mb-4">Henüz kayıtlı kartınız yok</p>
     <button
      onClick={onAddNew}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition cursor-pointer"
     >
      İlk Kartınızı Ekleyin
     </button>
    </div>
   ) : (
    <div className="grid md:grid-cols-2 gap-4">
     {cards.map((card, index) => (
      <CardCard
       key={card._id || card.cardNumberLast4 || `card-${index}`}
       card={card}
       onEdit={onEdit}
       onDelete={onDelete}
       onSetDefault={async () => {
        try {
         const cardId = card._id?.toString ? card._id.toString() : String(card._id || '');
         if (!cardId) {
          showToast("Kart ID bulunamadı!", "error");
          return;
         }
         const res = await axiosInstance.put(`/api/user/cards/${cardId}`, {
          title: card.title,
          cardHolder: card.cardHolder,
          month: card.month,
          year: card.year,
          isDefault: true,
         });
         const data = res.data;
         if (data.success) {
          showToast("Varsayılan kart güncellendi!", "success");
          await fetchCards();
         } else {
          showToast(data.message || "İşlem başarısız!", "error");
         }
        } catch (error) {
         const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Bir hata oluştu!";
         showToast(errorMessage, "error");
        }
       }}
      />
     ))}
    </div>
   )}
  </div>
 );
}
