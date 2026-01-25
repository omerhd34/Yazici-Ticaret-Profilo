import { NextResponse } from 'next/server';

export function middleware(request) {
  // API route'ları için sadece OPTIONS (preflight) isteklerini handle et
  // Diğer istekler için API route'larının kendi CORS header'larını kullanmasına izin ver
  const pathname = request.nextUrl.pathname;
  
  if (pathname.startsWith('/api/') && request.method === 'OPTIONS') {
    // Preflight request için CORS header'ları ekle
    const requestOrigin = request.headers.get('origin');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr';
    
    // İzin verilen origin'ler
    const allowedOrigins = [
      'https://yazici.gen.tr',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];
    
    // Origin kontrolü
    let origin = baseUrl;
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      origin = requestOrigin;
    }
    
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

  // Diğer tüm istekler için normal devam et (API route'ları dahil)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
