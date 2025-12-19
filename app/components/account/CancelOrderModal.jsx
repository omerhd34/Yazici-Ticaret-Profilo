"use client";
import { useState } from "react";

export default function CancelOrderModal({ show, orderId, onConfirm, onCancel }) {
 const [loading, setLoading] = useState(false);

 if (!show) return null;

 const handleConfirm = async () => {
  if (loading) return;
  setLoading(true);
  try {
   await onConfirm(orderId);
  } finally {
   setLoading(false);
  }
 };

 return (
  <div
   className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4"
   onClick={onCancel}
  >
   <div
    className="bg-white rounded-xl shadow-2xl max-w-md w-full"
    onClick={(e) => e.stopPropagation()}
   >
    <div className="p-6">
     <h3 className="text-lg font-bold text-gray-900 mb-2">Siparişi İptal Et</h3>
     <p className="text-sm text-gray-600 mb-6">
      Siparişi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
     </p>
     <div className="flex justify-end gap-3">
      <button
       onClick={onCancel}
       disabled={loading}
       className="px-5 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
       Vazgeç
      </button>
      <button
       onClick={handleConfirm}
       disabled={loading}
       className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed relative"
      >
       {loading ? (
        <>
         <span className="opacity-0">Evet, İptal Et</span>
         <span className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
         </span>
        </>
       ) : (
        "Evet, İptal Et"
       )}
      </button>
     </div>
    </div>
   </div>
  </div>
 );
}
