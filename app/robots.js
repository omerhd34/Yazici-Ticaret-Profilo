export default function robots() {
 const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr';

 return {
  rules: [
   {
    userAgent: '*',
    allow: '/',
    disallow: [
     '/admin/',
     '/admin-giris/',
     '/api/',
     '/hesabim/',
     '/sepet/',
     '/odeme/',
     '/favoriler/',
     '/giris/',
     '/sifre-sifirla/',
    ],
   },
   {
    userAgent: 'Googlebot',
    allow: '/',
    disallow: [
     '/admin/',
     '/admin-giris/',
     '/api/',
     '/hesabim/',
     '/sepet/',
     '/odeme/',
     '/favoriler/',
     '/giris/',
     '/sifre-sifirla/',
    ],
   },
  ],
  sitemap: `${baseUrl}/sitemap.xml`,
 };
}

