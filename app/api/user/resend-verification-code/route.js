import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { sendEmailVerificationEmail } from '@/lib/notifications';

export async function POST(request) {
 try {
  await dbConnect();
  const { userId } = await request.json();

  if (!userId) {
   return NextResponse.json(
    { success: false, message: 'Kullanıcı ID gereklidir.' },
    { status: 400 }
   );
  }

  const user = await User.findById(userId);
  if (!user) {
   return NextResponse.json(
    { success: false, message: 'Kullanıcı bulunamadı.' },
    { status: 404 }
   );
  }

  // Zaten doğrulanmış mı?
  if (user.isEmailVerified) {
   return NextResponse.json(
    { success: true, message: 'Email zaten doğrulanmış.' },
    { status: 200 }
   );
  }

  // Yeni doğrulama kodu oluştur (6 haneli)
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationCodeExpires = new Date();
  verificationCodeExpires.setHours(verificationCodeExpires.getHours() + 1); // 1 saat geçerli

  // Kodun string olduğundan emin ol
  const codeString = String(verificationCode).trim();

  // Kullanıcıyı güncelle 
  user.emailVerificationCode = codeString;
  user.emailVerificationCodeExpires = verificationCodeExpires;
  user.markModified('emailVerificationCode');
  user.markModified('emailVerificationCodeExpires');
  await user.save();

  // Kodun kaydedildiğini kontrol et
  const verifyUser = await User.findById(userId);
  if (!verifyUser || !verifyUser.emailVerificationCode || verifyUser.emailVerificationCode !== codeString) {
   // findByIdAndUpdate ile tekrar dene
   await User.findByIdAndUpdate(
    user._id,
    {
     $set: {
      emailVerificationCode: codeString,
      emailVerificationCodeExpires: verificationCodeExpires,
     }
    },
    { new: true, runValidators: false }
   );
  }

  // Email doğrulama maili gönder
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr';
  const verificationLink = `${baseUrl}/api/user/verify-email?token=${user._id}&code=${codeString}`;

  await sendEmailVerificationEmail({
   userEmail: user.email,
   userName: user.name,
   verificationCode: codeString,
   verificationLink,
  });

  return NextResponse.json(
   { success: true, message: 'Yeni doğrulama kodu e-posta adresinize gönderildi.' },
   { status: 200 }
  );
 } catch (error) {
  return NextResponse.json(
   { success: false, message: 'Bir hata oluştu.' },
   { status: 500 }
  );
 }
}
