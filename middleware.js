import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Sadece API route'ları için CORS header'ları ekle
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Origin'i belirle: request'ten gelen origin veya base URL
    const requestOrigin = request.headers.get('origin');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr';
    
    // İzin verilen origin'ler
    const allowedOrigins = [
      'https://yazici.gen.tr',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];
    
    // Origin kontrolü: eğer request'ten gelen origin izin verilenler arasındaysa kullan, değilse base URL kullan
    let origin = baseUrl;
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      origin = requestOrigin;
    }
    
    // Preflight request için
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Normal request'ler için response'u oluştur ve header'ları ekle
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
