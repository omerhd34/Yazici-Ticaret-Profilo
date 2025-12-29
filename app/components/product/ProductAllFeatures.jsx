"use client";
import { useState, useMemo } from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";

export default function ProductAllFeatures({ product, selectedColor = null }) {
 const [expandedCategories, setExpandedCategories] = useState({});
 const [selectedBundleProductIndex, setSelectedBundleProductIndex] = useState(0);

 const toggleCategory = (index) => {
  setExpandedCategories(prev => ({
   ...prev,
   [index]: !prev[index]
  }));
 };

 // Takım içindeki ürünleri kontrol et
 const currentColorObj = useMemo(() => {
  if (!product || !product.colors || product.colors.length === 0) return null;
  return selectedColor
   ? product.colors.find(c => typeof c === 'object' && c.name === selectedColor)
   : (typeof product.colors[0] === 'object' ? product.colors[0] : null);
 }, [product, selectedColor]);

 const productsInside = currentColorObj?.productsInside;
 const hasBundleProducts = productsInside && Array.isArray(productsInside) && productsInside.length > 0;

 // Eğer takım ürünü varsa, seçilen ürünü kullan
 const displayProduct = useMemo(() => {
  if (!product) return null;
  if (hasBundleProducts && productsInside && productsInside[selectedBundleProductIndex]) {
   return productsInside[selectedBundleProductIndex];
  }
  return product;
 }, [hasBundleProducts, productsInside, selectedBundleProductIndex, product]);

 const displaySelectedColor = useMemo(() => {
  if (hasBundleProducts && productsInside && productsInside[selectedBundleProductIndex]) {
   // Takım içindeki ürünün ilk rengini kullan
   const bundleProduct = productsInside[selectedBundleProductIndex];
   if (bundleProduct.colors && bundleProduct.colors.length > 0) {
    return bundleProduct.colors[0].name || null;
   }
  }
  return selectedColor;
 }, [hasBundleProducts, productsInside, selectedBundleProductIndex, selectedColor]);

 if (!product) return null;

 const hasDimensions = displayProduct.dimensions && (
  displayProduct.dimensions.height || displayProduct.dimensions.width || displayProduct.dimensions.depth
 );

 const dimensions = displayProduct.dimensions;

 let selectedColorObj = null;
 if (displaySelectedColor && displayProduct.colors) {
  selectedColorObj = displayProduct.colors.find(c => {
   if (typeof c === 'object') {
    return c.name === displaySelectedColor;
   }
   return c === displaySelectedColor;
  });
 }
 if (!selectedColorObj && displayProduct.colors && displayProduct.colors.length > 0) {
  selectedColorObj = typeof displayProduct.colors[0] === 'object' ? displayProduct.colors[0] : null;
 }

 const displaySerialNumber = selectedColorObj?.serialNumber || displayProduct.serialNumber;
 const productSpecifications = displayProduct.specifications && Array.isArray(displayProduct.specifications) ? displayProduct.specifications : [];
 const colorSpecifications = selectedColorObj?.specifications || [];
 const displayManualLink = selectedColorObj?.manualLink || displayProduct.manualLink;

 const productFeaturesItems = [];
 if (displayProduct.brand) {
  productFeaturesItems.push({ key: "Marka", value: displayProduct.brand });
 }
 if (displaySerialNumber) {
  productFeaturesItems.push({ key: "Seri Numarası", value: displaySerialNumber });
 }
 if (displayProduct.material) {
  productFeaturesItems.push({ key: "Materyal", value: displayProduct.material });
 }
 if (displayProduct.colors && displayProduct.colors.length > 0) {
  const colorsText = displayProduct.colors.map((color) => {
   const colorName = typeof color === 'object' ? color.name : color;
   return colorName;
  }).join(", ");
  const renkLabel = displayProduct.colors.length === 1 ? "Renk" : "Renkler";
  productFeaturesItems.push({ key: renkLabel, value: colorsText });
 }
 if (displayProduct.tags && displayProduct.tags.length > 0) {
  productFeaturesItems.push({ key: "Etiketler", value: displayProduct.tags.join(", ") });
 }

 // "Boyutlar" kategorisi için items hazırla
 const boyutlarItems = [];
 if (hasDimensions) {
  if (dimensions.height) {
   boyutlarItems.push({ key: "Yükseklik", value: `${dimensions.height} cm` });
  }
  if (dimensions.width) {
   boyutlarItems.push({ key: "Genişlik", value: `${dimensions.width} cm` });
  }
  if (dimensions.depth) {
   boyutlarItems.push({ key: "Derinlik", value: `${dimensions.depth} cm` });
  }
 }
 const hasNetWeight = displayProduct.netWeight !== null && displayProduct.netWeight !== undefined && displayProduct.netWeight > 0;
 if (hasNetWeight) {
  boyutlarItems.push({ key: "Net Ağırlık", value: `${displayProduct.netWeight} kg` });
 }

 // Önce ürün seviyesindeki özellikleri, sonra renk bazlı özellikleri birleştir
 let allSpecifications = [...productSpecifications, ...colorSpecifications];

 // "Genel Özellikler" kategorisini bul veya oluştur
 const genelOzelliklerIndex = allSpecifications.findIndex(
  spec => spec.category && spec.category.toLowerCase().trim() === "genel özellikler"
 );

 // "Boyutlar" veya "Boyutlar ve Ağırlık" kategorisini bul
 const boyutlarIndex = allSpecifications.findIndex(
  spec => {
   const categoryLower = spec.category && spec.category.toLowerCase().trim();
   return categoryLower === "boyutlar" || categoryLower === "boyutlar ve ağırlık";
  }
 );

 let processedSpecifications = [...allSpecifications];

 // "Genel Özellikler" kategorisini işle
 if (genelOzelliklerIndex !== -1) {
  // "Genel Özellikler" kategorisi varsa, ürün özelliklerini en üste ekle, Kullanım Kılavuzu'nu en alta ekle
  const existingItems = processedSpecifications[genelOzelliklerIndex].items || [];
  const finalItems = [...productFeaturesItems, ...existingItems];
  if (displayManualLink) {
   finalItems.push({
    key: "Kullanım Kılavuzu",
    value: displayManualLink,
    isLink: true
   });
  }
  processedSpecifications[genelOzelliklerIndex] = {
   ...processedSpecifications[genelOzelliklerIndex],
   items: finalItems
  };
 } else if (productFeaturesItems.length > 0) {
  // "Genel Özellikler" kategorisi yoksa, oluştur ve en başa ekle
  const finalItems = [...productFeaturesItems];
  if (displayManualLink) {
   finalItems.push({
    key: "Kullanım Kılavuzu",
    value: displayManualLink,
    isLink: true
   });
  }
  processedSpecifications = [
   { category: "Genel Özellikler", items: finalItems },
   ...processedSpecifications
  ];
 } else if (displayManualLink) {
  processedSpecifications = [
   {
    category: "Genel Özellikler",
    items: [{
     key: "Kullanım Kılavuzu",
     value: displayManualLink,
     isLink: true
    }]
   },
   ...processedSpecifications
  ];
 }

 // TV ürünleri için "Boyutlar", diğerleri için "Boyutlar ve Ağırlık" kullan
 const isTelevizyon = displayProduct.category && displayProduct.category.toLowerCase().trim() === "televizyon";
 const boyutlarCategoryName = isTelevizyon ? "Boyutlar" : "Boyutlar ve Ağırlık";

 // "Genel Özellikler" işlendikten SONRA "Boyutlar ve Ağırlık" kategorisini yeniden bul
 const boyutlarIndexAfterProcessing = processedSpecifications.findIndex(
  spec => {
   const categoryLower = spec.category && spec.category.toLowerCase().trim();
   return categoryLower === "boyutlar" || categoryLower === "boyutlar ve ağırlık";
  }
 );

 // "Genel Özellikler" kategorisinin index'ini bul (oluşturulduktan sonra)
 const genelIndexAfterProcessing = processedSpecifications.findIndex(
  spec => spec.category && spec.category.toLowerCase().trim() === "genel özellikler"
 );

 if (boyutlarIndexAfterProcessing !== -1) {
  const existingBoyutlarItems = processedSpecifications[boyutlarIndexAfterProcessing].items || [];
  const existingKeys = existingBoyutlarItems.map(item => item.key);
  const newItems = boyutlarItems.filter(item => !existingKeys.includes(item.key));

  // Mevcut "Boyutlar ve Ağırlık" kategorisindeki tüm item'ları birleştir
  const allBoyutlarItems = newItems.length > 0
   ? [...existingBoyutlarItems, ...newItems]
   : existingBoyutlarItems;

  // Eğer "Genel Özellikler" kategorisi varsa, "Boyutlar ve Ağırlık" kategorisini kaldırıp ondan sonra ekle
  if (genelIndexAfterProcessing !== -1) {
   // Eski "Boyutlar ve Ağırlık" kategorisini kaldır
   processedSpecifications.splice(boyutlarIndexAfterProcessing, 1);
   // "Genel Özellikler" kategorisinden sonra ekle
   processedSpecifications.splice(genelIndexAfterProcessing + 1, 0, {
    category: boyutlarCategoryName,
    items: allBoyutlarItems
   });
  } else {
   // "Genel Özellikler" yoksa, sadece mevcut kategoriyi güncelle
   processedSpecifications[boyutlarIndexAfterProcessing] = {
    ...processedSpecifications[boyutlarIndexAfterProcessing],
    category: boyutlarCategoryName,
    items: allBoyutlarItems
   };
  }
 } else if (boyutlarItems.length > 0) {
  if (genelIndexAfterProcessing !== -1) {
   processedSpecifications.splice(genelIndexAfterProcessing + 1, 0, { category: boyutlarCategoryName, items: boyutlarItems });
  } else {
   processedSpecifications = [
    { category: boyutlarCategoryName, items: boyutlarItems },
    ...processedSpecifications
   ];
  }
 }

 return (
  <div className="mt-6 sm:mt-8 md:mt-12">
   <h2 className="font-bold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 md:mb-6 text-gray-900">Tüm Özellikler</h2>

   {/* Takım İçindeki Ürünler Seçimi */}
   {hasBundleProducts && (
    <div className="mb-3 sm:mb-4 md:mb-6">
     <div className="flex flex-wrap gap-2">
      {productsInside.map((bundleProduct, index) => {
       const bundleProductName = bundleProduct.name || `Ürün ${index + 1}`;
       const isSelected = selectedBundleProductIndex === index;
       return (
        <button
         key={index}
         onClick={() => {
          setSelectedBundleProductIndex(index);
         }}
         className={`px-2.5 py-1.5 sm:px-3 md:px-4 md:py-2 rounded-lg text-xs sm:text-sm md:text-base font-medium transition-colors cursor-pointer ${isSelected
          ? "bg-indigo-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
         {bundleProductName}
        </button>
       );
      })}
     </div>
    </div>
   )}

   <div className="space-y-2 sm:space-y-3 md:space-y-4">
    {processedSpecifications && processedSpecifications.length > 0 ? (
     processedSpecifications.map((spec, specIdx) => {
      const isExpanded = expandedCategories[specIdx] === true;
      const items = spec.items || [];

      return (
       <div key={specIdx} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
         onClick={() => toggleCategory(specIdx)}
         className="w-full flex items-center justify-between p-3 sm:p-3 md:p-4 hover:bg-gray-50 transition cursor-pointer"
        >
         <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-800 pr-2">{spec.category}</h3>
         {isExpanded ? (
          <HiChevronUp className="text-orange-500 shrink-0" size={18} />
         ) : (
          <HiChevronDown className="text-orange-500 shrink-0" size={18} />
         )}
        </button>
        {isExpanded && items && items.length > 0 && (
         <div className="border-t border-gray-200">
          <dl className="divide-y divide-gray-100">
           {items.map((item, itemIdx) => (
            <div key={itemIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 p-3 sm:p-3 md:p-4 hover:bg-gray-50 transition">
             <dt className="font-semibold text-xs sm:text-sm md:text-base text-gray-700">{item.key}</dt>
             <dd className="text-xs sm:text-sm md:text-base text-gray-800 wrap-break-words">
              {item.isLink ? (
               <a
                href={item.value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 underline"
               >
                Kılavuzu İndir
               </a>
              ) : (
               item.value
              )}
             </dd>
            </div>
           ))}
          </dl>
         </div>
        )}
       </div>
      );
     })
    ) : (
     <div className="p-3 sm:p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-gray-600 text-xs sm:text-xs md:text-sm">
       {selectedColorObj ? (
        <>Bu renk için henüz özellik bilgisi eklenmemiş.</>
       ) : (
        <>Bu ürün için henüz özellik bilgisi eklenmemiş.</>
       )}
      </p>
     </div>
    )}
   </div>
  </div>
 );
}
