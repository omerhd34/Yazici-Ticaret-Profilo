import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { sendEmailVerificationEmail } from '@/lib/notifications';

export async function POST(request) {
 try {
  await dbConnect();

  const { email, password, rememberMe } = await request.json();

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
   return NextResponse.json(
    { success: false, message: 'Böyle bir hesap bulunamamıştır.' },
    { status: 401 }
   );
  }

  const hashedPassword = Buffer.from(password).toString('base64');
  if (user.password !== hashedPassword) {
   return NextResponse.json(
    { success: false, message: 'E-posta veya şifre hatalı' },
    { status: 401 }
   );
  }

  // Email doğrulama kontrolü
  if (!user.isEmailVerified) {
   const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
   const verificationCodeExpires = new Date();
   verificationCodeExpires.setHours(verificationCodeExpires.getHours() + 1);
   const codeString = String(verificationCode).trim();

   // Kodu kaydet
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

   // Kodun kaydedildiğinden emin ol
   if (!updatedUser || !updatedUser.emailVerificationCode || updatedUser.emailVerificationCode !== codeString) {
    // Son çare: direkt save() ile
    const retryUser = await User.findById(user._id);
    if (retryUser) {
     retryUser.emailVerificationCode = codeString;
     retryUser.emailVerificationCodeExpires = verificationCodeExpires;
     retryUser.markModified('emailVerificationCode');
     retryUser.markModified('emailVerificationCodeExpires');
     await retryUser.save();
    }
   }

   // Email gönder
   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr';
   const verificationLink = `${baseUrl}/api/user/verify-email?token=${user._id}&code=${codeString}`;

   try {
    await sendEmailVerificationEmail({
     userEmail: user.email,
     userName: user.name,
     verificationCode: codeString,
     verificationLink,
    });
   } catch (emailError) {
    // Email error - silently fail
   }

   return NextResponse.json(
    { success: false, message: 'Email adresinizi doğrulamanız gerekiyor. E-posta adresinize doğrulama kodu gönderildi.', requiresVerification: true, userId: user._id.toString() },
    { status: 403 }
   );
  }

  // Cookie oluştur
  const cookieStore = await cookies();
  const cookieOptions = {
   httpOnly: true,
   secure: process.env.NODE_ENV === 'production',
   sameSite: 'strict',
   path: '/',
  };

  // Remember me durumuna göre cookie süresi ayarla
  if (rememberMe) {
   cookieOptions.maxAge = 60 * 60 * 24 * 30; // 30 gün
  } else {
   cookieOptions.maxAge = 60 * 60 * 24; // 1 gün (tarayıcı kapanınca silinir)
  }

  cookieStore.set('user-session', JSON.stringify({
   id: user._id.toString(),
   email: user.email,
   name: user.name,
  }), cookieOptions);

  return NextResponse.json({
   success: true,
   message: 'Giriş başarılı',
   user: {
    id: user._id,
    name: user.name,
    email: user.email,
   }
  });
 } catch (error) {
  return NextResponse.json(
   { success: false, message: 'Bir hata oluştu' },
   { status: 500 }
  );
 }
}

