import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { MENU_ITEMS } from '@/app/utils/menuItems';
import { getProductUrl } from '@/app/utils/productUrl';

export default async function sitemap() {
 const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr';

 // Statik sayfalar
 const staticPages = [
  {
   url: baseUrl,
   lastModified: new Date(),
   changeFrequency: 'daily',
   priority: 1,
  },
  {
   url: `${baseUrl}/biz-kimiz`,
   lastModified: new Date(),
   changeFrequency: 'monthly',
   priority: 0.8,
  },
  {
   url: `${baseUrl}/destek`,
   lastModified: new Date(),
   changeFrequency: 'monthly',
   priority: 0.8,
  },
  {
   url: `${baseUrl}/sss`,
   lastModified: new Date(),
   changeFrequency: 'monthly',
   priority: 0.7,
  },
  {
   url: `${baseUrl}/iade-degisim`,
   lastModified: new Date(),
   changeFrequency: 'monthly',
   priority: 0.6,
  },
  {
   url: `${baseUrl}/gizlilik-politikasi`,
   lastModified: new Date(),
   changeFrequency: 'yearly',
   priority: 0.3,
  },
  {
   url: `${baseUrl}/kullanim-kosullari`,
   lastModified: new Date(),
   changeFrequency: 'yearly',
   priority: 0.3,
  },
  {
   url: `${baseUrl}/cerez-politikasi`,
   lastModified: new Date(),
   changeFrequency: 'yearly',
   priority: 0.3,
  },
  {
   url: `${baseUrl}/one-cikan-urunler`,
   lastModified: new Date(),
   changeFrequency: 'weekly',
   priority: 0.9,
  },
 ];

 // Kategori sayfaları
 const categoryPages = MENU_ITEMS.flatMap((item) => {
  const pages = [
   {
    url: `${baseUrl}${item.path}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: item.isSpecial ? 0.9 : 0.8,
   },
  ];

  // Alt kategoriler
  if (item.subCategories) {
   item.subCategories.forEach((subCat) => {
    pages.push({
     url: `${baseUrl}${subCat.path}`,
     lastModified: new Date(),
     changeFrequency: 'daily',
     priority: 0.8,
    });
   });
  }

  return pages;
 });

 // Ürün sayfaları
 let productPages = [];
 try {
  await dbConnect();
  const products = await Product.find({}).select('_id category subCategory colors serialNumber updatedAt').lean();

  productPages = products.flatMap((product) => {
   const pages = [];

   // Ürünün renklerine göre URL oluştur
   if (product.colors && product.colors.length > 0) {
    product.colors.forEach((color) => {
     if (color && typeof color === 'object' && color.serialNumber) {
      const productUrl = getProductUrl(
       { ...product, serialNumber: color.serialNumber },
       color.serialNumber
      );
      pages.push({
       url: `${baseUrl}${productUrl}`,
       lastModified: product.updatedAt || new Date(),
       changeFrequency: 'weekly',
       priority: 0.7,
      });
     }
    });
   } else if (product.serialNumber) {
    // Renk yoksa ana ürün serialNumber'ını kullan
    const productUrl = getProductUrl(product);
    pages.push({
     url: `${baseUrl}${productUrl}`,
     lastModified: product.updatedAt || new Date(),
     changeFrequency: 'weekly',
     priority: 0.7,
    });
   }

   return pages;
  });
 } catch (error) {
  console.error('Sitemap oluşturulurken hata:', error);
 }

 return [...staticPages, ...categoryPages, ...productPages];
}

