import "./globals.css";
import ClientProviders from "./ClientProviders";

export const metadata = {
 metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr'),
 title: {
  default: 'Yazıcı Ticaret',
 },
 description: 'Yazıcı Ticaret\'e hoş geldiniz! Profilo ve LG markası beyaz eşya ve elektronik ürünlerinde en uygun fiyatlar. Buzdolabı, çamaşır makinesi, bulaşık makinesi, klima ve daha fazlası. Tüm Türkiye\'ye nakliye ve montaj hizmeti.',
 icons: {
  icon: '/icon.svg',
  shortcut: '/icon.svg',
  apple: '/icon.svg',
 },
 keywords: [
  'profilo',
  'lg',
  'beyaz eşya',
  'elektronik',
  'buzdolabı',
  'çamaşır makinesi',
  'bulaşık makinesi',
  'klima',
  'ankastre',
  'e-ticaret',
  'yazıcı ticaret',
  'profilo satış',
  'beyaz eşya satış',
  'elektronik ürünler'
 ],
 creator: 'Ömer Halis Demir',
 openGraph: {
  type: 'website',
  locale: 'tr_TR',
  url: process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr',
  siteName: 'Yazıcı Ticaret',
  title: 'Yazıcı Ticaret',
  description: 'Profilo ve LG markası beyaz eşya ve elektronik ürünlerinde en uygun fiyatlar. Tüm Türkiye\'ye nakliye ve montaj hizmeti.',
 },
 robots: {
  index: true,
  follow: true,
  googleBot: {
   index: true,
   follow: true,
   'max-video-preview': -1,
   'max-image-preview': 'large',
   'max-snippet': -1,
  },
  yandex: {
   index: true,
   follow: true,
  },
 },
 verification: {
  // https://search.google.com/search-console/about
  google: '',
 },
};

export default function RootLayout({ children }) {
 return (
  <html lang="tr">
   <body className="antialiased min-h-screen flex flex-col">
    <ClientProviders>
     {children}
    </ClientProviders>
   </body>
  </html>
 );
}

