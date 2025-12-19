"use client";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";

export default function CancelReturnModal({ show, orderId, onConfirm, onCancel }) {
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
     <h3 className="text-lg font-bold text-gray-900 mb-2">İade Talebini İptal Et</h3>
     <p className="text-sm text-gray-600 mb-6">
      İade talebinizi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
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
          <FaSpinner className="animate-spin h-5 w-5 text-white" />
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
