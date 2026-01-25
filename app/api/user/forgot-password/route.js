import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request) {
 try {
  await dbConnect();

  const { email } = await request.json();

  if (!email) {
   return NextResponse.json(
    { success: false, message: 'E-posta adresi gereklidir' },
    { status: 400 }
   );
  }

  // Kullanıcıyı bul
  const user = await User.findOne({ email: email.toLowerCase() });

  // Kullanıcı yoksa hata döndür
  if (!user) {
   return NextResponse.json({
    success: false,
    message: 'Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.',
   }, { status: 404 });
  }

  // Reset token oluştur
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordToken = crypto
   .createHash('sha256')
   .update(resetToken)
   .digest('hex');

  // Token'ı ve süresini kaydet (1 saat geçerli)
  user.resetPasswordToken = resetPasswordToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 saat
  await user.save();

  // Reset URL oluştur
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr'}/sifre-sifirla?token=${resetToken}`;

  // E-posta gönder
  try {
   await sendPasswordResetEmail(user.email, resetUrl);
  } catch (emailError) {
   // E-posta gönderme hatası olsa bile token kaydedildi, kullanıcıya bilgi ver
   // Development modunda hata olsa bile devam et
   if (process.env.NODE_ENV === 'production') {
    // Production'da e-posta hatası kritik, logla ve admin'e bildir
   }
  }

  return NextResponse.json({
   success: true,
   message: 'Şifre sıfırlama linki e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.',
   // Development için token'ı döndür (production'da kaldırılmalı)
   ...(process.env.NODE_ENV === 'development' && { resetUrl }),
  });
 } catch (error) {
  return NextResponse.json(
   { success: false, message: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
   { status: 500 }
  );
 }
}

