"use client";
import Link from "next/link";
import { HiCheckCircle, HiXCircle, HiShieldCheck, HiInformationCircle, HiScale, HiTruck, HiCube } from "react-icons/hi";
import TermsHeader from "@/app/components/policy/TermsHeader";
import TermsIntroduction from "@/app/components/policy/TermsIntroduction";
import PolicySection from "@/app/components/policy/PolicySection";

export default function KullanimKosullariPage() {
 return (
  <div className="min-h-screen bg-gray-50 py-12">
   <div className="container mx-auto px-4 max-w-5xl">
    <TermsHeader />

    <div className="bg-white rounded-xl shadow-md p-8 md:p-12 space-y-8">
     <TermsIntroduction />

     {/* İLETİŞİM BİLGİLERİ */}
     <PolicySection
      icon={<HiInformationCircle className="text-indigo-600" size={24} />}
      title="İletişim Bilgileri"
     >
      <>
       <p className="leading-relaxed">
        <strong>Satıcı / Hizmet Sağlayıcı:</strong>
       </p>
       <div className="bg-gray-50 rounded-lg p-4 mt-4 space-y-2">
        <p className="font-semibold text-gray-900">Yazıcı Ticaret</p>
        <p className="text-gray-700">
         <strong>Adres 1:</strong> Kemalpaşa mahallesi, Atatürk bulvarı, No:54/E, İnegöl/Bursa
        </p>
        <p className="text-gray-700">
         <strong>Adres 2:</strong> Cuma mahallesi, Atatürk bulvarı, No:51, İnegöl/Bursa
        </p>
        <p className="text-gray-700">
         <strong>E-posta:</strong>{" "}
         <a href="mailto:info@yazici.gen.tr" className="text-indigo-600 hover:text-indigo-700">
          info@yazici.gen.tr
         </a>
        </p>
        <p className="text-gray-700">
         <strong>Telefon:</strong> 0544 796 77 70 ve 0501 349 69 91
        </p>
       </div>
      </>
     </PolicySection>

     <PolicySection
      icon={<HiCheckCircle className="text-indigo-600" size={24} />}
      title="Genel Koşullar"
     >
      <>
       <p className="leading-relaxed">
        Bu web sitesi <strong>Yazıcı Ticaret</strong> (Profilo markasının yetkili bayisi, 2 şube) tarafından işletilmektedir. Web sitemizi kullanarak:
       </p>
       <ul className="list-disc list-inside space-y-2 ml-4">
        <li>18 yaşında veya daha büyük olduğunuzu onaylarsınız.</li>
        <li>Verdiğiniz tüm bilgilerin doğru ve güncel olduğunu garanti edersiniz.</li>
        <li>Hesabınızın güvenliğinden sorumlu olduğunuzu kabul edersiniz.</li>
        <li>Web sitemizi yasalara uygun şekilde kullanacağınızı taahhüt edersiniz.</li>
       </ul>
      </>
     </PolicySection>

     <PolicySection
      icon={<HiShieldCheck className="text-indigo-600" size={24} />}
      title="Hesap Kullanımı"
     >
      <>
       <p className="leading-relaxed">
        Hesabınızı oluştururken ve kullanırken:
       </p>
       <ul className="list-disc list-inside space-y-2 ml-4">
        <li>Şifrenizi gizli tutmanız ve başkalarıyla paylaşmamanız gerekmektedir.</li>
        <li>Hesabınızdaki tüm aktivitelerden sorumlusunuz.</li>
        <li>Hesabınızın yetkisiz kullanımından şüphelenirseniz derhal bize bildirmelisiniz.</li>
        <li>Sahte veya yanıltıcı bilgi vermek yasaktır.</li>
        <li>Başka birinin hesabını kullanmak yasaktır.</li>
       </ul>
      </>
     </PolicySection>

     <PolicySection title="Ürün ve Hizmetler">
      <>
       <p className="leading-relaxed">
        Ürünlerimiz ve hizmetlerimizle ilgili:
       </p>
       <ul className="list-disc list-inside space-y-2 ml-4">
        <li>Ürün fiyatları ve stok durumu değişiklik gösterebilir.</li>
        <li>Ürün görselleri temsilidir, gerçek ürünlerde küçük farklılıklar olabilir.</li>
        <li>Ürün açıklamalarını doğru tutmaya çalışırız ancak hatalar olabilir.</li>
        <li>Stokta olmayan ürünler için önceden haber vermeden sipariş iptal edebiliriz.</li>
        <li>Fiyat hatalarından kaynaklanan siparişleri iptal etme hakkımız saklıdır.</li>
       </ul>
      </>
     </PolicySection>

     <PolicySection title="Mesafeli Satış Sözleşmesi">
      <>
       <p className="leading-relaxed">
        6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca düzenlenen bu sözleşme,
        Yazıcı Ticaret ile tüketici arasında yapılan mesafeli satış sözleşmesidir.
       </p>
       <p className="leading-relaxed mt-3">
        Bu sözleşme, web sitemiz üzerinden yapılan satış işlemlerinin tüm koşullarını kapsar.
        Sipariş vererek bu sözleşmeyi kabul etmiş sayılırsınız.
       </p>
      </>
     </PolicySection>

     <PolicySection title="Ön Bilgilendirme">
      <>
       <p className="leading-relaxed">
        Sipariş vermeden önce aşağıdaki bilgileri size sunuyoruz:
       </p>
       <ul className="list-disc list-inside space-y-2 ml-4">
        <li>Satıcı bilgileri (yukarıda belirtilmiştir)</li>
        <li>Ürünün temel özellikleri, fiyatı ve vergiler dahil toplam tutarı</li>
        <li>Ödeme, teslimat ve ifa bilgileri</li>
        <li>Cayma hakkı koşulları</li>
        <li>Şikayet ve itiraz hakkı</li>
        <li>Garanti koşulları</li>
       </ul>
      </>
     </PolicySection>

     <PolicySection title="Sipariş ve Ödeme">
      <>
       <p className="leading-relaxed">
        Sipariş verme ve ödeme işlemleri:
       </p>
       <ul className="list-disc list-inside space-y-2 ml-4">
        <li>Sipariş vermek, ürünü satın alma teklifi yapmak anlamına gelir.</li>
        <li>Siparişiniz onaylandığında sözleşme kurulmuş sayılır ve size e-posta ile bildirilir.</li>
        <li>Sipariş onayı e-posta ile gönderilir.</li>
        <li>Ödeme işlemleri güvenli ödeme sağlayıcıları aracılığıyla yapılır.</li>
        <li>Fiyatlar Türk Lirası (₺) cinsindendir ve KDV dahildir.</li>
        <li>Fiyatlar sipariş anındaki fiyatlardır ve değişiklik gösterebilir.</li>
        <li>Fiyat hatalarından kaynaklanan siparişleri iptal etme hakkımız saklıdır.</li>
       </ul>
      </>
     </PolicySection>

     <PolicySection icon={<HiTruck className="text-indigo-600" size={24} />} title="Teslimat Koşulları">
      <>
       <p className="leading-relaxed">
        Teslimat ile ilgili bilgiler:
       </p>
       <ul className="list-disc list-inside space-y-2 ml-4">
        <li>Tüm Türkiye geneline nakliye ve montaj hizmeti sunulmaktadır.</li>
        <li>Bursa iline ücretsiz teslimat yapılmaktadır.</li>
        <li>Diğer illere teslimat ücreti kargo firması tarafından belirlenir.</li>
        <li>Teslimat süresi stok durumuna göre değişiklik gösterebilir.</li>
        <li>Teslimat adresiniz sipariş sırasında belirttiğiniz adrestir.</li>
        <li>Ürün teslim edildiğinde, teslimat tutanağında imza alınır.</li>
        <li>Ürün teslim alındığında, teslim aldığınız tarih cayma hakkı süresinin başlangıcıdır.</li>
       </ul>
      </>
     </PolicySection>

     <PolicySection title="Cayma Hakkı">
      <>
       <p className="leading-relaxed">
        6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca, mesafeli satışlarda cayma hakkınız bulunmaktadır:
       </p>
       <ul className="list-disc list-inside space-y-2 ml-4">
        <li>Ürünleri teslim aldığınız tarihten itibaren <strong>14 gün içinde</strong> hiçbir gerekçe göstermeksizin cayma hakkınızı kullanabilirsiniz.</li>
        <li>Cayma bildirimi yazılı olarak (e-posta, mektup, faks) yapılmalıdır.</li>
        <li>Cayma hakkını kullandığınızda, ürünün orijinal ambalajında, etiketleriyle ve kullanılmamış olması gerekir.</li>
        <li>Cayma hakkınızın kullanılması halinde, ödediğiniz tutar 14 gün içinde iade edilir.</li>
        <li>Cayma nedeniyle yapılan iade masrafları tarafınıza aittir, ancak ürünün bozuk veya hatalı teslim edilmesi durumunda iade masrafları bize aittir.</li>
        <li>Özel sipariş üzerine üretilen veya kişiselleştirilen ürünlerde cayma hakkı bulunmaz.</li>
        <li>Detaylı bilgi için <Link href="/iade-degisim" className="text-indigo-600 hover:underline">İade &amp; Değişim</Link> sayfasını ziyaret edin.</li>
       </ul>
      </>
     </PolicySection>

     <PolicySection title="İade ve Değişim">
      <>
       <p className="leading-relaxed">
        İade ve değişim koşulları:
       </p>
       <ul className="list-disc list-inside space-y-2 ml-4">
        <li>İade talebinizi e-posta veya iletişim kanallarımız üzerinden iletebilirsiniz.</li>
        <li>Ürün orijinal ambalajında, etiketleriyle ve kullanılmamış olmalıdır.</li>
        <li>İade işlemleri ücretsizdir (cayma hakkı kapsamındaki iadeler hariç).</li>
        <li>Ürünün iade edilmesinden sonra, ödeme yönteminize göre iade işlemi gerçekleştirilir.</li>
        <li>İade edilen ürünler kontrol edildikten sonra iade işlemi tamamlanır.</li>
        <li>Detaylı bilgi için <Link href="/iade-degisim" className="text-indigo-600 hover:underline">İade &amp; Değişim</Link> sayfasını ziyaret edin.</li>
       </ul>
      </>
     </PolicySection>

     <PolicySection icon={<HiCube className="text-indigo-600" size={24} />} title="Garanti ve Servis">
      <>
       <p className="leading-relaxed">
        Garanti ve servis koşulları:
       </p>
       <ul className="list-disc list-inside space-y-2 ml-4">
        <li>Satılan tüm ürünler, üretici firma tarafından belirlenen garanti koşullarına tabidir.</li>
        <li>Garanti süresi ve koşulları, ürün kategorisine göre değişiklik gösterebilir.</li>
        <li>Garanti belgeleri, ürün teslimi sırasında size verilir.</li>
        <li>Garanti kapsamındaki ürünler için yetkili servis merkezlerine yönlendirme yapılır.</li>
        <li>Garanti kapsamı dışındaki arızalar ve hasarlar için ayrı ücret talep edilir.</li>
        <li>Garanti süresi, ürünün teslim alındığı tarihten itibaren başlar.</li>
       </ul>
      </>
     </PolicySection>

     <PolicySection title="Fikri Mülkiyet">
      <>
       <p className="leading-relaxed">
        Web sitemizdeki içerikler:
       </p>
       <ul className="list-disc list-inside space-y-2 ml-4">
        <li>Telif hakkı ve diğer fikri mülkiyet haklarıyla korunmaktadır.</li>
        <li>İçerikleri izinsiz kopyalamak, dağıtmak veya kullanmak yasaktır.</li>
        <li>Profilo markası, logo ve tasarımlar Profilo&apos;ya aittir.</li>
        <li>Web sitesi içeriği ve tasarımı Yazıcı Ticaret&apos;e aittir.</li>
        <li>Ürün görselleri ve açıklamaları ticari amaçla kullanılamaz.</li>
       </ul>
      </>
     </PolicySection>

     <PolicySection
      icon={<HiXCircle className="text-red-600" size={24} />}
      title="Yasaklanan Kullanımlar"
     >
      <>
       <p className="leading-relaxed">
        Web sitemizi kullanırken aşağıdakiler yasaktır:
       </p>
       <ul className="list-disc list-inside space-y-2 ml-4">
        <li>Yasa dışı amaçlarla kullanmak</li>
        <li>Virüs, zararlı yazılım veya kötü amaçlı kod yüklemek</li>
        <li>Sistemi bozmaya veya erişimi engellemeye çalışmak</li>
        <li>Başkalarının kişisel bilgilerini toplamak</li>
        <li>Sahte sipariş vermek veya dolandırıcılık yapmak</li>
        <li>Otomatik botlar veya scriptler kullanmak</li>
        <li>Web sitesinin işleyişini bozmaya çalışmak</li>
       </ul>
      </>
     </PolicySection>

     <PolicySection title="Sorumluluk Reddi">
      <>
       <p className="leading-relaxed">
        Yazıcı Ticaret olarak:
       </p>
       <ul className="list-disc list-inside space-y-2 ml-4">
        <li>Web sitesinin kesintisiz çalışmasını garanti edemeyiz.</li>
        <li>Hatalar veya eksiklikler için sorumluluk kabul etmeyiz.</li>
        <li>Üçüncü taraf bağlantılarının içeriğinden sorumlu değiliz.</li>
        <li>Kullanıcıların web sitesini kullanımından kaynaklanan zararlardan sorumlu değiliz.</li>
        <li>Ürünlerin kullanımından kaynaklanan hasarlardan sorumlu değiliz.</li>
       </ul>
      </>
     </PolicySection>

     <PolicySection icon={<HiScale className="text-indigo-600" size={24} />} title="Tüketici Hakları ve Şikayetler">
      <>
       <p className="leading-relaxed">
        Tüketici haklarınız ve şikayet süreçleri:
       </p>
       <ul className="list-disc list-inside space-y-2 ml-4">
        <li>Herhangi bir sorunuz, şikayetiniz veya talebiniz için bizimle iletişime geçebilirsiniz.</li>
        <li>Şikayetleriniz en geç 30 gün içinde yanıtlanır.</li>
        <li>Şikayetlerinizi e-posta, telefon veya mağazalarımıza başvurarak iletebilirsiniz.</li>
        <li>Anlaşmazlıklar öncelikle görüşmeler yoluyla çözülmeye çalışılır.</li>
        <li>Çözülemeyen anlaşmazlıklar için Tüketici Hakem Heyetleri ve Tüketici Mahkemelerine başvurabilirsiniz.</li>
        <li>Tüketici hakları konusunda detaylı bilgi için{" "}
         <a
          href="https://www.tuketici.gov.tr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-700"
         >
          www.tuketici.gov.tr
         </a>{" "}
         adresini ziyaret edebilirsiniz.
        </li>
       </ul>
      </>
     </PolicySection>

     <PolicySection title="Uygulanacak Hukuk ve Yetkili Mahkeme">
      <>
       <p className="leading-relaxed">
        Bu sözleşme Türkiye Cumhuriyeti yasalarına tabidir. Bu sözleşmeden doğan uyuşmazlıkların çözümünde
        öncelikle Tüketici Hakem Heyetleri&apos;ne başvurulur. Tüketici Hakem Heyetleri&apos;nin görevli
        olmadığı veya yetkisinin aşıldığı durumlarda, Bursa mahkemeleri ve icra daireleri yetkilidir.
       </p>
      </>
     </PolicySection>

     <PolicySection title="Koşul Değişiklikleri">
      <>
       <p className="text-gray-700 leading-relaxed">
        Bu Kullanım Koşulları ve Mesafeli Satış Sözleşmesi zaman zaman güncellenebilir. Önemli değişikliklerde size bildirim yapacağız.
        Güncel koşulları bu sayfadan takip edebilirsiniz. Değişikliklerden sonra web sitemizi kullanmaya devam etmeniz,
        güncellenmiş koşulları kabul ettiğiniz anlamına gelir.
       </p>
       <div className="bg-gray-50 rounded-lg p-4 mt-4">
        <p className="text-sm text-gray-600">
         <strong>Son Güncelleme Tarihi:</strong> {new Date().toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
         })}
        </p>
       </div>
      </>
     </PolicySection>
    </div>
   </div>
  </div>
 );
}
