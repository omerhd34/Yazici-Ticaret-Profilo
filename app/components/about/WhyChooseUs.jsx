"use client";
import { HiStar, HiUsers, HiShoppingBag, HiCube, HiPhone, HiShieldCheck } from "react-icons/hi";
import { FaTurkishLiraSign } from "react-icons/fa6";

export default function WhyChooseUs() {
 const features = [
  {
   icon: HiUsers,
   title: "Uzman Kadro",
   description: "Yılların deneyimi ve bilgi birikimiyle donatılmış uzman ekibimiz, ihtiyaçlarınıza en uygun çözümleri sunmak için her zaman yanınızdadır. Profesyonel danışmanlık hizmeti ile doğru ürün seçiminde size rehberlik ediyoruz.",
   gradient: "from-blue-500 to-blue-700",
  },
  {
   icon: FaTurkishLiraSign,
   title: "Uygun Fiyat",
   description: "Doğrudan üretici ve distribütörlerle kurduğumuz güçlü iş ortaklıkları sayesinde kaliteli ürünleri en uygun fiyatlarla sunuyoruz. Size en iyi fiyat garantisi veriyoruz ve bütçenize uygun ödeme seçenekleri sağlıyoruz.",
   gradient: "from-green-500 to-green-700",
  },
  {
   icon: HiShoppingBag,
   title: "Geniş Ürün Yelpazesi",
   description: "Beyaz eşyadan elektroniğe, ankastre ürünlerden klimalara kadar geniş bir ürün yelpazemiz bulunmaktadır. Binlerce ürün seçeneği ile evinizin her köşesi için aradığınız çözümü tek bir yerden bulabilirsiniz.",
   gradient: "from-purple-500 to-purple-700",
  },
  {
   icon: HiCube,
   title: "Güvenli Paketleme",
   description: "Ürünleriniz özel ambalaj malzemeleri ve özenli paketleme teknikleriyle korunmaktadır. Hasar görmemesi için her detaya dikkat ediyoruz ve kapınıza kadar güvenle ulaşmasını garanti ediyoruz.",
   gradient: "from-pink-500 to-pink-700",
  },
  {
   icon: HiPhone,
   title: "Hızlı Geri Dönüş",
   description: "Müşteri memnuniyeti odaklı hizmet anlayışımızla sorularınıza ve taleplerinize en kısa sürede geri dönüş yapıyoruz. Sipariş takibi, ürün bilgileri ve teknik destek konularında yanınızdayız.",
   gradient: "from-yellow-500 to-yellow-700",
  },
  {
   icon: HiShieldCheck,
   title: "Güvenli Ödeme",
   description: "Kart ile Ödeme (3D Secure) seçeneğimizle güvenli ödeme yapabilirsiniz. Banka veya kredi kartınızla 3D Secure ile ödeme yaparak kartınızın güvenliğini sağlayın. Ödeme işlemi bankanız tarafından doğrulanacak ve SMS kodu ile onaylanacaktır.",
   gradient: "from-orange-500 to-orange-700",
  },
 ];

 return (
  <section>
   <div className="flex items-center gap-3 mb-6">
    <HiStar className="text-indigo-600" size={28} />
    <h2 className="text-2xl font-bold text-gray-900">Neden Yazıcı Ticaret ?</h2>
   </div>
   <div className="space-y-4">
    {features.map((feature) => {
     const IconComponent = feature.icon;
     return (
      <div key={feature.title} className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
       <div className={`shrink-0 w-8 h-8 bg-linear-to-r ${feature.gradient} text-white rounded-full flex items-center justify-center`}>
        <IconComponent size={18} />
       </div>
       <div>
        <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
        <p className="text-gray-700 text-sm">{feature.description}</p>
       </div>
      </div>
     );
    })}
   </div>
  </section>
 );
}
