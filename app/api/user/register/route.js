import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { sendEmailVerificationEmail } from '@/lib/notifications';

export async function POST(request) {
 try {
  await dbConnect();

  const { firstName, lastName, name, email, phone, password } = await request.json();

  // Validasyon
  if (!firstName || !firstName.trim()) {
   return NextResponse.json(
    { success: false, message: 'Ad alanı zorunludur.' },
    { status: 400 }
   );
  }

  if (!lastName || !lastName.trim()) {
   return NextResponse.json(
    { success: false, message: 'Soyad alanı zorunludur.' },
    { status: 400 }
   );
  }

  const pw = String(password || "");
  if (pw.length < 10) {
   return NextResponse.json(
    { success: false, message: "Şifre en az 10 karakter olmalıdır" },
    { status: 400 }
   );
  }
  const hasUpperCase = /[A-Z]/.test(pw);
  if (!hasUpperCase) {
   return NextResponse.json(
    { success: false, message: "Şifre en az 1 büyük harf içermelidir." },
    { status: 400 }
   );
  }
  const hasSymbol = /[^a-zA-Z0-9]/.test(pw);
  if (!hasSymbol) {
   return NextResponse.json(
    { success: false, message: "Şifre en az 1 özel karakter içermelidir (örn: !, @, #)." },
    { status: 400 }
   );
  }
  const hasSequentialRun = (value, runLen = 3) => {
   const s = String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
   if (s.length < runLen) return false;
   for (let i = 0; i <= s.length - runLen; i++) {
    let inc = true;
    for (let j = 0; j < runLen - 1; j++) {
     const a = s.charCodeAt(i + j);
     const b = s.charCodeAt(i + j + 1);
     if (b !== a + 1) {
      inc = false;
      break;
     }
    }
    if (inc) return true;
   }
   return false;
  };
  if (hasSequentialRun(pw, 3)) {
   return NextResponse.json(
    { success: false, message: "Şifre sıralı harf/rakam içeremez (örn: abc, 123)." },
    { status: 400 }
   );
  }

  // Email format kontrolü
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!email || !emailRegex.test(email)) {
   return NextResponse.json(
    { success: false, message: 'Geçerli bir e-posta adresi giriniz.' },
    { status: 400 }
   );
  }

  // Email kontrolü
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
   return NextResponse.json(
    { success: false, message: 'Bu e-posta adresi zaten kullanılıyor.' },
    { status: 400 }
   );
  }

  // Telefon numarası kontrolü
  if (phone && phone.trim()) {
   const existingUserByPhone = await User.findOne({ phone: phone.trim() });
   if (existingUserByPhone) {
    return NextResponse.json(
     { success: false, message: 'Bu telefon numarası zaten kullanılmaktadır.' },
     { status: 400 }
    );
   }
  }

  const hashedPassword = Buffer.from(password).toString('base64');
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationCodeExpires = new Date();
  verificationCodeExpires.setHours(verificationCodeExpires.getHours() + 1);

  const codeString = String(verificationCode).trim();

  // firstName ve lastName'den name oluştur (geriye dönük uyumluluk için)
  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

  const user = await User.create({
   firstName: firstName.trim(),
   lastName: lastName.trim(),
   name: fullName, // Geriye dönük uyumluluk için
   email: email.toLowerCase(),
   phone,
   password: hashedPassword,
   emailVerificationCode: codeString,
   emailVerificationCodeExpires: verificationCodeExpires,
   isEmailVerified: false,
   notificationPreferences: {
    emailNotifications: true,
    campaignNotifications: true,
   },
  });

  // Hemen kontrol et - fresh query ile
  const freshUser = await User.findById(user._id);
  if (!freshUser) {
   return NextResponse.json(
    { success: false, message: 'Kayıt işlemi başarısız. Lütfen tekrar deneyin.' },
    { status: 500 }
   );
  }

  // Kod kontrolü
  if (!freshUser.emailVerificationCode || freshUser.emailVerificationCode !== codeString) {

   const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
     $set: {
      emailVerificationCode: codeString,
      emailVerificationCodeExpires: verificationCodeExpires,
     }
    },
    { new: true, runValidators: false }
   );

   if (!updatedUser || !updatedUser.emailVerificationCode || updatedUser.emailVerificationCode !== codeString) {
    const retryUser = await User.findById(user._id);
    if (retryUser) {
     retryUser.emailVerificationCode = codeString;
     retryUser.emailVerificationCodeExpires = verificationCodeExpires;
     retryUser.markModified('emailVerificationCode');
     retryUser.markModified('emailVerificationCodeExpires');
     await retryUser.save();

     const finalUser = await User.findById(user._id);
     if (!finalUser || !finalUser.emailVerificationCode || finalUser.emailVerificationCode !== codeString) {
      await User.deleteOne({ _id: user._id });
      return NextResponse.json(
       { success: false, message: 'Kayıt işlemi başarısız. Lütfen tekrar deneyin.' },
       { status: 500 }
      );
     }
    }
   }
  }

  // Email doğrulama maili gönder
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr';
  const verificationLink = `${baseUrl}/api/user/verify-email?token=${user._id}&code=${codeString}`;

  try {
   const emailResult = await sendEmailVerificationEmail({
    userEmail: email.toLowerCase(),
    userName: fullName,
    verificationCode: codeString,
    verificationLink,
   });

   if (!emailResult.success) {
   }
  } catch (emailError) {
   // Email error - silently fail
  }

  return NextResponse.json(
   {
    success: true,
    message: 'Kayıt başarılı. E-posta adresinize doğrulama kodu gönderildi.',
    userId: user._id.toString(),
    requiresVerification: true,
   },
   { status: 201 }
  );
 } catch (error) {
  return NextResponse.json(
   { success: false, message: 'Kayıt işlemi başarısız' },
   { status: 500 }
  );
 }
}

