"use client";
import { HiLightningBolt, HiShieldCheck, HiShoppingBag } from "react-icons/hi";
import { MdCreditCard } from "react-icons/md";

export default function FeaturesSection() {
 const features = [
  {
   icon: HiShoppingBag,
   title: "Geniş Ürün Yelpazesi",
   bgColor: "bg-blue-100",
   iconColor: "text-blue-600",
  },
  {
   icon: MdCreditCard,
   title: "Taksit Seçenekleri",
   bgColor: "bg-purple-100",
   iconColor: "text-purple-600",
  },
  {
   icon: HiLightningBolt,
   title: "Nakliye ve Montaj Hizmeti",
   bgColor: "bg-green-100",
   iconColor: "text-green-600",
  },
  {
   icon: HiShieldCheck,
   title: "Güvenli Ödeme",
   bgColor: "bg-orange-100",
   iconColor: "text-orange-600",
  },
 ];

 return (
  <section className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12">
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
    {features.map((feature) => {
     const Icon = feature.icon;
     return (
      <div key={feature.title} className="bg-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-2.5 sm:gap-3 md:gap-4"
      >
       <div className={`${feature.bgColor} p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-lg shrink-0`}>
        <Icon className={`${feature.iconColor} w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7`} />
       </div>
       <h3 className="font-bold text-sm sm:text-base md:text-lg mb-0.5 sm:mb-1">{feature.title}</h3>
      </div>
     );
    })}
   </div>
  </section>
 );
}
