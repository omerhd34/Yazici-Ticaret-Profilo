"use client";
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/axios";
import { HiShoppingBag, HiClock, HiCheckCircle, HiXCircle, HiInformationCircle, HiPlus, HiTrash, HiChevronDown, HiChevronUp } from "react-icons/hi";
import ProductRequestModal from "@/app/components/product/ProductRequestModal";
import Toast from "@/app/components/ui/Toast";

export default function ProductRequestsTab() {
 const [requests, setRequests] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showRequestModal, setShowRequestModal] = useState(false);
 const [cancelConfirm, setCancelConfirm] = useState({ show: false, requestId: null });
 const [toast, setToast] = useState({ show: false, message: "", type: "success" });
 const [showAllRequests, setShowAllRequests] = useState(false);

 const fetchRequests = useCallback(async () => {
  try {
   setLoading(true);
   const res = await axiosInstance.get("/api/product-requests");

   const data = res.data;

   if (data.success) {
    setRequests(data.requests || []);
   }
  } catch (error) {
  } finally {
   setLoading(false);
  }
 }, []);

 useEffect(() => {
  fetchRequests();
 }, [fetchRequests]);

 const handleRequestSubmitted = () => {
  setShowRequestModal(false);
  fetchRequests();
 };

 const handleCancelRequest = async () => {
  if (!cancelConfirm.requestId) {
   setToast({ show: true, message: "İptal edilecek istek bulunamadı.", type: "error" });
   return;
  }

  try {
   let requestId = cancelConfirm.requestId;
   if (typeof requestId === 'object' && requestId.toString) {
    requestId = requestId.toString();
   } else if (typeof requestId !== 'string') {
    requestId = String(requestId);
   }

   const res = await axiosInstance.delete(`/api/product-requests/${requestId}`);

   const data = res.data;

   if (!data.success) {
    const errorMessage = data.message || `İstek iptal edilemedi`;
    setToast({ show: true, message: errorMessage, type: "error" });
    return;
   }

   setToast({ show: true, message: "İstek başarıyla iptal edildi!", type: "success" });
   setCancelConfirm({ show: false, requestId: null });
   fetchRequests();
  } catch (error) {
   setToast({ show: true, message: `Bir hata oluştu: ${error.message}`, type: "error" });
  }
 };

 const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
   day: "2-digit",
   month: "2-digit",
   year: "numeric",
   hour: "2-digit",
   minute: "2-digit",
  });
 };

 const getStatusIcon = (status) => {
  switch (status) {
   case 'Beklemede':
    return <HiClock className="text-amber-500" size={20} />;
   case 'Onaylandı':
    return <HiCheckCircle className="text-green-500" size={20} />;
   case 'Reddedildi':
    return <HiXCircle className="text-red-500" size={20} />;
   case 'İptal Edildi':
    return <HiXCircle className="text-gray-500" size={20} />;
   default:
    return <HiClock className="text-gray-500" size={20} />;
  }
 };

 const getStatusColor = (status) => {
  const colors = {
   'Beklemede': 'bg-amber-100 text-amber-700 border-amber-300',
   'Onaylandı': 'bg-green-100 text-green-700 border-green-300',
   'Reddedildi': 'bg-red-100 text-red-700 border-red-300',
   'İptal Edildi': 'bg-gray-100 text-gray-700 border-gray-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
 };

 if (loading) {
  return (
   <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="text-center py-12">
     <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
     <p className="text-sm text-gray-500">Yükleniyor...</p>
    </div>
   </div>
  );
 }

 return (
  <div className="bg-white rounded-xl shadow-sm p-6">
   <Toast toast={toast} setToast={setToast} />
   <div className="flex items-center justify-between mb-6">
    <div>
     <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
      <HiShoppingBag className="text-indigo-600" size={28} />
      Ürün İsteklerim
     </h2>
     <p className="text-sm text-gray-500 mt-1">Gönderdiğiniz ürün isteklerini takip edin. İsteğiniz onaylanırsa yakın zamanda ürün şubelerimize gelecektir. İptal edilirse ürün bulunmamaktadır.</p>
    </div>
    <button
     onClick={() => setShowRequestModal(true)}
     className="px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg inline-flex items-center justify-center gap-2 cursor-pointer"
    >
     <HiPlus size={20} className="shrink-0" />
     <span className="leading-none">Yeni İstek</span>
    </button>
   </div>

   {requests.length === 0 ? (
    <div className="text-center py-12">
     <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <HiShoppingBag size={40} className="text-gray-400" />
     </div>
     <p className="text-lg font-semibold text-gray-700 mb-2">Henüz ürün isteğiniz yok</p>
     <p className="text-sm text-gray-500 mb-4">Ürün isteğinde bulunmak için aşağıdaki butona tıklayın.</p>
     <button
      onClick={() => setShowRequestModal(true)}
      className="px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg inline-flex items-center justify-center gap-2 mx-auto cursor-pointer"
     >
      <HiPlus size={20} className="shrink-0" />
      <span className="leading-none">Yeni Ürün İsteği</span>
     </button>
    </div>
   ) : (
    <div className="space-y-4">
     {(showAllRequests ? requests : requests.slice(0, 5)).map((request) => (
      <div
       key={request._id}
       className="border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-md transition-all overflow-hidden"
      >
       <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
         <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h3 className="text-lg font-bold text-gray-900 wrap-break-word">{request.productName}</h3>
          <div className="flex items-center gap-2">
           {getStatusIcon(request.status)}
           <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${getStatusColor(request.status)}`}>
            {request.status}
           </span>
          </div>
         </div>
         {request.brand && (
          <p className="text-sm text-gray-600 mb-1 wrap-break-word">
           <span className="font-semibold">Marka:</span> {request.brand}
           {request.model && ` - Model: ${request.model}`}
          </p>
         )}
         {request.productDescription && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-3 wrap-break-word overflow-hidden">{request.productDescription}</p>
         )}
        </div>
        <div className="text-right shrink-0">
         <p className="text-xs text-gray-500 flex items-center gap-1">
          <HiClock size={14} />
          {formatDate(request.createdAt)}
         </p>
        </div>
       </div>

       {/* Durum Bilgilendirme Mesajı */}
       {request.status === 'Onaylandı' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
         <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
           <HiInformationCircle className="text-green-600 shrink-0 mt-0.5" size={18} />
           <div className="text-sm text-green-800 font-medium leading-relaxed">
            <p className="font-semibold mb-1">İsteğiniz onaylandı!</p>
            <p>Ürün en kısa sürede şubelerimize ulaşacak ve sitemizde yayınlanacaktır.</p>
           </div>
          </div>
         </div>
        </div>
       )}

       {request.status === 'İptal Edildi' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
         <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
           <HiInformationCircle className="text-gray-600 shrink-0 mt-0.5" size={18} />
           <div className="text-sm text-gray-700 font-medium leading-relaxed">
            <p className="font-semibold mb-1">İsteğiniz iptal edildi.</p>
            <p>Ürün tedarik edilemediği için isteğiniz sonlandırılmıştır.</p>
           </div>
          </div>
         </div>
        </div>
       )}

       {request.status === 'Reddedildi' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
         <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
           <HiInformationCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
           <div className="text-sm text-red-800 font-medium leading-relaxed">
            <p className="font-semibold mb-1">İsteğiniz reddedildi.</p>
            <p>Bu ürün şu anda temin edilememektedir.</p>
           </div>
          </div>
         </div>
        </div>
       )}

       {request.adminResponse && (
        <div className="mt-4 pt-4 border-t border-gray-200">
         <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-2">
           <HiInformationCircle className="text-blue-600 shrink-0 mt-0.5" size={18} />
           <h4 className="font-semibold text-blue-900">Admin Cevabı</h4>
          </div>
          <p className="text-sm text-blue-800 whitespace-pre-wrap wrap-break-word overflow-hidden">{request.adminResponse}</p>
          {request.respondedAt && (
           <p className="text-xs text-blue-600 mt-2">
            Cevap Tarihi: {formatDate(request.respondedAt)}
           </p>
          )}
         </div>
        </div>
       )}

       {request.status === 'Beklemede' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
         <button
          onClick={() => {
           const requestId = request._id?.toString ? request._id.toString() : request._id;
           setCancelConfirm({ show: true, requestId });
          }}
          className="px-4 py-2 bg-red-50 text-red-700 border-2 border-red-200 rounded-lg hover:bg-red-100 transition font-semibold flex items-center gap-2 cursor-pointer"
         >
          <HiTrash size={18} />
          İsteği İptal Et
         </button>
        </div>
       )}
      </div>
     ))}
     {requests.length > 5 ? (
      <div className="pt-2 flex justify-center">
       {!showAllRequests ? (
        <button
         type="button"
         onClick={() => setShowAllRequests(true)}
         className="px-5 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition inline-flex items-center gap-2 cursor-pointer"
        >
         Diğerleri <HiChevronDown className="w-5 h-5" />
        </button>
       ) : (
        <button
         type="button"
         onClick={() => setShowAllRequests(false)}
         className="px-5 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition inline-flex items-center gap-2 cursor-pointer"
        >
         Son 5 <HiChevronUp className="w-5 h-5" />
        </button>
       )}
      </div>
     ) : null}
    </div>
   )}

   {/* İptal Onay Modal */}
   {cancelConfirm.show && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">İsteği İptal Et</h3>
      <p className="text-gray-600 mb-6">
       Bu ürün isteğini iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
      </p>
      <div className="flex gap-4">
       <button
        onClick={() => setCancelConfirm({ show: false, requestId: null })}
        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition cursor-pointer"
       >
        Vazgeç
       </button>
       <button
        onClick={handleCancelRequest}
        className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition cursor-pointer"
       >
        İptal Et
       </button>
      </div>
     </div>
    </div>
   )}

   <ProductRequestModal
    show={showRequestModal}
    onClose={() => setShowRequestModal(false)}
    onSuccess={handleRequestSubmitted}
   />
  </div>
 );
}

