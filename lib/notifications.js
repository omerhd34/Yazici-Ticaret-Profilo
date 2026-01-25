import nodemailer from 'nodemailer';
import {
 orderStatusUpdateTemplate,
 emailVerificationTemplate,
 adminNewOrderTemplate,
 userOrderConfirmationTemplate,
 adminOrderCancelledTemplate,
 adminReturnRequestTemplate,
 userReturnApprovedTemplate,
 userReturnRejectedTemplate,
 priceChangeTemplate,
 stockAvailableTemplate,
} from './emailTemplates';

const createTransporter = () => {
 if (process.env.EMAIL_HOST && process.env.EMAIL_PORT) {
  return nodemailer.createTransport({
   host: process.env.EMAIL_HOST,
   port: parseInt(process.env.EMAIL_PORT, 10),
   secure: process.env.EMAIL_PORT === '465',
   auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
   },
  });
 }

 if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD &&
  (process.env.EMAIL_USER.includes('@outlook.com') ||
   process.env.EMAIL_USER.includes('@hotmail.com') ||
   process.env.EMAIL_USER.includes('@office365.com'))) {

  const originalPassword = process.env.EMAIL_PASSWORD.trim();
  const cleanPassword = originalPassword.replace(/-/g, '').trim();

  return nodemailer.createTransport({
   host: 'smtp-mail.outlook.com',
   port: 587,
   secure: false,
   requireTLS: true,
   auth: {
    user: process.env.EMAIL_USER.trim(),
    pass: cleanPassword,
   },
   tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
   },
   debug: process.env.NODE_ENV === 'development',
   logger: process.env.NODE_ENV === 'development'
  });
 }

 if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  return nodemailer.createTransport({
   service: 'gmail',
   auth: {
    user: process.env.EMAIL_USER.trim(),
    pass: process.env.EMAIL_PASSWORD.trim(),
   },
  });
 }

 return null;
};

