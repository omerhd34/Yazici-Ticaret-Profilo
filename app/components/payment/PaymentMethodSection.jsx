"use client";
import { FaCreditCard } from "react-icons/fa";
import { MdWarning, MdPayment } from "react-icons/md";

export default function PaymentMethodSection({
 paymentMethod,
 onPaymentMethodChange,
}) {
 return (
  <div className="bg-white rounded-xl shadow-sm p-6">
   <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
    <MdPayment className="text-indigo-600" size={22} />
    Ödeme Yöntemi
   </h2>

   <div className="space-y-4">
    <div className="border rounded-xl p-4 border-indigo-300 bg-indigo-50">
     <label className="flex items-center gap-2 font-semibold text-gray-900 cursor-pointer">
      <input
       type="radio"
       name="payment"
       checked={paymentMethod.type === "3dsecure"}
       onChange={() => onPaymentMethodChange({ type: "3dsecure" })}
      />
      <FaCreditCard className="text-indigo-600" size={20} />
      Kart ile Ödeme (3D Secure)
     </label>
     <div className="mt-4 space-y-2">
      <p className="text-sm text-gray-600">
       Banka veya kredi kartı bilgilerinizi girerek <b>3D Secure</b> doğrulaması ile güvenli bir şekilde ödeme yapabilirsiniz. Ödeme işlemi bankanızın güvenlik sayfasında doğrulanacaktır.
      </p>
      <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
       <MdWarning className="text-green-600 shrink-0 mt-0.5" size={20} />
       <p className="text-sm text-green-700 font-medium leading-relaxed">
        <b>3D Secure</b> ile ödeme yaparak kartınızın güvenliğini sağlayın. Ödeme işlemi bankanız tarafından doğrulanacak ve SMS kodu ile onaylanacaktır.
       </p>
      </div>
     </div>
    </div>
   </div>
  </div>
 );
}
