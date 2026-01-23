import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

// GET - Kullanıcının kartlarını getir
export async function GET() {
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

  const user = await User.findById(userData.id);

  if (!user) {
   return NextResponse.json(
    { success: false, message: 'Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.' },
    { status: 404 }
   );
  }

  const cardsToReturn = (user.cards || []).map(card => ({
   _id: card._id ? (card._id.toString ? card._id.toString() : String(card._id)) : null,
   title: card.title,
   cardHolder: card.cardHolder,
   cardNumberLast4: card.cardNumberLast4,
   cardNumberMasked: card.cardNumberMasked,
   cardType: card.cardType || 'Kart',
   month: card.month,
   year: card.year,
   cvc: card.cvc || '',
   isDefault: Boolean(card.isDefault),
   createdAt: card.createdAt,
  }));

  return NextResponse.json({
   success: true,
   cards: cardsToReturn,
  });
 } catch (error) {
  return NextResponse.json(
   { success: false, message: 'Kartlar getirilemedi', error: error.message },
   { status: 500 }
  );
 }
}

// POST - Yeni kart ekle
export async function POST(request) {
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

  const body = await request.json();
  const { title, cardNumber, cardHolder, month, year, cvc } = body;

  // CVC validation - boş string kontrolü
  if (!title || !cardNumber || !cardHolder || !month || !year || !cvc || cvc.trim() === '') {
   return NextResponse.json(
    { success: false, message: 'Tüm alanlar doldurulmalıdır', missing: { title: !title, cardNumber: !cardNumber, cardHolder: !cardHolder, month: !month, year: !year, cvc: !cvc || cvc.trim() === '' } },
    { status: 400 }
   );
  }

  // Kart numarasını temizle (boşlukları kaldır)
  const cleanedCardNumber = cardNumber.replace(/\s/g, '');

  // Kart tipini belirle (ilk haneye göre)
  const getCardType = (cardNumber) => {
   if (!cardNumber || cardNumber.length === 0) return 'Kart';
   const firstDigit = cardNumber[0];
   const firstTwoDigits = cardNumber.substring(0, 2);
   const firstFourDigits = cardNumber.substring(0, 4);

   if (firstDigit === '4') return 'Visa';
   if (firstTwoDigits >= '51' && firstTwoDigits <= '55') return 'Mastercard';
   if (firstFourDigits >= '2221' && firstFourDigits <= '2720') return 'Mastercard';
   if (firstFourDigits === '9792') return 'Troy';
   if (firstTwoDigits === '65') return 'Troy';
   if (firstTwoDigits === '34' || firstTwoDigits === '37') return 'Amex';

   return 'Kart';
  };

  const cardType = getCardType(cleanedCardNumber);

  // Kart tipine göre uzunluk kontrolü: American Express 15 haneli, diğerleri 16
  const expectedLength = cardType === 'Amex' ? 15 : 16;
  if (cleanedCardNumber.length !== expectedLength) {
   return NextResponse.json(
    { success: false, message: `Kart numarası ${expectedLength} haneli olmalıdır` },
    { status: 400 }
   );
  }

  // CVC uzunluk: American Express 4 hane, diğerleri 3 hane
  const trimmedCvc = String(cvc).trim();
  const expectedCvcLen = cardType === 'Amex' ? 4 : 3;
  if (trimmedCvc.length !== expectedCvcLen) {
   return NextResponse.json(
    { success: false, message: cardType === 'Amex' ? 'American Express kartlarında güvenlik kodu 4 haneli olmalıdır' : 'CVC kodu 3 haneli olmalıdır' },
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

  // Amex: 15 hane, son 5 gösterilir (•••• •••••• 51251). Diğerleri: 16 hane, son 4 (•••• •••• •••• 1234)
  const cardNumberLast = cardType === 'Amex' ? cleanedCardNumber.slice(-5) : cleanedCardNumber.slice(-4);
  const cardNumberMasked = cardType === 'Amex'
   ? `**** ****** *${cardNumberLast}`
   : `**** **** **** ${cardNumberLast}`;

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

  if (!user.cards) {
   user.cards = [];
  }

  if (body.isDefault && user.cards.length > 0) {
   user.cards.forEach(card => {
    card.isDefault = false;
   });
  }

  // Yeni kart oluştur 
  const newCardData = {
   title: String(title).trim(),
   cardHolder: capitalizeCardHolder(cardHolder),
   cardNumberLast4: String(cardNumberLast),
   cardNumberMasked: String(cardNumberMasked),
   cardType: String(cardType),
   month: String(month),
   year: String(year),
   cvc: trimmedCvc,
   isDefault: Boolean(body.isDefault),
  };

  user.cards.push(newCardData);
  user.markModified('cards');

  try {
   await user.save();
  } catch (saveError) {

   if (saveError.message && saveError.message.includes('cvc')) {
    return NextResponse.json(
     {
      success: false,
      message: 'Kart kaydedilemedi: CVC kodu eksik veya geçersiz. Lütfen tüm kartlarınızı kontrol edin.',
      error: saveError.message,
      details: process.env.NODE_ENV === 'development' ? (saveError.errors || saveError.stack) : undefined
     },
     { status: 500 }
    );
   }

   return NextResponse.json(
    {
     success: false,
     message: 'Kart kaydedilemedi',
     error: saveError.message,
     details: process.env.NODE_ENV === 'development' ? (saveError.errors || saveError.stack) : undefined
    },
    { status: 500 }
   );
  }

  // Veritabanından tekrar oku (fresh data için) - .lean() kullanarak plain object al
  const updatedUser = await User.findById(userData.id).lean();
  if (!updatedUser) {
   return NextResponse.json(
    { success: false, message: 'Kullanıcı bulunamadı' },
    { status: 404 }
   );
  }

  // Kaydedilen kartı al (updatedUser.cards array'inin son elemanı)
  const savedCards = updatedUser.cards || [];
  const newCard = savedCards[savedCards.length - 1];

  if (!newCard) {
   return NextResponse.json(
    { success: false, message: 'Kart kaydedildi ancak alınamadı' },
    { status: 500 }
   );
  }

  const cardToReturn = {
   _id: newCard._id ? (newCard._id.toString ? newCard._id.toString() : String(newCard._id)) : null,
   title: newCard.title,
   cardHolder: newCard.cardHolder,
   cardNumberLast4: newCard.cardNumberLast4,
   cardNumberMasked: newCard.cardNumberMasked,
   cardType: newCard.cardType || 'Kart',
   month: newCard.month,
   year: newCard.year,
   cvc: newCard.cvc || '',
   isDefault: Boolean(newCard.isDefault),
   createdAt: newCard.createdAt,
  };

  const cardsToReturn = savedCards.map(card => ({
   _id: card._id ? (card._id.toString ? card._id.toString() : String(card._id)) : null,
   title: card.title,
   cardHolder: card.cardHolder,
   cardNumberLast4: card.cardNumberLast4,
   cardNumberMasked: card.cardNumberMasked,
   cardType: card.cardType || 'Kart',
   month: card.month,
   year: card.year,
   cvc: card.cvc || '',
   isDefault: Boolean(card.isDefault),
   createdAt: card.createdAt,
  }));

  return NextResponse.json({
   success: true,
   message: 'Kart eklendi',
   card: cardToReturn,
   cards: cardsToReturn,
  });
 } catch (error) {
  return NextResponse.json(
   {
    success: false,
    message: 'Kart eklenemedi',
    error: error.message,
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
   },
   { status: 500 }
  );
 }
}
