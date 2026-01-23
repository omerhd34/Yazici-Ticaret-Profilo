import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

// PUT - Kartı güncelle
export async function PUT(request, { params }) {
 try {
  await dbConnect();

  const cookieStore = await cookies();
  const session = cookieStore.get('user-session');

  if (!session || !session.value) {
   return NextResponse.json(
    { success: false, message: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.' },
    { status: 401 }
   );
  }

  let userData;
  try {
   userData = JSON.parse(session.value);
  } catch (parseError) {
   return NextResponse.json(
    { success: false, message: 'Oturum hatası. Lütfen tekrar giriş yapın.' },
    { status: 401 }
   );
  }

  if (!userData || !userData.id) {
   return NextResponse.json(
    { success: false, message: 'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.' },
    { status: 401 }
   );
  }

  const resolvedParams = params instanceof Promise ? await params : params;
  const { id } = resolvedParams;
  const body = await request.json();

  if (!id) {
   return NextResponse.json(
    { success: false, message: 'Kart ID bulunamadı' },
    { status: 400 }
   );
  }

  const user = await User.findById(userData.id);

  if (!user) {
   return NextResponse.json(
    { success: false, message: 'Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.' },
    { status: 404 }
   );
  }

  if (!user.cards || user.cards.length === 0) {
   return NextResponse.json(
    { success: false, message: 'Kart bulunamadı' },
    { status: 404 }
   );
  }

  // Kartı bul - id string veya ObjectId olabilir
  const card = user.cards.find(c => {
   const cardId = c._id ? (c._id.toString ? c._id.toString() : String(c._id)) : null;
   return cardId === id || cardId === String(id);
  });

  if (!card) {
   return NextResponse.json(
    { success: false, message: 'Kart bulunamadı' },
    { status: 404 }
   );
  }

  // Eğer varsayılan yapılıyorsa, diğer kartları varsayılan olmaktan çıkar
  if (body.isDefault) {
   user.cards.forEach(c => {
    if (c._id.toString() !== id) {
     c.isDefault = false;
    }
   });
  }

  // Kart sahibi adını capitalize et (her kelimenin ilk harfini büyük yap)
  const capitalizeCardHolder = (name) => {
   if (!name) return '';
   return name
    .trim()
    .split(/\s+/)
    .map(word => {
     if (word.length === 0) return word;
     return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
  };

  if (body.title) card.title = body.title;
  if (body.cardHolder) card.cardHolder = capitalizeCardHolder(body.cardHolder);
  if (body.month) card.month = body.month;
  if (body.year) card.year = body.year;
  if (body.cvc) {
   const trimmedCvc = String(body.cvc).trim();
   const isAmex = (card.cardType || '').toLowerCase() === 'amex';
   const expectedCvcLen = isAmex ? 4 : 3;
   if (trimmedCvc.length !== expectedCvcLen) {
    return NextResponse.json(
     { success: false, message: isAmex ? 'American Express kartlarında güvenlik kodu 4 haneli olmalıdır' : 'CVC kodu 3 haneli olmalıdır' },
     { status: 400 }
    );
   }
   card.cvc = trimmedCvc;
  }
  if (body.isDefault !== undefined) card.isDefault = body.isDefault;

  user.markModified('cards');

  try {
   await user.save();
  } catch (saveError) {
   return NextResponse.json(
    {
     success: false,
     message: 'Kart güncellenemedi',
     error: saveError.message,
     details: process.env.NODE_ENV === 'development' ? (saveError.errors || saveError.stack) : undefined
    },
    { status: 500 }
   );
  }

  // Güncellenmiş kullanıcıyı tekrar oku
  const updatedUser = await User.findById(userData.id);
  if (!updatedUser) {
   return NextResponse.json(
    { success: false, message: 'Kullanıcı bulunamadı' },
    { status: 404 }
   );
  }

  // Güncellenmiş kartı bul
  const updatedCard = updatedUser.cards.find(c => {
   const cardId = c._id ? (c._id.toString ? c._id.toString() : String(c._id)) : null;
   return cardId === id || cardId === String(id);
  });

  if (!updatedCard) {
   return NextResponse.json(
    { success: false, message: 'Güncellenmiş kart bulunamadı' },
    { status: 404 }
   );
  }

  const cardToReturn = {
   _id: updatedCard._id ? (updatedCard._id.toString ? updatedCard._id.toString() : String(updatedCard._id)) : null,
   title: updatedCard.title,
   cardHolder: updatedCard.cardHolder,
   cardNumberLast4: updatedCard.cardNumberLast4,
   cardNumberMasked: updatedCard.cardNumberMasked,
   cardType: updatedCard.cardType || 'Kart',
   month: updatedCard.month,
   year: updatedCard.year,
   cvc: updatedCard.cvc || '',
   isDefault: Boolean(updatedCard.isDefault),
   createdAt: updatedCard.createdAt,
  };

  // Tüm kartları döndür (frontend state güncellemesi için)
  const allCards = (updatedUser.cards || []).map(c => ({
   _id: c._id ? (c._id.toString ? c._id.toString() : String(c._id)) : null,
   title: c.title,
   cardHolder: c.cardHolder,
   cardNumberLast4: c.cardNumberLast4,
   cardNumberMasked: c.cardNumberMasked,
   cardType: c.cardType || 'Kart',
   month: c.month,
   year: c.year,
   cvc: c.cvc || '',
   isDefault: Boolean(c.isDefault),
   createdAt: c.createdAt,
  }));

  return NextResponse.json({
   success: true,
   message: 'Kart güncellendi',
   card: cardToReturn,
   cards: allCards,
  });
 } catch (error) {
  return NextResponse.json(
   {
    success: false,
    message: 'Kart güncellenemedi',
    error: error.message,
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
   },
   { status: 500 }
  );
 }
}

// DELETE - Kartı sil
export async function DELETE(request, { params }) {
 try {
  await dbConnect();

  const cookieStore = await cookies();
  const session = cookieStore.get('user-session');

  if (!session || !session.value) {
   return NextResponse.json(
    { success: false, message: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.' },
    { status: 401 }
   );
  }

  let userData;
  try {
   userData = JSON.parse(session.value);
  } catch (parseError) {
   return NextResponse.json(
    { success: false, message: 'Oturum hatası. Lütfen tekrar giriş yapın.' },
    { status: 401 }
   );
  }

  if (!userData || !userData.id) {
   return NextResponse.json(
    { success: false, message: 'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.' },
    { status: 401 }
   );
  }

  const resolvedParams = params instanceof Promise ? await params : params;
  const { id } = resolvedParams;

  if (!id) {
   return NextResponse.json(
    { success: false, message: 'Kart ID bulunamadı' },
    { status: 400 }
   );
  }

  const user = await User.findById(userData.id);

  if (!user) {
   return NextResponse.json(
    { success: false, message: 'Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.' },
    { status: 404 }
   );
  }

  const cardIndex = user.cards?.findIndex(c => c._id.toString() === id);

  if (cardIndex === -1 || cardIndex === undefined) {
   return NextResponse.json(
    { success: false, message: 'Kart bulunamadı' },
    { status: 404 }
   );
  }

  user.cards.splice(cardIndex, 1);
  user.markModified('cards');

  try {
   // validateBeforeSave: false ile validation'ı bypass et (sadece DELETE için)
   // Çünkü kalan kartlarda CVC eksik olabilir (eski kartlar)
   await user.save({ validateBeforeSave: false });
  } catch (saveError) {
   return NextResponse.json(
    {
     success: false,
     message: 'Kart silinemedi',
     error: saveError.message,
     details: process.env.NODE_ENV === 'development' ? (saveError.errors || saveError.stack) : undefined
    },
    { status: 500 }
   );
  }

  return NextResponse.json({
   success: true,
   message: 'Kart silindi',
  });
 } catch (error) {
  return NextResponse.json(
   {
    success: false,
    message: 'Kart silinemedi',
    error: error.message,
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
   },
   { status: 500 }
  );
 }
}
