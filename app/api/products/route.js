import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

// CORS header'larını ekleyen helper function
function addCorsHeaders(response) {
  const origin = process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr';
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// OPTIONS - Preflight request için
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

// GET - Tüm ürünleri getir
export async function GET(request) {
 try {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const subCategory = searchParams.get('subCategory');
  const isNew = searchParams.get('isNew');
  const isFeatured = searchParams.get('isFeatured');
  const search = searchParams.get('search') || searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '50');
  const sort = searchParams.get('sort') || '-createdAt';

  let query = {};

  if (search && search.trim()) {
   const searchTerm = search.trim();
   const searchRegex = new RegExp(searchTerm, 'i');
   query.$or = [
    { name: searchRegex },
    { description: searchRegex },
    { tags: { $in: [searchRegex] } },
    { brand: searchRegex },
    { category: searchRegex },
    { subCategory: searchRegex },
    { serialNumber: searchRegex },
    { 'colors.serialNumber': searchRegex }
   ];
  }

  // Özel kategoriler için özel filtreleme
  if (category === 'Yeniler' || category === 'Yeniler') {
   query.isNew = true;
  } else if (category === 'İndirimler') {
   query.$and = [
    { discountPrice: { $exists: true, $ne: null, $gt: 0 } },
    { $expr: { $lt: ['$discountPrice', '$price'] } }
   ];
  } else if (category) {
   const normalizedCategory = category.trim();
   query.category = { $regex: new RegExp(`^${normalizedCategory.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
  }

  if (subCategory) {
   // Case-insensitive alt kategori araması
   query.subCategory = { $regex: new RegExp(`^${subCategory}$`, 'i') };
  }

  if (isNew === 'true') {
   query.isNew = true;
  }

  if (isFeatured === 'true') {
   query.isFeatured = true;
  }

  let products;

  // Eğer arama varsa text search kullan, yoksa normal query
  if (search && search.trim()) {
   products = await Product.find(query)
    .sort(sort)
    .limit(limit)
    .lean();
  } else {
   products = await Product.find(query)
    .sort(sort)
    .limit(limit)
    .lean();
  }

  // rating/reviewCount alanları bazı eski kayıtlarda hatalı kalabiliyor.
  // Liste/kart tarafında tutarlı görünmesi için ratings dizisinden yeniden hesapla.
  const normalizedProducts = (products || []).map((p) => {
   const ratingsArr = Array.isArray(p?.ratings) ? p.ratings : [];
   const reviewCount = ratingsArr.length;
   const avgRaw = reviewCount > 0
    ? ratingsArr.reduce((sum, r) => sum + (Number(r?.rating) || 0), 0) / reviewCount
    : 0;
   const rating = Math.round(avgRaw * 10) / 10;
   return { ...p, rating, reviewCount };
  });

  const response = NextResponse.json({ success: true, data: normalizedProducts });
  return addCorsHeaders(response);
 } catch (error) {
  const response = NextResponse.json(
   { success: false, error: 'Ürünler getirilemedi' },
   { status: 500 }
  );
  return addCorsHeaders(response);
 }
}

// POST - Yeni ürün ekle (Admin)
export async function POST(request) {
 try {
  // Admin kontrolü
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin-session');

  if (!adminSession || adminSession.value !== 'authenticated') {
   return NextResponse.json(
    { success: false, error: 'Yetkisiz erişim. Admin girişi gereklidir.' },
    { status: 401 }
   );
  }

  await dbConnect();

  const body = await request.json();

  // Renk bazlı seri numarası validasyonu
  if (!body.colors || !Array.isArray(body.colors) || body.colors.length === 0) {
   return NextResponse.json(
    { success: false, error: 'En az bir renk eklemelisiniz!' },
    { status: 400 }
   );
  }

  // Her renk için seri numarası kontrolü
  const colorSerialNumbers = [];
  for (const color of body.colors) {
   if (!color.serialNumber || !color.serialNumber.trim()) {
    return NextResponse.json(
     { success: false, error: `${color.name || 'Renk'} için seri numarası gereklidir!` },
     { status: 400 }
    );
   }
   const serialNumber = color.serialNumber.trim();

   // Renk seviyesinde seri numarası benzersizliği kontrolü
   const existingProduct = await Product.findOne({
    'colors.serialNumber': serialNumber
   });
   if (existingProduct) {
    return NextResponse.json(
     { success: false, error: `Seri numarası "${serialNumber}" zaten kullanılıyor!` },
     { status: 400 }
    );
   }
   colorSerialNumbers.push(serialNumber);
  }

  // Slug oluştur
  const slug = body.name
   .toLowerCase()
   .replace(/ğ/g, 'g')
   .replace(/ü/g, 'u')
   .replace(/ş/g, 's')
   .replace(/ı/g, 'i')
   .replace(/ö/g, 'o')
   .replace(/ç/g, 'c')
   .replace(/[^a-z0-9]+/g, '-')
   .replace(/^-+|-+$/g, '');

  // Fiyat validasyonu
  const price = parseFloat(body.price);
  if (isNaN(price) || price <= 0) {
   return NextResponse.json(
    { success: false, error: 'Fiyat geçerli bir pozitif sayı olmalıdır!' },
    { status: 400 }
   );
  }

  // İndirimli fiyat validasyonu
  if (body.discountPrice !== undefined && body.discountPrice !== null && body.discountPrice !== '') {
   const discountPrice = parseFloat(body.discountPrice);

   if (isNaN(discountPrice) || discountPrice <= 0) {
    return NextResponse.json(
     { success: false, error: 'İndirimli fiyat pozitif bir sayı olmalıdır!' },
     { status: 400 }
    );
   }

   if (discountPrice >= price) {
    return NextResponse.json(
     { success: false, error: 'İndirimli fiyat normal fiyattan küçük olmalıdır!' },
     { status: 400 }
    );
   }
  }

  // productData oluştururken renk bazlı verileri ekle
  const productData = {
   name: body.name,
   description: body.description,
   price: price, // Varsayılan fiyat (ilk rengin fiyatı)
   discountPrice: body.discountPrice || null,
   category: body.category,
   subCategory: body.subCategory || '',
   images: body.images || [], // Varsayılan resimler (ilk rengin resimleri)
   colors: body.colors || [],
   stock: body.stock || 0, // Toplam stok
   brand: body.brand || '',
   material: body.material || '',
   tags: body.tags || [],
   isNew: body.isNew || false,
   isFeatured: body.isFeatured || false,
   serialNumber: body.serialNumber || '', // Opsiyonel, artık renk seviyesinde tutuluyor
   dimensions: body.dimensions || { height: null, width: null, depth: null },
   netWeight: body.netWeight || null,
   specifications: body.specifications || [],
   slug: `${slug}-${Date.now()}`,
  };

  // İlk rengin fiyatını ve resimlerini varsayılan olarak kullan
  // Renk bazlı stokların toplamını hesapla
  if (body.colors && body.colors.length > 0) {
   productData.price = body.colors[0].price || price;
   productData.discountPrice = body.colors[0].discountPrice || null;
   productData.images = body.colors[0].images || [];
   productData.serialNumber = body.colors[0].serialNumber || '';
   // Renk bazlı stokların toplamını hesapla
   productData.stock = body.colors.reduce((sum, color) => {
    return sum + (Number(color.stock) || 0);
   }, 0);
  }

  let product;
  try {
   product = await Product.create(productData);
  } catch (createError) {
   if (createError.name === 'ValidationError') {
    const validationErrors = Object.values(createError.errors || {}).map(err => err.message).join(', ');
    return NextResponse.json(
     { success: false, error: `Validasyon hatası: ${validationErrors}` },
     { status: 400 }
    );
   }
   if (createError.code === 11000) {
    // Duplicate key error
    const field = Object.keys(createError.keyPattern || {})[0];
    return NextResponse.json(
     { success: false, error: `${field} zaten kullanılıyor!` },
     { status: 400 }
    );
   }
   throw createError;
  }

  const response = NextResponse.json({ success: true, data: product }, { status: 201 });
  return addCorsHeaders(response);
 } catch (error) {
  const response = NextResponse.json(
   {
    success: false,
    error: error.message || 'Ürün eklenemedi',
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
   },
   { status: 500 }
  );
  return addCorsHeaders(response);
 }
}