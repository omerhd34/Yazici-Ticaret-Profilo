# ixirhost Nameserver Ayarları Rehberi - yazici.gen.tr

## 🎯 Yöntem: Nameserver Değiştirme (ÖNERİLEN)

Vercel nameserver kullanmak, manuel DNS kayıtları eklemekten çok daha kolaydır. Vercel otomatik olarak tüm DNS kayıtlarını yönetir.

---

## ✅ Adım 1: Vercel Nameserver'larını Not Edin

Vercel Dashboard'dan aldığınız nameserver'lar:

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

Bu iki nameserver'ı ixirhost'ta kullanacaksınız.

---

## ✅ Adım 2: ixirhost Müşteri Paneline Giriş Yapın

1. **ixirhost.com** web sitesine gidin
2. Sağ üstte **"Giriş Yap"** butonuna tıklayın
3. Kullanıcı adı ve şifrenizle giriş yapın

---

## ✅ Adım 3: Domain Yönetim Bölümüne Gidin

1. Müşteri panelinde **"Domainlerim"** veya **"Domain Yönetimi"** sekmesine tıklayın
2. `yazici.gen.tr` domain'ini bulun
3. Domain'in yanında **"Yönet"**, **"DNS Ayarları"** veya **"Nameserver Ayarları"** butonuna tıklayın

**Alternatif yollar:**
- **"Domainler"** → `yazici.gen.tr` → **"DNS Yönetimi"**
- **"Hesabım"** → **"Domainlerim"** → `yazici.gen.tr` → **"Ayarlar"**

---

## ✅ Adım 4: Nameserver'ları Değiştirin

### 4.1. Mevcut Nameserver'ları Görün

ixirhost panelinde şu an muhtemelen şöyle nameserver'lar var:
- `ns1.ixirhost.com` (veya benzeri)
- `ns2.ixirhost.com` (veya benzeri)

### 4.2. Nameserver'ları Vercel'e Değiştirin

1. **"Nameserver Ayarları"** veya **"DNS Sunucuları"** bölümüne gidin
2. **"Özel Nameserver Kullan"** veya **"Custom Nameservers"** seçeneğini işaretleyin
3. İki nameserver alanı göreceksiniz:

   **Nameserver 1:**
   ```
   ns1.vercel-dns.com
   ```

   **Nameserver 2:**
   ```
   ns2.vercel-dns.com
   ```

4. Bu değerleri **tam olarak** yazın (büyük/küçük harf duyarlı değil ama noktalama önemli)
5. **"Kaydet"**, **"Güncelle"** veya **"Değiştir"** butonuna tıklayın

---

## ⏱️ Adım 5: Nameserver Değişikliğini Bekleyin

**ÖNEMLİ:** Nameserver değişiklikleri **24-48 saat** sürebilir, ancak genellikle **2-6 saat** içinde aktif olur.

**Kontrol etmek için:**
1. [whatsmydns.net](https://www.whatsmydns.net) sitesine gidin
2. `yazici.gen.tr` yazın
3. **"NS" (Nameserver)** seçeneğini seçin
4. Dünya haritasında nameserver'ların yayıldığını görebilirsiniz

---

## ✅ Adım 6: Vercel'de Domain Durumunu Kontrol Edin

1. **Vercel Dashboard** → Projeniz → **Settings** → **Domains**
2. `yazici.gen.tr` domain'ini kontrol edin
3. Nameserver'lar doğru ayarlandıysa, Vercel otomatik olarak:
   - ✅ DNS kayıtlarını yönetir
   - ✅ SSL sertifikasını kurar
   - ✅ Domain'i aktif eder

**Durum mesajları:**
- **"Valid Configuration"** veya **"Connected"** → ✅ Başarılı!
- **"Pending"** → Nameserver değişikliği henüz yayılmadı, bekleyin
- **"Invalid Configuration"** → Nameserver'ları tekrar kontrol edin

---

## 🔧 ixirhost Panel Görünümü (Tahmini)

ixirhost panelinde genellikle şöyle görünür:

```
┌─────────────────────────────────────┐
│ Domain: yazici.gen.tr                │
├─────────────────────────────────────┤
│ Nameserver Ayarları                  │
│                                      │
│ ☐ ixirhost Nameserver Kullan         │
│ ☑ Özel Nameserver Kullan            │
│                                      │
│ Nameserver 1: [ns1.vercel-dns.com]  │
│ Nameserver 2: [ns2.vercel-dns.com]  │
│                                      │
│ [Kaydet] [İptal]                     │
└─────────────────────────────────────┘
```

---

## ⚠️ ÖNEMLİ NOTLAR

1. **Nameserver Değişikliği:** Nameserver'ları değiştirdikten sonra, DNS kayıtları artık Vercel tarafından yönetilir. ixirhost panelinden DNS kayıtlarını değiştiremezsiniz.

2. **Eski DNS Kayıtları:** Nameserver'ları değiştirdikten sonra eski DNS kayıtları otomatik olarak geçersiz olur. Endişelenmeyin, Vercel otomatik olarak gerekli kayıtları oluşturur.

3. **SSL Sertifikası:** Vercel otomatik olarak SSL sertifikası kurar. Ekstra bir şey yapmanıza gerek yok.

4. **Bekleme Süresi:** Nameserver değişiklikleri 24-48 saat sürebilir, ancak genellikle 2-6 saat içinde aktif olur.

5. **Diğer Domain'ler:** Sadece `yazici.gen.tr` için nameserver'ları değiştirin. Başka domain'leriniz varsa onlara dokunmayın.

---

## 🆘 Sorun Giderme

### Nameserver değişikliği 48 saatten fazla sürüyorsa:
1. ixirhost teknik desteğiyle iletişime geçin: **destek@ixirhost.com** veya canlı destek
2. Nameserver'ların doğru girildiğinden emin olun
3. [whatsmydns.net](https://www.whatsmydns.net) ile kontrol edin

### Vercel'de "Invalid Configuration" hatası:
1. Nameserver'ların doğru girildiğinden emin olun
2. Nameserver propagation'ı kontrol edin: [whatsmydns.net](https://www.whatsmydns.net)
3. Birkaç saat bekleyip tekrar kontrol edin

### Domain hala eski siteye yönleniyorsa:
1. Browser cache'i temizleyin (Ctrl+Shift+Delete)
2. Farklı bir browser'da test edin
3. Nameserver propagation'ı kontrol edin
4. Vercel Dashboard'da domain durumunu kontrol edin

---

## 📞 ixirhost Destek

Sorun yaşarsanız:
- **E-posta:** destek@ixirhost.com
- **Canlı Destek:** ixirhost.com → Canlı Destek
- **Telefon:** ixirhost.com → İletişim

---

## ✅ Başarı Kontrolü

Nameserver'ları değiştirdikten sonra:

1. **2-6 saat bekleyin**
2. **Vercel Dashboard** → Settings → Domains → `yazici.gen.tr` kontrol edin
3. **"Valid Configuration"** görüyorsanız → ✅ Başarılı!
4. **Tarayıcıda** `https://yazici.gen.tr` adresini açın
5. **Yeni site görünüyorsa** → 🎉 Tamamlandı!

---

## 🎯 Özet

1. ✅ Vercel nameserver'larını not edin: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`
2. ✅ ixirhost müşteri paneline giriş yapın
3. ✅ Domain yönetim bölümüne gidin
4. ✅ Nameserver'ları Vercel'e değiştirin
5. ✅ 2-6 saat bekleyin
6. ✅ Vercel'de domain durumunu kontrol edin
7. ✅ Siteyi test edin

**Kolay gelsin! 🚀**
