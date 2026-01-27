"use client";
import Link from "next/link";
import CartTrustBadges from "./CartTrustBadges";

export default function CartOrderSummary({
 cartTotal,
 shippingCost,
 total,
 canCheckout,
 minOrderTotal,
 onCheckout,
}) {
 return (
  <div className="lg:col-span-1">
   <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
    <h3 className="font-bold text-lg mb-4">Sipariş Özeti</h3>

    <div className="space-y-3 mb-4 pb-4 border-b">
     <div className="flex justify-between text-sm">
      <span className="text-gray-600">Ürünler Toplamı</span>
      <span className="font-semibold">{cartTotal.toFixed(2)} ₺</span>
     </div>
     <div className="flex justify-between text-sm">
      <span className="text-gray-600">Kargo</span>
      <span className="font-semibold">
       {shippingCost === 0 ? (
        <span className="text-green-600">Ücretsiz</span>
       ) : (
        `${shippingCost.toFixed(2)} ₺`
       )}
      </span>
     </div>
    </div>

    {shippingCost > 0 && (
     <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
      <p className="text-xs text-amber-800">
       <span className="font-semibold">
        {(500 - cartTotal).toFixed(2)} ₺
       </span>{" "}
       daha alışveriş yaparak <span className="font-semibold">ücretsiz kargo</span>
       {" "}kazanın!
      </p>
     </div>
    )}

    <div className="flex justify-between mb-6 pb-4 border-b">
     <span className="font-bold text-lg">Toplam</span>
     <span className="font-black text-xl text-indigo-600">
      {total.toFixed(2)} ₺
     </span>
    </div>

    <button
     type="button"
     onClick={onCheckout}
     disabled={!canCheckout}
     className={`w-full py-4 rounded-lg font-bold text-lg transition mb-3 ${canCheckout
      ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
      : "bg-gray-300 text-gray-600 cursor-not-allowed"
      }`}
    >
     Sepeti Onayla
    </button>
    {!canCheckout && (
     <p className="text-xs text-gray-600 mb-3">
      Sepeti onaylamak için ürünler toplamı en az{" "}
      <span className="font-semibold">{minOrderTotal.toFixed(2)} ₺</span> olmalıdır.
     </p>
    )}

    <Link
     href="/"
     className="block text-center text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
    >
     Alışverişe Devam Et
    </Link>

    <CartTrustBadges />
   </div>
  </div>
 );
}
