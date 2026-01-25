# Vercel Environment Variables Ayarlama Rehberi

## 🔴 Sorun

Site açılıyor ama veriler görünmüyor çünkü Vercel'de environment variables ayarlanmamış. MongoDB bağlantısı çalışmıyor.

---

## ✅ ÇÖZÜM: Vercel'de Environment Variables Ekleyin

### ADIM 1: Vercel Dashboard'a Gidin

1. [vercel.com/dashboard](https://vercel.com/dashboard) adresine gidin
2. Projenizi seçin: **yazici-ticaret-profilo**

### ADIM 2: Settings → Environment Variables

1. Proje sayfasında **"Settings"** sekmesine tıklayın
2. Sol menüden **"Environment Variables"** seçeneğine tıklayın

### ADIM 3: Environment Variables Ekleyin

Aşağıdaki değişkenleri **sırayla** ekleyin. Her birini ekledikten sonra **"Save"** butonuna tıklayın.

#### 3.1. MongoDB Bağlantısı (EN ÖNEMLİ!)

**Key:** `MONGODB_URI`  
**Value:** `mongodb+srv://wildandmr1:dNHhBgREkI3TjmNw@yaziciticaret.p1lmz2v.mongodb.net/`  
**Environment:** Tümünü seçin (Production, Preview, Development)

#### 3.2. Cloudinary Ayarları

**Key:** `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`  
**Value:** `daaoxujog`  
**Environment:** Tümünü seçin

**Key:** `CLOUDINARY_API_KEY`  
**Value:** `829819935713443`  
**Environment:** Tümünü seçin

**Key:** `CLOUDINARY_API_SECRET`  
**Value:** `UW3iCLAJbQGUauS7-dZGeYM4yGc`  
**Environment:** Tümünü seçin

#### 3.3. E-posta Ayarları

**Key:** `EMAIL_USER`  
**Value:** `yaziciticaret1997@gmail.com`  
**Environment:** Tümünü seçin

**Key:** `EMAIL_PASSWORD`  
**Value:** `escq ffym gndh enop`  
**Environment:** Tümünü seçin

#### 3.4. Base URL (ÖNEMLİ!)

**Key:** `NEXT_PUBLIC_BASE_URL`  
**Value:** `https://yazici.gen.tr`  
**Environment:** Tümünü seçin

**⚠️ ÖNEMLİ:** `http://localhost:3000` değil, `https://yazici.gen.tr` olmalı!

#### 3.5. iyzico Ayarları (Production)

**Key:** `IYZICO_API_KEY`  
**Value:** (iyzico hesabınızdan production API key'i)  
**Environment:** Production

**Key:** `IYZICO_SECRET_KEY`  
**Value:** (iyzico hesabınızdan production secret key'i)  
**Environment:** Production

**Key:** `IYZICO_URI`  
**Value:** `https://api.iyzipay.com`  
**Environment:** Production

#### 3.6. Node Environment

**Key:** `NODE_ENV`  
**Value:** `production`  
**Environment:** Production

---

## 📝 Vercel'de Environment Variable Ekleme Adımları

Her bir variable için:

1. **"Add New"** veya **"+ Add Variable"** butonuna tıklayın
2. **Key** alanına değişken adını yazın (örneğin: `MONGODB_URI`)
3. **Value** alanına değeri yazın
4. **Environment** seçeneklerinden:
   - ✅ **Production** (canlı site için)
   - ✅ **Preview** (test için)
   - ✅ **Development** (geliştirme için)
5. **"Save"** butonuna tıklayın

---

## ⚠️ ÖNEMLİ NOTLAR

### 1. NEXT_PUBLIC_ Prefix

`NEXT_PUBLIC_` ile başlayan değişkenler **client-side'da** kullanılabilir. Diğerleri sadece **server-side'da** kullanılabilir.

**Client-side'da kullanılacaklar:**
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_BASE_URL`

**Sadece server-side'da kullanılacaklar:**
- `MONGODB_URI`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `IYZICO_API_KEY`
- `IYZICO_SECRET_KEY`
- `IYZICO_URI`

### 2. Environment Seçimi

- **Production:** Canlı site için (yazici.gen.tr)
- **Preview:** Test deployment'ları için
- **Development:** Local development için

**Öneri:** Tüm değişkenleri **Production** için ekleyin. Test için **Preview**'a da ekleyebilirsiniz.

### 3. Değişikliklerin Aktif Olması

Environment variables ekledikten sonra:
- **Yeni deployment** yapılması gerekir
- Veya mevcut deployment'ı **redeploy** edin

---

## 🔄 Deployment Yenileme

Environment variables ekledikten sonra:

### Yöntem 1: Otomatik (Git Push)

```bash
git add .
git commit -m "Update environment variables"
git push origin main
```

Vercel otomatik olarak yeni deployment başlatır.

### Yöntem 2: Manuel Redeploy

1. Vercel Dashboard → **Deployments**
2. En son deployment'ı bulun
3. **"..."** menüsünden **"Redeploy"** seçin
4. **"Redeploy"** butonuna tıklayın

---

## ✅ Kontrol Listesi

Environment variables ekledikten sonra kontrol edin:

- [ ] `MONGODB_URI` eklendi mi?
- [ ] `NEXT_PUBLIC_BASE_URL` = `https://yazici.gen.tr` mi?
- [ ] Cloudinary değişkenleri eklendi mi?
- [ ] Email değişkenleri eklendi mi?
- [ ] iyzico değişkenleri eklendi mi? (Production için)
- [ ] Deployment yenilendi mi?

---

## 🆘 Sorun Giderme

### Hala veriler görünmüyorsa:

1. **Vercel Dashboard** → **Deployments** → En son deployment'ın log'larını kontrol edin
2. **MongoDB Atlas**'ta IP whitelist kontrolü yapın:
   - MongoDB Atlas → Network Access
   - Vercel'in IP'lerini ekleyin veya `0.0.0.0/0` (tüm IP'ler) izni verin
3. **Environment variables**'ların doğru eklendiğinden emin olun
4. **Deployment'ı yenileyin** (redeploy)

### MongoDB Bağlantı Hatası:

1. `MONGODB_URI` değerinin doğru olduğundan emin olun
2. MongoDB Atlas'ta database kullanıcısının şifresinin doğru olduğundan emin olun
3. MongoDB Atlas'ta IP whitelist'e Vercel IP'lerini ekleyin

---

## 📋 Hızlı Kopyala-Yapıştır Listesi

Vercel'de eklemeniz gereken tüm değişkenler:

```
MONGODB_URI=mongodb+srv://wildandmr1:dNHhBgREkI3TjmNw@yaziciticaret.p1lmz2v.mongodb.net/
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=daaoxujog
CLOUDINARY_API_KEY=829819935713443
CLOUDINARY_API_SECRET=UW3iCLAJbQGUauS7-dZGeYM4yGc
EMAIL_USER=yaziciticaret1997@gmail.com
EMAIL_PASSWORD=escq ffym gndh enop
NEXT_PUBLIC_BASE_URL=https://yazici.gen.tr
IYZICO_API_KEY=(iyzico production API key)
IYZICO_SECRET_KEY=(iyzico production secret key)
IYZICO_URI=https://api.iyzipay.com
NODE_ENV=production
```

---

## 🎯 Özet

1. ✅ Vercel Dashboard → Settings → Environment Variables
2. ✅ Yukarıdaki tüm değişkenleri ekleyin
3. ✅ `NEXT_PUBLIC_BASE_URL` = `https://yazici.gen.tr` olmalı
4. ✅ Deployment'ı yenileyin (redeploy)
5. ✅ Siteyi test edin

**MongoDB bağlantısı çalıştığında veriler görünecek! 🎉**
