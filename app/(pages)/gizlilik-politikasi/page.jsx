"use client";
import { HiUser, HiEye, HiLockClosed, HiShieldCheck, HiScale, HiOutlineChip, HiMail, HiInformationCircle, HiExclamationCircle, HiClock } from "react-icons/hi";
import Link from "next/link";
import PrivacyPolicyHeader from "@/app/components/policy/PrivacyPolicyHeader";
import PolicySection from "@/app/components/policy/PolicySection";

export default function GizlilikPolitikasiPage() {
 return (
  <div className="min-h-screen bg-gray-50 py-12">
   <div className="container mx-auto px-4 max-w-5xl">
    <PrivacyPolicyHeader />

    <div className="bg-white rounded-xl shadow-md p-8 md:p-12 space-y-8">

     {/* GİRİŞ */}
     <PolicySection>
      <p className="text-gray-700 leading-relaxed">
       <strong>Yazıcı Ticaret</strong> olarak, kişisel verilerinizin gizliliğine ve güvenliğine büyük önem veriyoruz.
       Bu Gizlilik Politikası; web sitemizi ziyaret eden kullanıcıların kişisel verilerinin hangi amaçlarla toplandığını,
       nasıl işlendiğini, korunduğunu ve hangi haklara sahip olduklarını açıklamaktadır.
      </p>
     </PolicySection>

     {/* TOPLANAN VERİLER */}
     <PolicySection icon={<HiUser className="text-indigo-600" size={24} />} title="Toplanan Kişisel Veriler">
      <p className="leading-relaxed">
       Web sitemizi kullandığınızda aşağıdaki kişisel verileriniz toplanabilir:
      </p>
      <ul className="list-disc list-inside space-y-2 ml-4">
       <li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li>
       <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, adres</li>
       <li><strong>Ödeme Bilgileri:</strong> Ödeme işlemlerine ilişkin bilgiler (kart bilgileri sistemlerimizde saklanmaz)</li>
       <li><strong>Hesap Bilgileri:</strong> Kullanıcı adı ve şifre (şifrelenmiş olarak)</li>
       <li><strong>Teknik Veriler:</strong> IP adresi, tarayıcı bilgileri, cihaz bilgileri, çerezler</li>
       <li><strong>Kullanım Verileri:</strong> Sipariş geçmişi, site üzerindeki işlemler</li>
      </ul>
     </PolicySection>

     {/* KULLANIM AMAÇLARI */}
     <PolicySection icon={<HiEye className="text-indigo-600" size={24} />} title="Kişisel Verilerin İşlenme Amaçları">
      <p className="leading-relaxed">
       Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
      </p>
      <ul className="list-disc list-inside space-y-2 ml-4">
       <li>Sipariş ve satış süreçlerinin yürütülmesi</li>
       <li>Müşteri hizmetleri ve destek sağlanması</li>
       <li>Ürün ve hizmetlerin geliştirilmesi</li>
       <li>Bilgilendirme ve pazarlama faaliyetleri</li>
       <li>Yasal yükümlülüklerin yerine getirilmesi</li>
       <li>Güvenlik ve dolandırıcılığın önlenmesi</li>
      </ul>
     </PolicySection>

     {/* PAYLAŞIM */}
     <PolicySection icon={<HiLockClosed className="text-indigo-600" size={24} />} title="Kişisel Verilerin Paylaşılması">
      <p className="leading-relaxed">
       Kişisel verileriniz, aşağıdaki durumlar haricinde üçüncü kişilerle paylaşılmamaktadır:
      </p>
      <ul className="list-disc list-inside space-y-2 ml-4">
       <li><strong>Hizmet Sağlayıcılar:</strong> Kargo, ödeme ve altyapı hizmetleri</li>
       <li><strong>Yasal Yükümlülükler:</strong> Yetkili kamu kurum ve kuruluşları</li>
       <li><strong>İzin Verilen Durumlar:</strong> Açık rızanızın bulunduğu haller</li>
      </ul>
     </PolicySection>

     {/* VERİ SORUMLUSU */}
     <PolicySection icon={<HiInformationCircle className="text-indigo-600" size={24} />} title="Veri Sorumlusu">
      <p className="leading-relaxed">
       <strong>6698 sayılı Kişisel Verilerin Korunması Kanunu</strong> uyarınca veri sorumlusu:
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
        <strong>Telefon:</strong> 0544 796 77 70
       </p>
      </div>
     </PolicySection>

     {/* ÇEREZLER */}
     <PolicySection icon={<HiOutlineChip className="text-indigo-600" size={24} />} title="Çerezler">
      <p className="leading-relaxed">
       Web sitemizde kullanıcı deneyimini geliştirmek amacıyla çerezler kullanılmaktadır.
       Çerezler, tarayıcınız aracılığıyla cihazınıza kaydedilen küçük veri dosyalarıdır.
       Çerez tercihlerinizi tarayıcı ayarlarınızdan yönetebilirsiniz.
      </p>
      <p className="leading-relaxed mt-3">
       Çerezler hakkında detaylı bilgi için{" "}
       <Link href="/cerez-politikasi" className="text-indigo-600 hover:text-indigo-700 font-semibold">
        Çerez Politikası
       </Link>{" "}
       sayfamızı inceleyebilirsiniz.
      </p>
     </PolicySection>

     {/* GÜVENLİK */}
     <PolicySection icon={<HiShieldCheck className="text-indigo-600" size={24} />} title="Veri Güvenliği">
      <p className="leading-relaxed">
       Yazıcı Ticaret, kişisel verilerinizin güvenliğini sağlamak için gerekli teknik ve idari tedbirleri almaktadır:
      </p>
      <ul className="list-disc list-inside space-y-2 ml-4">
       <li>SSL (HTTPS) ile güvenli veri iletimi</li>
       <li>Şifrelenmiş veri saklama</li>
       <li>Erişim yetkilendirme kontrolleri</li>
       <li>Güvenli sunucu altyapısı</li>
      </ul>
     </PolicySection>

     {/* VERİ SAKLAMA SÜRESİ */}
     <PolicySection icon={<HiClock className="text-indigo-600" size={24} />} title="Veri Saklama Süresi">
      <p className="leading-relaxed">
       Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca saklanmaktadır:
      </p>
      <ul className="list-disc list-inside space-y-2 ml-4">
       <li><strong>Hesap Bilgileri:</strong> Hesabınızın aktif olduğu süre boyunca (hesap silinene kadar)</li>
       <li><strong>Sipariş Bilgileri:</strong> Yasal saklama süresi gereği en az 10 yıl</li>
       <li><strong>İletişim Kayıtları:</strong> İletişim talebinizin çözümlenmesinden itibaren 3 yıl</li>
       <li><strong>Mali Belgeler:</strong> Vergi mevzuatı gereği en az 10 yıl</li>
       <li><strong>Çerezler:</strong> Çerez türüne göre oturum süresi veya en fazla 365 gün</li>
      </ul>
      <p className="leading-relaxed mt-4">
       İşleme amacı ortadan kalktığında ve yasal saklama süreleri dolduğunda, kişisel verileriniz
       yürürlükteki mevzuata uygun olarak silinir, yok edilir veya anonim hale getirilir.
      </p>
     </PolicySection>

     {/* VERİ SİLME VE YOK ETME */}
     <PolicySection icon={<HiExclamationCircle className="text-indigo-600" size={24} />} title="Kişisel Verilerin Silinmesi ve Yok Edilmesi">
      <p className="leading-relaxed">
       Kişisel verilerinizin silinmesini veya yok edilmesini talep edebilirsiniz.
       Talebiniz değerlendirilerek:
      </p>
      <ul className="list-disc list-inside space-y-2 ml-4">
       <li>Yasal saklama süresi dolmuş veriler derhal silinir veya yok edilir</li>
       <li>Yasal saklama süresi devam eden veriler, süre dolduğunda silinir</li>
       <li>Silme işlemi geri alınamaz şekilde gerçekleştirilir</li>
      </ul>
      <p className="leading-relaxed mt-4">
       Hesabınızı silmek için hesap ayarlarınızdan &quot;Hesabımı Sil&quot; seçeneğini kullanabilirsiniz.
       Bu işlem tüm kişisel verilerinizin silinmesine neden olur.
      </p>
     </PolicySection>

     {/* VERİ GÜVENLİK İHLALİ */}
     <PolicySection icon={<HiShieldCheck className="text-indigo-600" size={24} />} title="Veri Güvenliği İhlali Bildirimi">
      <p className="leading-relaxed">
       Kişisel verilerinizin güvenliğini sağlamak için teknik ve idari önlemler alınmıştır.
       Ancak bir veri güvenliği ihlali tespit edildiğinde:
      </p>
      <ul className="list-disc list-inside space-y-2 ml-4">
       <li>İhlal, KVKK Kurulu&apos;na 72 saat içinde bildirilir</li>
       <li>İhlalin ilgili kişileri etkileme riski varsa, bu durum en kısa sürede ilgili kişilere bildirilir</li>
       <li>İhlalin önlenmesi için gerekli önlemler derhal alınır</li>
      </ul>
     </PolicySection>

     {/* ÇOCUKLARIN KİŞİSEL VERİLERİ */}
     <PolicySection icon={<HiUser className="text-indigo-600" size={24} />} title="Çocukların Kişisel Verileri">
      <p className="leading-relaxed">
       Web sitemiz 18 yaş altındaki kişilerin kullanımına yönelik değildir.
       18 yaş altındaki kişilerin kişisel verilerini bilerek toplamıyoruz.
       Eğer bir çocuğun kişisel verilerini topladığımızı fark edersek,
       bu verileri derhal sileriz.
      </p>
      <p className="leading-relaxed mt-3">
       18 yaş altındaki çocuklar, ebeveyn veya vasilerinin izni ve gözetimi olmadan
       sitemizi kullanmamalıdır.
      </p>
     </PolicySection>

     {/* KVKK HAKLARI */}
     <PolicySection icon={<HiScale className="text-indigo-600" size={24} />} title="KVKK Kapsamındaki Haklarınız">
      <p className="leading-relaxed">
       6698 sayılı KVKK kapsamında kişisel verilerinize ilişkin aşağıdaki haklara sahipsiniz:
      </p>
      <ul className="list-disc list-inside space-y-2 ml-4">
       <li><strong>Öğrenme Hakkı:</strong> Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
       <li><strong>Bilgi Talep Etme:</strong> İşlenmişse buna ilişkin bilgi talep etme</li>
       <li><strong>Erişim Hakkı:</strong> Kişisel verilerinize erişim sağlama</li>
       <li><strong>Düzeltme Hakkı:</strong> İşlenmiş kişisel verileriniz hatalıysa bunların düzeltilmesini isteme</li>
       <li><strong>Silme/Yok Etme Hakkı:</strong> İşlenen kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
       <li><strong>Bildirimi Hakkı:</strong> Kişisel verilerinizin düzeltilmesi, silinmesi veya yok edilmesi halinde, bu işlemlerin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
       <li><strong>İtiraz Hakkı:</strong> İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi nedeniyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
       <li><strong>Zararın Giderilmesini Talep Etme:</strong> Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması halinde zararın giderilmesini talep etme</li>
      </ul>
     </PolicySection>

     {/* HAKLARIN KULLANIMI */}
     <PolicySection icon={<HiMail className="text-indigo-600" size={24} />} title="Haklarınızı Nasıl Kullanabilirsiniz?">
      <p className="leading-relaxed">
       KVKK kapsamındaki haklarınızı kullanmak için:
      </p>
      <ul className="list-disc list-inside space-y-2 ml-4">
       <li>Kimliğinizi tespit edecek bilgilerle birlikte yazılı başvurunuzu{" "}
        <a href="mailto:info@yazici.gen.tr" className="text-indigo-600 hover:text-indigo-700 font-semibold">
         info@yazici.gen.tr
        </a>{" "}
        adresine gönderebilirsiniz
       </li>
       <li>Başvurunuz en geç 30 gün içinde ücretsiz olarak sonuçlandırılır</li>
       <li>Başvurunun kabul edilmesi halinde talebiniz yerine getirilir</li>
       <li>Başvurunuzun reddedilmesi, yanıtın verilmemesi veya verilen yanıtın yetersiz bulunması halinde, KVKK Kanunu&apos;nun 14. maddesi uyarınca KVKK Kurulu&apos;na şikayette bulunabilirsiniz</li>
      </ul>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
       <p className="text-blue-700 text-sm">
        <strong>Not:</strong> Başvurularınızda kimliğinizi tespit edici belgeler (nüfus cüzdanı, ehliyet vb.)
        ve talep ettiğiniz haklara ilişkin detaylı bilgi bulunmalıdır.
       </p>
      </div>
     </PolicySection>

     {/* YURTDIŞINA VERİ TRANSFERİ */}
     <PolicySection icon={<HiLockClosed className="text-indigo-600" size={24} />} title="Yurtdışına Veri Transferi">
      <p className="leading-relaxed">
       Kişisel verileriniz, KVKK Kanunu ve ilgili mevzuat hükümlerine uygun olarak,
       gerekli güvenlik önlemleri alınarak yurtdışına aktarılabilir. Bu durumda:
      </p>
      <ul className="list-disc list-inside space-y-2 ml-4">
       <li>Veri transferi, yalnızca hizmet sağlayıcılarımız (bulut sunucular, ödeme altyapıları vb.) ile sınırlıdır</li>
       <li>Transfer edilen veriler, yeterli koruma sağlayan ülkelerde veya yeterli koruma sağlanan alıcılar tarafından işlenir</li>
       <li>Açık rızanızın bulunduğu durumlarda, yeterli koruma sağlayan ülkeler dışına da transfer yapılabilir</li>
      </ul>
     </PolicySection>

     {/* POLİTİKA DEĞİŞİKLİKLERİ */}
     <PolicySection icon={<HiInformationCircle className="text-indigo-600" size={24} />} title="Gizlilik Politikası Değişiklikleri">
      <p className="leading-relaxed">
       Bu Gizlilik Politikası, yasal düzenlemelerdeki değişiklikler veya işletme politikalarımızdaki
       güncellemeler nedeniyle zaman zaman güncellenebilir. Önemli değişiklikler yapıldığında,
       sitemiz üzerinden veya e-posta yoluyla sizleri bilgilendiririz.
      </p>
      <p className="leading-relaxed mt-3">
       Bu sayfayı düzenli olarak kontrol etmenizi öneririz. Politikadaki değişiklikler,
       yayınlandığı tarihten itibaren geçerlidir.
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
     </PolicySection>
    </div>
   </div>
  </div>
 );
}