export const sendEmailVerificationEmail = async ({
 userEmail,
 userName,
 verificationCode,
 verificationLink,
}) => {
 try {
  const transporter = createTransporter();
  if (!transporter) {
   return { success: false, error: "E-posta ayarları eksik" };
  }

  if (!userEmail) {
   return { success: false, error: "Kullanıcı e-postası yok" };
  }

  const safeName = userName || "Kullanıcı";

  const mailOptions = {
   from: `Yazıcı Ticaret <${process.env.EMAIL_USER}>`,
   to: userEmail,
   subject: `✅ Yazıcı Ticaret - Email Doğrulama Kodu`,
   html: emailVerificationTemplate({
    userName: safeName,
    verificationCode,
    verificationLink,
   }),
   text: `
     Email Doğrulama
     
     Merhaba ${safeName},
     
     Yazıcı Ticaret'e hoş geldiniz! Hesabınızı aktifleştirmek için aşağıdaki doğrulama kodunu kullanabilir veya doğrudan linke tıklayabilirsiniz.
     
     Doğrulama Kodu: ${verificationCode}
     
     Email'i doğrulamak için: ${verificationLink}
     
     ⚠️ Önemli: Bu kod 1 saat süreyle geçerlidir. Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
     
     © ${new Date().getFullYear()} Yazıcı Ticaret - Tüm hakları saklıdır.
   `,
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
 } catch (error) {
  return { success: false, error: error.message || String(error) };
 }
};

export const sendAdminNewOrderEmail = async ({
 adminEmail,
 orderId,
 userName,
 userEmail,
 userPhone,
 total,
 paymentMethod,
 addressSummary,
 items,
}) => {
 try {
  const transporter = createTransporter();

  if (!transporter) {
   return { success: false, error: 'E-posta ayarları eksik' };
  }

  const to = adminEmail || process.env.EMAIL_USER;
  if (!to) {
   return { success: false, error: 'EMAIL_USER tanımlı değil' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr';

  const safeItems = Array.isArray(items) ? items : [];
  const itemsText = safeItems.length
   ? safeItems.map((it) => {
    const name = String(it.name || "-");
    const qty = Number(it.quantity || 1) || 1;
    const price = Number(it.price || 0);
    const lineTotal = price * qty;
    return `  - ${name} (Adet: ${qty}, Birim: ${price.toFixed(2)} ₺, Toplam: ${lineTotal.toFixed(2)} ₺)`;
   }).join("\n")
   : "  Ürün bulunamadı.";

  const mailOptions = {
   from: `Yazıcı Ticaret <${process.env.EMAIL_USER}>`,
   to,
   subject: `🛒 Yeni Sipariş: ${orderId}`,
   html: adminNewOrderTemplate({
    orderId,
    userName,
    userEmail,
    userPhone,
    total,
    paymentMethod: paymentMethod || '-',
    addressSummary,
    items: safeItems,
    baseUrl,
   }),
   text: `
     Yeni Sipariş Alındı
     
     Sipariş No: ${orderId}
     
     Sipariş Özeti:
     Ödeme Yöntemi: ${paymentMethod || '-'}
     Toplam Tutar: ${Number(total || 0).toFixed(2)} ₺
     
     Müşteri Bilgileri:
     Müşteri: ${userName || '-'}
     E-posta: ${userEmail || '-'}
     Telefon: ${userPhone || '-'}
     
     ${addressSummary ? `Adres:\n${addressSummary}\n` : ""}
     Ürünler:
${itemsText}
     
     Admin panelinden görüntülemek için: ${baseUrl}/admin/son-siparisler
     
     © ${new Date().getFullYear()} Yazıcı Ticaret - Tüm hakları saklıdır.
   `,
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
 } catch (error) {
  return { success: false, error: error.message };
 }
};

// Müşteriye sipariş onay e-postası gönder
export const sendUserOrderConfirmationEmail = async ({
 userEmail,
 userName,
 orderId,
 orderDate,
 total,
 paymentMethod,
 addressSummary,
 items,
}) => {
 try {
  const transporter = createTransporter();

  if (!transporter) {
   return { success: false, error: 'E-posta ayarları eksik' };
  }

  if (!userEmail) {
   return { success: false, error: 'Kullanıcı e-postası yok' };
  }

  const safeName = userName || "Müşterimiz";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yazici.gen.tr";

  const mailOptions = {
   from: `Yazıcı Ticaret <${process.env.EMAIL_USER}>`,
   to: userEmail,
   subject: `✅ Siparişiniz Alındı - ${orderId}`,
   html: userOrderConfirmationTemplate({
    userName: safeName,
    orderId,
    orderDate,
    total,
    paymentMethod: paymentMethod || '-',
    addressSummary,
    items: Array.isArray(items) ? items : [],
    baseUrl,
   }),
   text: `
     Siparişiniz Alındı.
     
     Merhaba ${safeName},
     
     Siparişiniz başarıyla alınmıştır.
     
     Sipariş No: ${orderId}
     Sipariş Tarihi: ${formattedDate}
     Toplam Tutar: ${Number(total || 0).toFixed(2)} ₺
     Ödeme Yöntemi: ${paymentMethod || '-'}
     
     Siparişlerinizi görüntülemek için: ${baseUrl}/hesabim?tab=siparisler
     
     © ${new Date().getFullYear()} Yazıcı Ticaret
   `,
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
 } catch (error) {
  return { success: false, error: error.message || String(error) };
 }
};

// Müşteriye sipariş durumu değişikliği e-postası gönder
export const sendUserOrderStatusUpdateEmail = async ({
 userEmail,
 userName,
 orderId,
 oldStatus,
 newStatus,
 orderDate,
 total,
 items,
 addressSummary,
}) => {
 try {
  const transporter = createTransporter();

  if (!transporter) {
   return { success: false, error: 'E-posta ayarları eksik' };
  }

  if (!userEmail) {
   return { success: false, error: 'Kullanıcı e-postası yok' };
  }

  const safeName = userName || "Müşterimiz";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yazici.gen.tr";
  const formattedDate = orderDate ? new Date(orderDate).toLocaleString("tr-TR") : new Date().toLocaleString("tr-TR");

  // Durum mesajları
  const statusMessages = {
   "Beklemede": "Siparişiniz alınmıştır ve onay beklenmektedir.",
   "Hazırlanıyor": "Siparişiniz hazırlanmaktadır.",
   "Kargoda": "Siparişiniz kargoya verilmiştir.",
   "Teslim Edildi": "Siparişiniz teslim edilmiştir.",
  };

  const statusMessage = statusMessages[newStatus] || "Sipariş durumunuz güncellenmiştir.";

  const mailOptions = {
   from: `Yazıcı Ticaret <${process.env.EMAIL_USER}>`,
   to: userEmail,
   subject: `📦 Sipariş Durumu Güncellendi - ${orderId}`,
   html: orderStatusUpdateTemplate({
    userName: safeName,
    orderId,
    oldStatus,
    newStatus,
    statusMessage,
    orderDate,
    total,
    baseUrl,
   }),
   text: `
     Sipariş Durumu Güncellendi
     
     Merhaba ${safeName},
     
     ${statusMessage}
     
     Sipariş No: ${orderId}
     Yeni Durum: ${newStatus}
     ${oldStatus ? `Önceki Durum: ${oldStatus}` : ''}
     Sipariş Tarihi: ${formattedDate}
     Toplam Tutar: ${Number(total || 0).toFixed(2)} ₺
     
     Siparişlerinizi görüntülemek için: ${baseUrl}/hesabim?tab=siparisler
     
     © ${new Date().getFullYear()} Yazıcı Ticaret
   `,
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
 } catch (error) {
  return { success: false, error: error.message || String(error) };
 }
};

// Admin'e sipariş iptal bildirimi gönder
export const sendAdminOrderCancelledEmail = async ({
 adminEmail,
 orderId,
 userName,
 userEmail,
 userPhone,
 total,
 orderDate,
 items,
 addressSummary,
}) => {
 try {
  const transporter = createTransporter();
  if (!transporter) {
   return { success: false, error: 'E-posta ayarları eksik' };
  }

  const to = adminEmail || process.env.EMAIL_USER;
  if (!to) {
   return { success: false, error: 'EMAIL_USER tanımlı değil' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr';

  const mailOptions = {
   from: `Yazıcı Ticaret <${process.env.EMAIL_USER}>`,
   to,
   subject: `❌ Sipariş İptal Edildi: ${orderId}`,
   html: adminOrderCancelledTemplate({
    orderId,
    userName,
    userEmail,
    userPhone,
    total,
    orderDate,
    addressSummary,
    items: Array.isArray(items) ? items : [],
    baseUrl,
   }),
   text: `
     Sipariş İptal Edildi
     
     Müşteri tarafından sipariş iptal edilmiştir.
     
     Sipariş No: ${orderId}
     Sipariş Tarihi: ${orderDate ? new Date(orderDate).toLocaleString("tr-TR") : new Date().toLocaleString("tr-TR")}
     Toplam Tutar: ${Number(total || 0).toFixed(2)} ₺
     
     Müşteri: ${userName || '-'}
     E-posta: ${userEmail || '-'}
     Telefon: ${userPhone || '-'}
     
     Admin panelinden görüntülemek için: ${baseUrl}/admin/son-siparisler
     
     © ${new Date().getFullYear()} Yazıcı Ticaret
   `,
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
 } catch (error) {
  return { success: false, error: error.message || String(error) };
 }
};

export const sendAdminReturnRequestEmail = async ({
 adminEmail,
 orderId,
 userName,
 userEmail,
 userPhone,
 total,
 deliveredAt,
 note,
}) => {
 try {
  const transporter = createTransporter();
  if (!transporter) {
   return { success: false, error: 'E-posta ayarları eksik' };
  }

  const to = adminEmail || process.env.EMAIL_USER;
  if (!to) {
   return { success: false, error: 'EMAIL_USER tanımlı değil' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr';
  const deliveredText = deliveredAt ? new Date(deliveredAt).toLocaleString("tr-TR") : "-";
  const safeNote = String(note || "").replace(/\n/g, " ");

  const mailOptions = {
   from: `Yazıcı Ticaret <${process.env.EMAIL_USER}>`,
   to,
   subject: `↩️ İade Talebi: ${orderId}`,
   html: adminReturnRequestTemplate({
    orderId,
    userName,
    userEmail,
    userPhone,
    total,
    deliveredAt,
    note,
    baseUrl,
   }),
   text: `
     İade Talebi Oluşturuldu
     
     Sipariş No: ${orderId}
     
     İade Talebi Detayları:
     
     Müşteri Bilgileri:
     Müşteri: ${userName || "-"}
     E-posta: ${userEmail || "-"}
     Telefon: ${userPhone || "-"}
     
     Teslim Tarihi: ${deliveredText}
     Sipariş Tutarı: ${Number(total || 0).toFixed(2)} ₺
     
     İade Nedeni:
     ${safeNote || "Belirtilmemiş"}
     
     Admin panelinden görüntülemek için: ${baseUrl}/admin/son-siparisler
     
     © ${new Date().getFullYear()} Yazıcı Ticaret - Tüm hakları saklıdır.
   `,
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
 } catch (error) {
  return { success: false, error: error.message || String(error) };
 }
};

// Müşteriye iade talebi onayı e-postası gönder
export const sendUserReturnApprovedEmail = async ({
 userEmail,
 userName,
 orderId,
 explanation,
}) => {
 try {
  const transporter = createTransporter();
  if (!transporter) {
   return { success: false, error: "E-posta ayarları eksik" };
  }

  if (!userEmail) {
   return { success: false, error: "Kullanıcı e-postası yok" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yazici.gen.tr";
  const safeName = userName || "Müşterimiz";
  const returnAddress = process.env.RETURN_ADDRESS
   ? String(process.env.RETURN_ADDRESS).slice(0, 2000).replace(/</g, "&lt;").replace(/>/g, "&gt;")
   : "Yazıcı Ticaret İade Yeri\nKemalpaşa mah. Atatürk bulvarı no:54/E\nCuma mah. Atatürk bulvarı No:51\nBursa / İnegöl\nTel: 0544 796 77 70";
  const handDeliveryAddress = process.env.HAND_DELIVERY_ADDRESS
   ? String(process.env.HAND_DELIVERY_ADDRESS).slice(0, 2000).replace(/</g, "&lt;").replace(/>/g, "&gt;")
   : "Yazıcı Ticaret Teslim Noktası\nKemalpaşa mah. Atatürk bulvarı no:54/E\nCuma mah. Atatürk bulvarı No:51\nBursa / İnegöl\nTel: 0544 796 77 70\nHafta içi: 10:00 - 18:00";
  const returnWindowText = "Ürünü 1-2 gün içinde kargoya vermelisiniz.";
  const shippingFeeText = "Kargo ücreti müşteriye aittir.";
  const handDeliveryText = "Dilerseniz ürünü elden de teslim edebilirsiniz.";
  const safeExplanation = explanation ? String(explanation).slice(0, 2000).replace(/\n/g, " ") : null;

  const mailOptions = {
   from: `Yazıcı Ticaret <${process.env.EMAIL_USER}>`,
   to: userEmail,
   subject: `✅ İade Talebiniz Onaylandı - ${orderId}`,
   html: userReturnApprovedTemplate({
    userName: safeName,
    orderId,
    explanation,
    returnAddress,
    handDeliveryAddress,
    returnWindowText,
    shippingFeeText,
    handDeliveryText,
    baseUrl,
   }),
   text: `
     İade Talebiniz Onaylandı.
     
     Merhaba ${safeName},
     
     İade talebiniz onaylanmıştır. Aşağıdaki talimatları takip ederek iade sürecini başlatabilirsiniz.
     
     Sipariş No: ${orderId}
     
     ${safeExplanation ? `İade Açıklaması:\n${safeExplanation}\n\n` : ""}
     ${returnAddress ? `İade Gönderim Adresi:\n${returnAddress}\n\n` : ""}
     Elden Teslim (Opsiyonel):
     ${handDeliveryText}
     ${handDeliveryAddress}
     
     Önemli Bilgiler:
     - ${returnWindowText}
     - ${shippingFeeText}
     
     Siparişlerinizi görüntülemek için: ${baseUrl}/hesabim?tab=siparisler
     
     © ${new Date().getFullYear()} Yazıcı Ticaret - Tüm hakları saklıdır.
   `,
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
 } catch (error) {
  return { success: false, error: error.message || String(error) };
 }
};

// Müşteriye iade talebi reddedildi e-postası gönder
export const sendUserReturnRejectedEmail = async ({
 userEmail,
 userName,
 orderId,
 reason,
}) => {
 try {
  const transporter = createTransporter();
  if (!transporter) {
   return { success: false, error: "E-posta ayarları eksik" };
  }

  if (!userEmail) {
   return { success: false, error: "Kullanıcı e-postası yok" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yazici.gen.tr";
  const safeName = userName || "Müşterimiz";
  const safeReason = reason ? String(reason).slice(0, 2000).replace(/\n/g, " ") : null;

  const mailOptions = {
   from: `Yazıcı Ticaret <${process.env.EMAIL_USER}>`,
   to: userEmail,
   subject: `❌ İade Talebiniz Reddedildi - ${orderId}`,
   html: userReturnRejectedTemplate({
    userName: safeName,
    orderId,
    reason,
    baseUrl,
   }),
   text: `
     İade Talebi Reddedildi
     
     Merhaba ${safeName},
     
     Maalesef iade talebiniz incelendikten sonra reddedilmiştir.
     
     Sipariş No: ${orderId}
     ${safeReason ? `Red Nedeni: ${safeReason}\n` : ""}
     
     İade talebinizle ilgili sorularınız varsa veya itiraz etmek isterseniz, bizimle iletişime geçebilirsiniz.
     Müşteri hizmetlerimiz size yardımcı olmaktan memnuniyet duyacaktır.
     
     Siparişlerinizi görüntülemek için: ${baseUrl}/hesabim?tab=siparisler
     
     © ${new Date().getFullYear()} Yazıcı Ticaret
   `,
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
 } catch (error) {
  return { success: false, error: error.message || String(error) };
 }
};

// Favori ürün fiyat değişikliği e-postası gönder
export const sendPriceChangeEmail = async (userEmail, userName, productName, oldPrice, newPrice, productUrl, source = 'favorite') => {
 try {
  const transporter = createTransporter();

  if (!transporter) {
   return { success: false, error: 'E-posta ayarları eksik' };
  }

  const isPriceDrop = newPrice < oldPrice;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr';

  // Başlık ve mesajı source'a göre değiştir
  const subjectTitle = source === 'cart' ? 'Sepetteki Ürününüzde Fiyat Değişikliği' : 'Favori Ürününüzde Fiyat Değişikliği';
  const locationText = source === 'cart' ? 'Sepetinizdeki' : 'Favorilerinizdeki';

  const mailOptions = {
   from: `Yazıcı Ticaret <${process.env.EMAIL_USER}>`,
   to: userEmail,
   subject: `${isPriceDrop ? '🎉' : '📢'} ${subjectTitle} - ${productName}`,
   html: priceChangeTemplate({
    userName,
    productName,
    oldPrice,
    newPrice,
    productUrl,
    baseUrl,
    source,
   }),
   text: `
        ${subjectTitle}
        
        Merhaba ${userName},
        
        ${locationText} "${productName}" ürününün fiyatı ${newPrice < oldPrice ? 'düştü' : 'arttı'}!
        
        Eski Fiyat: ${oldPrice.toFixed(2)} ₺
        Yeni Fiyat: ${newPrice.toFixed(2)} ₺
        Değişim: %${Math.abs(((newPrice - oldPrice) / oldPrice) * 100).toFixed(1)} ${newPrice < oldPrice ? 'düştü' : 'arttı'}
        
        Ürünü görüntülemek için: ${productUrl}
        
        © ${new Date().getFullYear()} Yazıcı Ticaret
      `,
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
 } catch (error) {
  return { success: false, error: error.message };
 }
};

// Favori ürün stok eklendi e-postası gönder
export const sendStockAvailableEmail = async (userEmail, userName, productName, productUrl, source = 'favorite') => {
 try {
  const transporter = createTransporter();

  if (!transporter) {
   return { success: false, error: 'E-posta ayarları eksik' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr';

  // Başlık ve mesajı source'a göre değiştir
  const subjectTitle = source === 'cart' ? 'Sepetteki Ürününüz Stokta' : 'Favori Ürününüz Stokta';
  const locationText = source === 'cart' ? 'Sepetinizdeki' : 'Favorilerinizdeki';

  const mailOptions = {
   from: `Yazıcı Ticaret <${process.env.EMAIL_USER}>`,
   to: userEmail,
   subject: `🎉 ${subjectTitle} - ${productName}`,
   html: stockAvailableTemplate({
    userName,
    productName,
    productUrl,
    baseUrl,
    source,
   }),
   text: `
        ${subjectTitle}
        
        Merhaba ${userName},
        
        ${locationText} "${productName}" ürünü artık stokta!
        
        Ürünü görüntülemek için: ${productUrl}
        
        © ${new Date().getFullYear()} Yazıcı Ticaret
      `,
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
 } catch (error) {
  return { success: false, error: error.message };
 }
};