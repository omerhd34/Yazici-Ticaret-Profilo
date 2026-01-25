const axios = require('axios');
const BASE_URL = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://yazici.gen.tr";
const ADMIN_COOKIE = process.env.ADMIN_COOKIE || "admin-session=authenticated";

let products;
(async () => {
 try {
  const productsModule = await import('./products.js');
  products = productsModule.products;
 } catch (importError) {
  try {
   const productsModule = require('./products.js');
   products = productsModule.products;
  } catch (requireError) {
   process.exit(1);
  }
 }
})();

const normalizeColorName = (v) =>
 String(v || "")
  .trim()
  .toLowerCase()
  .replace(/İ/g, "i")
  .replace(/I/g, "i")
  .replace(/ı/g, "i")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "");

const COLOR_HEX_MAP = {
 siyah: "#000000",
 beyaz: "#ffffff",
 kirmizi: "#ef4444",
 mavi: "#3b82f6",
 yesil: "#22c55e",
 sari: "#facc15",
 turuncu: "#f97316",
 mor: "#a855f7",
 pembe: "#ec4899",
 gri: "#9ca3af",
 lacivert: "#1e3a8a",
 kahverengi: "#92400e",
 bej: "#e5d3b3",
};

const inferHexCode = (name) => {
 const raw = String(name || "").trim();
 if (!raw) return "";
 if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw)) return raw;
 const key = normalizeColorName(raw);
 return COLOR_HEX_MAP[key] || "";
};

const normalizeColors = (colors) => {
 const arr = Array.isArray(colors) ? colors : [];
 return arr
  .map((c) => {
   if (typeof c === "string") {
    const name = c.trim();
    if (!name) return null;
    return {
     name,
     hexCode: inferHexCode(name) || undefined,
     price: 0,
     discountPrice: null,
     serialNumber: "",
     images: [],
     stock: 0,
     manualLink: "",
    };
   }
   if (c && typeof c === "object") {
    const name = String(c.name || "").trim();
    if (!name) return null;
    const hexCode = c.hexCode ? String(c.hexCode).trim() : "";
    return {
     name,
     hexCode: (hexCode || inferHexCode(name) || undefined),
     price: c.price !== undefined ? Number(c.price) : 0,
     discountPrice: c.discountPrice !== undefined && c.discountPrice !== null ? Number(c.discountPrice) : null,
     serialNumber: c.serialNumber ? String(c.serialNumber).trim() : "",
     images: Array.isArray(c.images) ? c.images : [],
     stock: c.stock !== undefined ? Number(c.stock) : 0,
     specifications: Array.isArray(c.specifications) ? c.specifications : [],
     manualLink: c.manualLink ? String(c.manualLink).trim() : "",
     productsInside: Array.isArray(c.productsInside) ? c.productsInside : [],
    };
   }
   return null;
  })
  .filter(Boolean);
};

async function addProduct(product) {
 try {
  const normalizedColors = normalizeColors(product.colors);

  if (normalizedColors.length === 0) {
   return { success: false, error: "En az bir renk eklemelisiniz!" };
  }

  const defaultPrice = normalizedColors[0].price || 0;
  const defaultDiscountPrice = normalizedColors[0].discountPrice !== null ? normalizedColors[0].discountPrice : null;
  const defaultImages = normalizedColors[0].images.length > 0 ? normalizedColors[0].images : [];
  const defaultSerialNumber = normalizedColors[0].serialNumber || "";

  const payload = {
   ...product,
   price: defaultPrice,
   discountPrice: defaultDiscountPrice,
   images: defaultImages,
   serialNumber: defaultSerialNumber,
   colors: normalizedColors,
  };

  const response = await axios.post(`${BASE_URL}/api/products`, payload, {
   headers: {
    "Content-Type": "application/json",
    "Cookie": ADMIN_COOKIE
   }
  });

  const data = response.data;

  if (data.success) {
   return { success: true, data: data.data };
  } else {
   return { success: false, error: data.error };
  }
 } catch (error) {
  const errorMessage = error.response?.data?.error || error.message;
  return { success: false, error: errorMessage };
 }
}

async function addMultipleProducts(productsArray) {
 const results = [];
 let successCount = 0;
 let errorCount = 0;


 for (let i = 0; i < productsArray.length; i++) {
  const product = productsArray[i];

  if (!product.name || !product.description) {
   continue;
  }


  const result = await addProduct(product);
  results.push({ product: product.name, ...result });

  if (result.success) {
   successCount++;
  } else {
   errorCount++;
  }

  if (i < productsArray.length - 1) {
   await new Promise(resolve => setTimeout(resolve, 500));
  }
 }
 return results;
}

if (typeof require !== 'undefined' && require.main === module) {
 (async () => {
  let attempts = 0;
  while (!products && attempts < 50) {
   await new Promise(resolve => setTimeout(resolve, 100));
   attempts++;
  }

  if (!products) {
   process.exit(1);
  }

  addMultipleProducts(products)
   .then(results => {
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    console.log(`\nSonuçlar:`);
    console.log(`Başarılı: ${successCount}`);
    console.log(`Hatalı: ${errorCount}`);
    console.log(`Toplam: ${results.length}`);

    results.forEach((result, index) => {
     if (result.success) {
      console.log(`✓ ${index + 1}. ${result.product}`);
     } else {
      console.error(`✗ ${index + 1}. ${result.product}: ${result.error || 'Bilinmeyen hata'}`);
     }
    });

    setTimeout(() => {
     process.exit(errorCount > 0 ? 1 : 0);
    }, 200);
   })
   .catch(error => {
    setTimeout(() => {
     process.exit(1);
    }, 200);
   });
 })();
} else {
 if (typeof window !== 'undefined') {
  window.addProduct = addProduct;
  window.addMultipleProducts = addMultipleProducts;
  window.products = products;
 }
}