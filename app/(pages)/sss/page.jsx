"use client";
import Link from "next/link";
import { useState } from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";

export default function SSSPage() {
 const [openIndex, setOpenIndex] = useState(null);

 const faqs = [
  {
   question: "Sipariş Bilgisi",
   answer: "Siparişlerinizi takip etmek ve detaylı bilgilere ulaşmak için üye olmanızı öneriyoruz. Üye olarak giriş yaptığınızda, hesabınız üzerinden tüm siparişlerinizi kolayca görüntüleyebilir, sipariş durumlarını takip edebilir ve geçmiş siparişlerinize erişebilirsiniz. Üye olmadan da sipariş takibi yapabilirsiniz, ancak üye olursanız siparişleriniz otomatik olarak hesabınıza kaydedilir ve daha detaylı bilgilere ulaşabilirsiniz. Ayrıca, üye hesabınızdan sipariş geçmişinizi inceleyebilir, fatura bilgilerinize erişebilir ve gelecekteki alışverişlerinizde daha hızlı sipariş verebilirsiniz. Üye olmak tamamen ücretsizdir ve size birçok avantaj sağlar."
  },
  {
   question: "İade işlemi nasıl yapılır?",
   answer: "Ürünü aldıktan sonra 14 gün içinde iade edebilirsiniz. İade işlemi için öncelikle müşteri hizmetlerimizle iletişime geçmeniz gerekmektedir. İade talebiniz onaylandıktan sonra, ürünü orijinal ambalajında, kullanılmamış ve hasarsız şekilde göndermeniz gerekmektedir. İade kargo ücreti müşteriye aittir. Ürün kontrol edildikten sonra, ödeme yaptığınız yönteme göre iade işleminiz gerçekleştirilecektir. İade süreci genellikle 3-5 iş günü içinde tamamlanmaktadır."
  },
  {
   question: "Garanti",
   answer: "Tüm ürünlerimiz üretici garantisi kapsamındadır. Garanti süreleri ürün kategorisine göre değişiklik göstermektedir. Beyaz eşya ürünlerinde genellikle 2 yıl, küçük ev aletlerinde 1-2 yıl garanti süresi bulunmaktadır. Garanti kapsamındaki arızalar için ücretsiz servis hizmeti sağlanmaktadır. Garanti belgelerinizi mutlaka saklamanızı öneriyoruz. Garanti kapsamı dışındaki durumlar için ücretli servis hizmeti sunulmaktadır. Detaylı bilgi için müşteri hizmetlerimizle iletişime geçebilirsiniz."
  },
  {
   question: "Ödeme ve Fatura İşlemleri",
   answer: "Siparişlerinizde Kart ile Ödeme (3D Secure) seçeneğini kullanabilirsiniz. Banka veya kredi kartınızla 3D Secure ile ödeme yaparak kartınızın güvenliğini sağlayın. Ödeme işlemi bankanız tarafından doğrulanacak ve SMS kodu ile onaylanacaktır. Fatura işlemleri için fatura bilgilerinizi sipariş sırasında belirtmeniz gerekmektedir. E-fatura ve kağıt fatura seçenekleri mevcuttur. Faturalarınız siparişinizle birlikte gönderilmektedir. Fatura düzenleme talepleriniz için müşteri hizmetlerimizle iletişime geçebilirsiniz."
  },
  {
   question: "Kargo ve Teslimat",
   answer: "Tüm Türkiye geneline nakliye ve montaj hizmeti sunuyoruz. Siparişleriniz güvenilir nakliye firmaları aracılığıyla adresinize teslim edilmekte ve montaj hizmeti sağlanmaktadır. Bursa iline kargo ücretsizdir. Teslimat süresi genellikle 1-5 iş günü arasında değişmektedir. Teslimat sırasında ürünü kontrol etmenizi öneriyoruz. Teslimat adresinizde bulunmamanız durumunda, nakliye firması ile iletişime geçerek teslimatı yeniden planlayabilirsiniz. Acil teslimat talepleriniz için müşteri hizmetlerimizle iletişime geçebilirsiniz."
  },
  {
   question: "Aldığım ürün paketten eksik veya hasarlı çıktı, ne yapmalıyım?",
   answer: "Ürününüz paketten eksik veya hasarlı çıktıysa, lütfen derhal müşteri hizmetlerimizle iletişime geçin. Hasarlı veya eksik ürün durumunda fotoğraf çekmenizi ve bize göndermenizi rica ediyoruz. Durumunuz incelendikten sonra, hasarlı ürün için ücretsiz değişim veya iade işlemi gerçekleştirilecektir. Eksik parçalar için eksik ürünler gönderilecektir. Bu durumlarda ek bir ücret talep edilmemektedir. Müşteri memnuniyeti bizim için önceliklidir."
  },
  {
   question: "Sipariş ettiğim üründen farklı bir ürün geldi, ne yapmalıyım?",
   answer: "Yanlış ürün teslim edilmesi durumunda, lütfen ürünü kullanmadan müşteri hizmetlerimizle iletişime geçin. Yanlış gönderilen ürün için ücretsiz değişim işlemi gerçekleştirilecektir. Doğru ürün en kısa sürede adresinize gönderilecektir. Yanlış gönderilen ürünü iade etmeniz gerekmektedir ve iade kargo ücreti tarafımızca karşılanacaktır. Bu durumdan dolayı yaşadığınız mağduriyet için özür dileriz ve en hızlı şekilde çözüm sağlayacağız."
  },
  {
   question: "Ürünleriniz hangi kargo firması tarafından teslim edilmektedir?",
   answer: "Siparişleriniz bölgenize ve ürün özelliklerine göre farklı kargo firmaları aracılığıyla teslim edilmektedir. Genellikle Yurtiçi Kargo, Aras Kargo, MNG Kargo ve Sürat Kargo gibi güvenilir kargo firmaları ile çalışmaktayız. Kargo firması seçimi, teslimat adresinize ve ürününüzün özelliklerine göre otomatik olarak yapılmaktadır. Belirli bir kargo firması tercihiniz varsa, sipariş sırasında veya sipariş sonrası müşteri hizmetlerimizle iletişime geçerek talebinizi iletebilirsiniz."
  },
  {
   question: "Dünyanın her yerinden sipariş verebilir miyim?",
   answer: "Şu anda sadece Türkiye içi teslimat yapmaktayız. Yurt dışı teslimat hizmetimiz bulunmamaktadır. Türkiye'nin tüm şehirlerine ve ilçelerine kargo ile teslimat yapabilmekteyiz. Yurt dışı teslimat talepleriniz için lütfen müşteri hizmetlerimizle iletişime geçin. Gelecekte yurt dışı teslimat hizmeti eklemeyi planlamaktayız. Bu konudaki güncellemeleri web sitemizden takip edebilirsiniz."
  },
  {
   question: "Siparişimin kargoya verildiğini nasıl anlayacağım?",
   answer: "Siparişiniz kargoya verildiğinde, kayıtlı e-posta adresinize ve telefon numaranıza bilgilendirme mesajı gönderilmektedir. Mesajda kargo takip numaranız ve kargo firması bilgisi yer almaktadır. Ayrıca, üye iseniz hesabınızdan sipariş durumunuzu takip edebilirsiniz. Kargo takip numaranız ile kargo firmasının web sitesinden veya telefon hattından siparişinizin durumunu öğrenebilirsiniz. Kargo bilgilendirmesi genellikle siparişinizin hazırlanmasından sonraki 1-5 iş günü içinde gönderilmektedir."
  },
  {
   question: "Siparişimi nasıl takip edebilirim?",
   answer: "Sipariş takibi için üst menüden 'Sipariş Takibi' bölümüne gidebilir veya hesabınızdan siparişlerinizi görüntüleyebilirsiniz. Sipariş numaranızı girerek anlık durumunu öğrenebilirsiniz."
  },
  {
   question: "Nakliye ve montaj hizmeti nasıl çalışır?",
   answer: "Tüm Türkiye geneline nakliye ve montaj hizmeti sunuyoruz. Siparişleriniz güvenilir nakliye firmaları aracılığıyla adresinize teslim edilmekte ve montaj hizmeti sağlanmaktadır. Teslimat süresi genellikle 2-5 iş günü arasındadır. Detaylı bilgi için müşteri hizmetlerimizle iletişime geçebilirsiniz."
  },
  {
   question: "Ürün iade edebilir miyim?",
   answer: "Evet, ürünlerinizi 14 gün içinde iade edebilirsiniz. Ürünün kullanılmamış, etiketli ve orijinal ambalajında olması gerekmektedir. İade işlemleri için 'İade ve Değişim' sayfasından başvuru yapabilirsiniz."
  },
  {
   question: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
   answer: "Kart ile Ödeme (3D Secure) seçeneğini kabul ediyoruz. Banka veya kredi kartınızla 3D Secure ile ödeme yaparak kartınızın güvenliğini sağlayın. Ödeme işlemi bankanız tarafından doğrulanacak ve SMS kodu ile onaylanacaktır."
  },
  {
   question: "Ürün stokta yoksa ne yapabilirim?",
   answer: "Stokta olmayan ürünler için 'Stokta Yok' butonu görüntülenir. Bu ürünleri favorilerinize ekleyerek stok geldiğinde bildirim alabilirsiniz. Stok durumu hakkında bilgi almak için müşteri hizmetlerimizle iletişime geçebilirsiniz."
  },
  {
   question: "Hesabımı nasıl oluşturabilirim?",
   answer: "Sağ üst köşedeki 'Hesabım' butonuna tıklayarak kayıt olabilirsiniz. E-posta adresiniz ve şifrenizle kolayca hesap oluşturabilir, siparişlerinizi takip edebilir ve favori ürünlerinizi kaydedebilirsiniz."
  },
  {
   question: "Şifremi unuttum, ne yapmalıyım?",
   answer: "Giriş sayfasında 'Şifremi Unuttum' linkine tıklayarak e-posta adresinize şifre sıfırlama bağlantısı gönderebilirsiniz. E-postanızı kontrol ederek yeni şifrenizi oluşturabilirsiniz."
  },
  {
   question: "Kampanyalar ve indirimler hakkında nasıl bilgi alabilirim?",
   answer: "Kampanyalar ve indirimler hakkında bilgi almak için e-bültenimize abone olabilirsiniz. Ayrıca 'İndirimler' kategorisinden güncel indirimli ürünleri görüntüleyebilirsiniz."
  },
  {
   question: "Müşteri hizmetlerine nasıl ulaşabilirim?",
   answer: "Müşteri hizmetlerimize 'Destek' sayfasından, e-posta veya telefon ile ulaşabilirsiniz. Çalışma saatlerimiz hafta içi 09:00-18:00 arasındadır. Size en kısa sürede dönüş yapacağız."
  }
 ];

 const toggleFAQ = (index) => {
  setOpenIndex(openIndex === index ? null : index);
 };

 return (
  <div className="min-h-screen bg-gray-50 py-12">
   <div className="container mx-auto px-4">
    {/* Header */}
    <div className="text-center mb-12">
     <h1 className="text-4xl font-black text-gray-900 mb-4">
      Sık Sorulan Sorular
     </h1>
     <p className="text-gray-600 text-lg max-w-2xl mx-auto">
      Merak ettiğiniz soruların yanıtlarını burada bulabilirsiniz. Aradığınızı bulamazsanız, müşteri hizmetlerimizle iletişime geçebilirsiniz.
     </p>
    </div>

    {/* FAQ List */}
    <div className="max-w-5xl mx-auto">
     <div className="space-y-4 ">
      {faqs.map((faq, index) => (
       <div
        key={index}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
       >
        <button
         onClick={() => toggleFAQ(index)}
         className="w-full px-6 py-5 flex items-center justify-between text-left rounded-xl focus:bg-blue-200 hover:bg-blue-200 transition-colors duration-500 ease-in-out cursor-pointer"
        >
         <span className="font-semibold text-gray-800 text-lg pr-4 cursor-pointer">
          {faq.question}
         </span>
         {openIndex === index ? (
          <HiChevronUp size={24} className="text-indigo-600 shrink-0 cursor-pointer" />
         ) : (
          <HiChevronDown size={24} className="text-gray-400 shrink-0 cursor-pointer" />
         )}
        </button>
        {openIndex === index && (
         <div className="px-6 pb-5 pt-0">
          <div className="pt-4 border-t border-gray-100">
           <p className="text-gray-600 leading-relaxed">
            {faq.answer}
           </p>
          </div>
         </div>
        )}
       </div>
      ))}
     </div>

     {/* Contact Section */}
     <div className="mt-12 bg-linear-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white text-center">
      <h2 className="text-2xl font-bold mb-3">
       Sorunuz mu var?
      </h2>
      <p className="text-indigo-100 mb-6">
       Aradığınızı bulamadınız mı? Müşteri hizmetlerimizle iletişime geçin, size yardımcı olalım.
      </p>
      <Link
       href="/destek"
       className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-indigo-50 transition"
      >
       Destek Sayfasına Git
      </Link>
     </div>
    </div>
   </div>
  </div>
 );
}
