"use client";
import { MdInfo, MdCheckCircle } from "react-icons/md";

export default function ImportantNotes() {
 return (
  <div className="max-w-5xl mx-auto mt-8">
   <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
     <MdInfo className="text-yellow-600" size={24} />
     Önemli Notlar
    </h3>
    <ul className="space-y-2 text-sm text-gray-700">
     <li className="flex items-start gap-2">
      <MdCheckCircle className="text-yellow-600 shrink-0 mt-0.5" size={18} />
      <span>İade ve değişim işlemleri için ürünün orijinal halinde olması gerekmektedir.</span>
     </li>
     <li className="flex items-start gap-2">
      <MdCheckCircle className="text-yellow-600 shrink-0 mt-0.5" size={18} />
      <span>İade/değişim talebiniz onaylandıktan sonra kargo bilgileri size iletilecektir.</span>
     </li>
     <li className="flex items-start gap-2">
      <MdCheckCircle className="text-yellow-600 shrink-0 mt-0.5" size={18} />
      <span>Özel üretim veya kişiselleştirilmiş ürünlerde iade/değişim yapılamaz.</span>
     </li>
     <li className="flex items-start gap-2">
      <MdCheckCircle className="text-yellow-600 shrink-0 mt-0.5" size={18} />
      <span>İndirimli ürünlerde iade/değişim koşulları farklılık gösterebilir.</span>
     </li>
    </ul>
   </div>
  </div>
 );
}
