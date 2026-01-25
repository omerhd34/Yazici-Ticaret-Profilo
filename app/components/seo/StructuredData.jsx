"use client";
import { useEffect } from "react";
import { getProductUrl } from "@/app/utils/productUrl";

export function OrganizationSchema({ baseUrl }) {
 useEffect(() => {
  if (typeof document === 'undefined' || !document.head) return;

  const currentBaseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr'));

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.text = JSON.stringify({
   "@context": "https://schema.org",
   "@type": "Organization",
   name: "Yazıcı Ticaret",
   url: currentBaseUrl,
   logo: `${currentBaseUrl}/icon.svg`,
   description: "Profilo ve LG markası beyaz eşya ve elektronik ürünlerinin satışını yapan güvenilir e-ticaret platformu",
   address: {
    "@type": "PostalAddress",
    addressCountry: "TR",
   },
   contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "Turkish",
   },
   sameAs: [
    "https://www.facebook.com/inegolyaziciticaret",
    "https://www.instagram.com/yaziciticaret/",
   ],
  });

  document.head.appendChild(script);

  return () => {
   if (typeof document !== 'undefined' && script && script.parentNode) {
    try {
     script.remove();
    } catch (e) {
     // Element zaten kaldırılmış olabilir
    }
   }
  };
 }, [baseUrl]);

 return null;
}

export function WebSiteSchema({ baseUrl }) {
 useEffect(() => {
  if (typeof document === 'undefined' || !document.head) return;

  const currentBaseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr'));

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.text = JSON.stringify({
   "@context": "https://schema.org",
   "@type": "WebSite",
   name: "Yazıcı Ticaret",
   url: currentBaseUrl,
   potentialAction: {
    "@type": "SearchAction",
    target: {
     "@type": "EntryPoint",
     urlTemplate: `${currentBaseUrl}/arama?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
   },
  });

  document.head.appendChild(script);

  return () => {
   if (typeof document !== 'undefined' && script && script.parentNode) {
    try {
     script.remove();
    } catch (e) {
     // Element zaten kaldırılmış olabilir
    }
   }
  };
 }, [baseUrl]);

 return null;
}

export function ProductSchema({ product, baseUrl, productUrl: propProductUrl }) {
 useEffect(() => {
  if (!product || typeof document === 'undefined' || !document.head) return;

  const finalPrice = product.discountPrice && product.discountPrice < product.price
   ? product.discountPrice
   : product.price;

  const availability = (product.stock || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

  // Ürün URL'ini getProductUrl ile oluştur
  const currentBaseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr'));
  let productUrl = propProductUrl;

  if (!productUrl) {
   // Eğer prop'tan gelmediyse, getProductUrl ile oluştur
   const serialNumber = product.colors && product.colors.length > 0 && typeof product.colors[0] === 'object'
    ? product.colors[0].serialNumber
    : product.serialNumber;
   productUrl = getProductUrl(product, serialNumber);
  }

  const fullProductUrl = productUrl.startsWith('http')
   ? productUrl
   : `${currentBaseUrl}${productUrl}`;

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.text = JSON.stringify({
   "@context": "https://schema.org",
   "@type": "Product",
   name: product.name,
   description: product.description || `${product.name} - ${product.brand || ""} ${product.category || ""}`,
   image: product.images && product.images.length > 0
    ? product.images.map(img => img.startsWith('http') ? img : `${currentBaseUrl}${img}`)
    : [],
   brand: {
    "@type": "Brand",
    name: product.brand || "Yazıcı Ticaret",
   },
   category: product.category,
   sku: product.serialNumber || product._id,
   offers: {
    "@type": "Offer",
    url: fullProductUrl,
    priceCurrency: "TRY",
    price: finalPrice,
    availability: availability,
    priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    seller: {
     "@type": "Organization",
     name: "Yazıcı Ticaret",
    },
   },
   ...(product.rating && {
    aggregateRating: {
     "@type": "AggregateRating",
     ratingValue: product.rating || 0,
     reviewCount: product.reviewCount || 0,
     bestRating: 5,
     worstRating: 1,
    },
   }),
  });

  document.head.appendChild(script);

  return () => {
   if (typeof document !== 'undefined' && script && script.parentNode) {
    try {
     script.remove();
    } catch (e) {
     // Element zaten kaldırılmış olabilir
    }
   }
  };
 }, [product, baseUrl, propProductUrl]);

 return null;
}

export function BreadcrumbSchema({ items, baseUrl }) {
 useEffect(() => {
  if (!items || items.length === 0 || typeof document === 'undefined' || !document.head) return;

  const currentBaseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || 'https://yazici.gen.tr'));

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.text = JSON.stringify({
   "@context": "https://schema.org",
   "@type": "BreadcrumbList",
   itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: `${currentBaseUrl}${item.url}`,
   })),
  });

  document.head.appendChild(script);

  return () => {
   if (typeof document !== 'undefined' && script && script.parentNode) {
    try {
     script.remove();
    } catch (e) {
     // Element zaten kaldırılmış olabilir
    }
   }
  };
 }, [items, baseUrl]);

 return null;
}

