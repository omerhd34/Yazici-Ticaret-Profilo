"use client";

export default function ProductImportantFeatures({ product, selectedColor = null }) {
 if (!product) return null;

 if (product.category === "Türk Kahve Makineleri") {
  return null;
 }

 let selectedColorObj = null;
 if (selectedColor && product.colors) {
  selectedColorObj = product.colors.find(c => {
   if (typeof c === 'object') {
    return c.name === selectedColor;
   }
   return c === selectedColor;
  });
 }
 if (!selectedColorObj && product.colors && product.colors.length > 0) {
  selectedColorObj = typeof product.colors[0] === 'object' ? product.colors[0] : null;
 }

 const productSpecifications = product.specifications && Array.isArray(product.specifications) ? product.specifications : [];
 const colorSpecifications = selectedColorObj?.specifications || [];

 // Tüm özellikleri birleştir
 let allSpecifications = [...productSpecifications, ...colorSpecifications];

 const isRefrigerator = product.subCategory === "Buzdolabı";
 const isFreezer = product.subCategory === "Derin Dondurucu";
 const isWashingMachine = product.subCategory === "Çamaşır Makinesi";
 const isDryer = product.subCategory === "Kurutma Makinesi";
 const isDishwasher = product.subCategory === "Bulaşık Makinesi";
 const isMicrowave = product.subCategory === "Mikrodalga Fırın";
 const isOven = product.subCategory === "Fırın";
 const isCooktop = product.subCategory === "Set Üstü Ocak";
 const isTV = product.category === "Televizyon";
 const isVacuum = product.category?.toLowerCase().includes("süpürge");
 const isWaterPurification = product.category?.toLowerCase().includes("su arıtma");
 const isAirConditionerIndoorUnit = product.subCategory === "Klima İç Ünite";
 const isAirConditionerOutdoorUnit = product.subCategory === "Klima Dış Ünite";
 const isAirConditionerKit = product.subCategory === "Klima Takımı";
 const isAirConditioner = isAirConditionerIndoorUnit || isAirConditionerOutdoorUnit || isAirConditionerKit;



 // Specifications'tan özellik bulma fonksiyonu
 const findSpecValue = (keyName) => {
  for (const spec of allSpecifications) {
   if (spec.items) {
    const item = spec.items.find(item =>
     item.key && item.key.toLowerCase().includes(keyName.toLowerCase())
    );
    if (item) return item.value;
   }
  }
  return null;
 };

 // Specifications'tan birden fazla anahtar kelime ile arama yapan fonksiyon
 const findSpecValueMultiple = (keyNames) => {
  for (const keyName of keyNames) {
   const result = findSpecValue(keyName);
   if (result) return result;
  }
  return null;
 };

 // Ürün ölçülerini bulma fonksiyonu (hem dimensions hem specifications'tan)
 const getUrunOlculeri = () => {
  let urunOlculeri = null;

  // Önce product.dimensions'tan kontrol et
  if (product.dimensions) {
   const dims = [];
   if (product.dimensions.height) dims.push(`Yükseklik: ${product.dimensions.height} cm`);
   if (product.dimensions.width) dims.push(`Genişlik: ${product.dimensions.width} cm`);
   if (product.dimensions.depth) dims.push(`Derinlik: ${product.dimensions.depth} cm`);
   if (dims.length > 0) {
    urunOlculeri = dims.join(", ");
   }
  }

  // Eğer dimensions yoksa, specifications'tan "Boyutlar" veya "Ürün Ölçüleri" kategorisinden ara
  if (!urunOlculeri) {
   const boyutlarSpec = allSpecifications.find(spec =>
    spec.category && (
     spec.category.toLowerCase().includes('boyutlar') ||
     spec.category.toLowerCase().includes('ölçüler') ||
     spec.category.toLowerCase().includes('ölçü')
    )
   );

   if (boyutlarSpec && boyutlarSpec.items) {
    const boyutItems = [];
    boyutlarSpec.items.forEach(item => {
     if (item.key && item.value) {
      // Yükseklik, Genişlik, Derinlik gibi özellikleri birleştir
      if (item.key.toLowerCase().includes('yükseklik') ||
       item.key.toLowerCase().includes('genişlik') ||
       item.key.toLowerCase().includes('derinlik')) {
       boyutItems.push(`${item.key}: ${item.value}`);
      }
     }
    });
    if (boyutItems.length > 0) {
     urunOlculeri = boyutItems.join(", ");
    } else {
     // Eğer spesifik boyutlar yoksa, tüm öğeleri göster
     const allItems = boyutlarSpec.items.map(item => `${item.key}: ${item.value}`).join(", ");
     if (allItems) {
      urunOlculeri = allItems;
     }
    }
   }
  }

  return urunOlculeri;
 };

 // Önemli özellikleri topla
 const importantFeatures = [];

 if (isRefrigerator) {
  // Buzdolapları için sadece 3 özellik
  const urunOlculeri = getUrunOlculeri();
  if (urunOlculeri) {
   importantFeatures.push({ key: "Ürün Ölçüleri", value: urunOlculeri });
  }
  const tazelikSistemi = findSpecValue("tazelik sistemi");
  if (tazelikSistemi) {
   importantFeatures.push({ key: "Tazelik Sistemi", value: tazelikSistemi });
  }
  const homeConnect = findSpecValue("home connect");
  if (homeConnect) {
   importantFeatures.push({ key: "Home Connect", value: homeConnect });
  }
 } else if (isFreezer) {
  // Derin Dondurucular için 4 özellik
  const urunOlculeri = getUrunOlculeri();
  if (urunOlculeri) {
   importantFeatures.push({ key: "Ürün Ölçüleri", value: urunOlculeri });
  }
  const homeConnect = findSpecValue("home connect");
  if (homeConnect) {
   importantFeatures.push({ key: "Home Connect", value: homeConnect });
  }
  const kapiKoluTipi = findSpecValue("kapı kolu");
  if (kapiKoluTipi) {
   importantFeatures.push({ key: "Kapı Kolu Tipi", value: kapiKoluTipi });
  }
  const kapiYonu = findSpecValue("kapı yönü");
  if (kapiYonu) {
   importantFeatures.push({ key: "Kapı Yönü", value: kapiYonu });
  }
 } else if (isWashingMachine) {
  // Çamaşır Makineleri için 8 özellik
  const urunOlculeri = getUrunOlculeri();
  if (urunOlculeri) {
   importantFeatures.push({ key: "Ürün Ölçüleri", value: urunOlculeri });
  }
  const enerjiVerimlilik = findSpecValue("enerji verimlilik");
  if (enerjiVerimlilik) {
   importantFeatures.push({ key: "Enerji Verimlilik Sınıfı", value: enerjiVerimlilik });
  }
  const sesVerimlilikSinifi = findSpecValue("ses verimlilik sınıfı");
  if (sesVerimlilikSinifi) {
   importantFeatures.push({ key: "Ses verimlilik sınıfı", value: sesVerimlilikSinifi });
  }
  const homeConnect = findSpecValue("home connect");
  if (homeConnect) {
   importantFeatures.push({ key: "Home Connect", value: homeConnect });
  }
  const maksimumSikmaDevri = findSpecValue("maksimum sıkma devri");
  if (maksimumSikmaDevri) {
   importantFeatures.push({ key: "Maksimum sıkma devri (rpm)", value: maksimumSikmaDevri });
  }
  const iDOS = findSpecValue("i-dos");
  if (iDOS) {
   importantFeatures.push({ key: "i-DOS", value: iDOS });
  }
  const maksimumKapasite = findSpecValue("maksimum kapasite");
  if (maksimumKapasite) {
   importantFeatures.push({ key: "Maksimum kapasite (kg)", value: maksimumKapasite });
  }
 } else if (isDryer) {
  const homeConnect = findSpecValue("home connect");
  if (homeConnect) {
   importantFeatures.push({ key: "Home Connect", value: homeConnect });
  }
  const isiPompasi = findSpecValue("pompa");
  if (isiPompasi) {
   importantFeatures.push({ key: "Isı pompası", value: isiPompasi });
  }
  const temizleyenKondenser = findSpecValue("kendi kendini temizleyen kondenser");
  if (temizleyenKondenser) {
   importantFeatures.push({ key: "Kendi Kendini Temizleyen Kondenser", value: temizleyenKondenser });
  }
  const ironAssist = findSpecValue("iron assist");
  if (ironAssist) {
   importantFeatures.push({ key: "Iron Assist", value: ironAssist });
  }
 } else if (isDishwasher) {
  const programSayisi = findSpecValue("program");
  if (programSayisi) {
   importantFeatures.push({ key: "Program sayısı", value: programSayisi });
  }
  const kurutmaSistemi = findSpecValue("kurutma sistemi");
  if (kurutmaSistemi) {
   importantFeatures.push({ key: "Kurutma sistemi", value: kurutmaSistemi });
  }
  const homeConnect = findSpecValue("home connect");
  if (homeConnect) {
   importantFeatures.push({ key: "Home Connect", value: homeConnect });
  }
  const aquaStop = findSpecValue("aquastop");
  if (aquaStop) {
   importantFeatures.push({ key: "AquaStop", value: aquaStop });
  }
  const ekFonksiyonlar = findSpecValue("ek fonksiyonlar");
  if (ekFonksiyonlar) {
   importantFeatures.push({ key: "Ek fonksiyonlar", value: ekFonksiyonlar });
  }
 } else if (isOven) {
  // Fırınlar için 3 özellik:
  const temizlik = findSpecValue("temizlik");
  if (temizlik) {
   importantFeatures.push({ key: "Temizlik", value: temizlik });
  }
  const ekranTuru = findSpecValue("ekran türü");
  if (ekranTuru) {
   importantFeatures.push({ key: "Ekran Türü", value: ekranTuru });
  }
  const teleskopikRaf = findSpecValue("teleskopik raf");
  if (teleskopikRaf) {
   importantFeatures.push({ key: "Teleskopik Raf", value: teleskopikRaf });
  }
  const modSayisi = findSpecValue("kombinasyon modları");
  if (modSayisi) {
   importantFeatures.push({ key: "Isıtma ve Kombinasyon Modlarının Sayısı", value: modSayisi });
  }
 } else if (isMicrowave) {
  // Mikrodalga Fırınlar için 2 özellik: 
  for (const spec of allSpecifications) {
   if (spec.items) {
    const hacimItem = spec.items.find(item => {
     if (!item.key) return false;
     return item.key.trim() === "Hacim" || item.key.toLowerCase().trim() === "hacim";
    });
    if (hacimItem) {
     importantFeatures.push({ key: "Hacim", value: hacimItem.value });
     break;
    }
   }
  }
  for (const spec of allSpecifications) {
   if (spec.items) {
    const gucItem = spec.items.find(item => {
     if (!item.key) return false;
     const keyLower = item.key.toLowerCase();
     const normalized = keyLower
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
     return normalized.includes("mikrodalga") &&
      normalized.includes("guc") &&
      normalized.includes("kademe");
    });
    if (gucItem) {
     importantFeatures.push({ key: "Mikrodalga güç kademeleri (W)", value: gucItem.value });
     break;
    }
   }
  }
  const temizlik = findSpecValue("temizlik");
  if (temizlik) {
   importantFeatures.push({ key: "Temizlik", value: temizlik });
  }
 } else if (isCooktop) {
  // Set Üstü Ocak için 8 özellik: 
  const kullanmaSekli = findSpecValue("kullanma şekli");
  if (kullanmaSekli) {
   importantFeatures.push({ key: "Kullanma Şekli", value: kullanmaSekli });
  }
  const cerceveTuru = findSpecValue("çerçeve türü");
  if (cerceveTuru) {
   importantFeatures.push({ key: "Çerçeve Türü", value: cerceveTuru });
  }
  const ocakGozuSayisiGazli = findSpecValue("ocak gözü sayısı (gazlı)");
  if (ocakGozuSayisiGazli) {
   importantFeatures.push({ key: "Ocak Gözü Sayısı (Gazlı)", value: ocakGozuSayisiGazli });
  }
  const ocakGozuSayisiElektrik = findSpecValue("ocak gözü sayısı (elektrik)");
  if (ocakGozuSayisiElektrik) {
   importantFeatures.push({ key: "Ocak Gözü Sayısı (Elektrik)", value: ocakGozuSayisiElektrik });
  }
  const ocakIzgarasiMalzemesi = findSpecValue("ocak ızgarası malzemesi");
  if (ocakIzgarasiMalzemesi) {
   importantFeatures.push({ key: "Ocak Izgarası Malzemesi", value: ocakIzgarasiMalzemesi });
  }
  const kademeliAlev = findSpecValue("kademelialev");
  if (kademeliAlev) {
   importantFeatures.push({ key: "KademeliAlev", value: kademeliAlev });
  }
  const homeConnect = findSpecValue("home connect");
  if (homeConnect) {
   importantFeatures.push({ key: "Home Connect", value: homeConnect });
  }
  const urunIsmiAile = findSpecValue("ürün ismi/aile");
  if (urunIsmiAile) {
   importantFeatures.push({ key: "Ürün İsmi/Aile", value: urunIsmiAile });
  }
 } else if (isTV) {
  // TV'ler için sadece 3 özellik: 
  const smartTV = findSpecValue("smart tv") ||
   findSpecValue("smart");
  if (smartTV) {
   importantFeatures.push({ key: "Smart TV", value: smartTV });
  }
  for (const spec of allSpecifications) {
   if (spec.items) {
    const ekranItem = spec.items.find(item => {
     if (!item.key) return false;
     return item.key.trim() === "Ekran Büyüklüğü" ||
      item.key.toLowerCase().trim() === "ekran büyüklüğü" ||
      (item.key.toLowerCase().includes("ekran") && item.key.toLowerCase().includes("büyüklük"));
    });
    if (ekranItem) {
     importantFeatures.push({ key: "Ekran Büyüklüğü", value: ekranItem.value });
     break;
    }
   }
  }
  const cozunurluk = findSpecValue("çözünürlük") ||
   findSpecValue("cozunurluk");
  if (cozunurluk) {
   importantFeatures.push({ key: "Çözünürlük", value: cozunurluk });
  }
 } else if (isVacuum) {
  // Süpürgeler için özellikler: 
  const urunOlculeri = getUrunOlculeri();
  if (urunOlculeri) {
   importantFeatures.push({ key: "Ürün Ölçüleri", value: urunOlculeri });
  }
  const filtrelemeSistemi = findSpecValue("filtreleme sistemi") ||
   findSpecValue("filtreleme");
  if (filtrelemeSistemi) {
   importantFeatures.push({ key: "Filtreleme sistemi", value: filtrelemeSistemi });
  }
  const tozHaznesiKapasitesi = findSpecValue("toz haznesi kapasitesi");
  if (tozHaznesiKapasitesi) {
   importantFeatures.push({ key: "Toz haznesi kapasitesi torbalı/torbasız", value: tozHaznesiKapasitesi });
  }
  const hareketYaricapi = findSpecValue("hareket yarıçapı");
  if (hareketYaricapi) {
   importantFeatures.push({ key: "Hareket yarıçapı (m)", value: hareketYaricapi });
  }
  const kabloDolamaYeri = findSpecValue("kablo dolama yeri");
  if (kabloDolamaYeri) {
   importantFeatures.push({ key: "Kablo dolama yeri", value: kabloDolamaYeri });
  }
  const tekerlekSayisi = findSpecValue("tekerlek sayısı");
  if (tekerlekSayisi) {
   importantFeatures.push({ key: "Tekerlek sayısı", value: tekerlekSayisi });
  }
  for (const spec of allSpecifications) {
   if (spec.items) {
    const netAgirlikItem = spec.items.find(item => {
     if (!item.key) return false;
     const keyLower = item.key.toLowerCase();
     return keyLower.includes("net") && keyLower.includes("ağırlık");
    });
    if (netAgirlikItem) {
     importantFeatures.push({ key: "Net Ağırlık", value: netAgirlikItem.value });
     break;
    }
   }
  }
  for (const spec of allSpecifications) {
   if (spec.items) {
    const aksesuarItem = spec.items.find(item => {
     if (!item.key) return false;
     const keyLower = item.key.toLowerCase();
     return (keyLower.includes("aksesuar") || keyLower.includes("aksesuarlar")) &&
      (keyLower.includes("cihaz dışında") || keyLower.includes("cihaz disinda") || keyLower.includes("disinda")) &&
      (keyLower.includes("ağırlık") || keyLower.includes("agirlik") || keyLower.includes("ağırlığı"));
    });
    if (aksesuarItem) {
     importantFeatures.push({ key: "Aksesuarlar cihaz dışındayken süpürgenin ağırlığı", value: aksesuarItem.value });
     break;
    }
   }
  }
 } else if (isAirConditionerOutdoorUnit) {
  // Klima Dış Ünite için 6 özellik 
  const kompresorTipi = findSpecValueMultiple(["kompresör tipi"]);
  if (kompresorTipi) {
   importantFeatures.push({ key: "Kompresör Tipi", value: kompresorTipi });
  }

  const sogutmaEnerjiSinifi = findSpecValueMultiple(["soğutma enerji sınıfı"]);
  if (sogutmaEnerjiSinifi) {
   importantFeatures.push({ key: "Soğutma Enerji Sınıfı", value: sogutmaEnerjiSinifi });
  }

  const isitmaEnerjiSinifi = findSpecValueMultiple(["Isıtma Enerji Sınıfı"]);
  if (isitmaEnerjiSinifi) {
   importantFeatures.push({ key: "Isıtma Enerji Sınıfı", value: isitmaEnerjiSinifi });
  }

  const sogutmaKapasitesi = findSpecValueMultiple(["soğutma kapasitesi"]);
  if (sogutmaKapasitesi) {
   importantFeatures.push({ key: "Soğutma Kapasitesi(BTU)", value: sogutmaKapasitesi });
  }

  const sogutucuGaz = findSpecValueMultiple(["soğutucu gaz"]);
  if (sogutucuGaz) {
   importantFeatures.push({ key: "Soğutucu Gaz", value: sogutucuGaz });
  }

  const ucBoyutluHavaAkim = findSpecValueMultiple(["3 boyutlu hava akımı"]);
  if (ucBoyutluHavaAkim) {
   importantFeatures.push({ key: "3 Boyutlu Hava Akımı", value: ucBoyutluHavaAkim });
  }
 } else if (isAirConditionerIndoorUnit) {
  // Klima İç Ünite için 8 özellik 
  const kompresorTipi = findSpecValueMultiple(["kompresör tipi"]);
  if (kompresorTipi) {
   importantFeatures.push({ key: "Kompresör Tipi", value: kompresorTipi });
  }

  const sogutmaEnerjiSinifi = findSpecValueMultiple(["soğutma enerji sınıfı"]);
  if (sogutmaEnerjiSinifi) {
   importantFeatures.push({ key: "Soğutma Enerji Sınıfı", value: sogutmaEnerjiSinifi });
  }

  const isitmaEnerjiSinifi = findSpecValueMultiple(["Isıtma Enerji Sınıfı"]);
  if (isitmaEnerjiSinifi) {
   importantFeatures.push({ key: "Isıtma Enerji Sınıfı", value: isitmaEnerjiSinifi });
  }

  const sogutmaKapasitesi = findSpecValueMultiple(["soğutma kapasitesi"]);
  if (sogutmaKapasitesi) {
   importantFeatures.push({ key: "Soğutma Kapasitesi(BTU)", value: sogutmaKapasitesi });
  }

  const beklemeEnerjiTuketim = findSpecValueMultiple(["bekleme konumunda enerji tüketim"]);
  if (beklemeEnerjiTuketim) {
   importantFeatures.push({ key: "Bekleme Konumunda Enerji Tüketim", value: beklemeEnerjiTuketim });
  }

  const sogutucuGaz = findSpecValueMultiple(["soğutucu gaz"]);
  if (sogutucuGaz) {
   importantFeatures.push({ key: "Soğutucu Gaz", value: sogutucuGaz });
  }

  const ucBoyutluHavaAkim = findSpecValueMultiple(["3 boyutlu hava akımı"]);
  if (ucBoyutluHavaAkim) {
   importantFeatures.push({ key: "3 Boyutlu Hava Akımı", value: ucBoyutluHavaAkim });
  }

  const agBaglantiTipi = findSpecValueMultiple(["ağ bağlantı tipi"]);
  if (agBaglantiTipi) {
   importantFeatures.push({ key: "Ağ bağlantı tipi", value: agBaglantiTipi });
  }
 } else if (isWaterPurification) {
  // Su Arıtma için 3 özellik: Tank Kapasitesi (Litre), Pompalı Sistem, Günlük Arıtma Kapasitesi (Litre)
  // Filtre Tipleri görünmemeli

  // Tank Kapasitesi (Litre) - verilerde tam olarak "Tank Kapasitesi (Litre)" olarak kayıtlı
  for (const spec of allSpecifications) {
   if (spec.items) {
    const tankItem = spec.items.find(item => {
     if (!item.key) return false;
     const keyLower = item.key.toLowerCase();
     return keyLower.includes("tank") && keyLower.includes("kapasite");
    });
    if (tankItem) {
     importantFeatures.push({ key: "Tank Kapasitesi (Litre)", value: tankItem.value });
     break;
    }
   }
  }

  // Pompalı Sistem - verilerde tam olarak "Pompalı Sistem" olarak kayıtlı
  const pompaliSistem = findSpecValue("pompalı sistem") ||
   findSpecValue("pompali sistem");
  if (pompaliSistem) {
   importantFeatures.push({ key: "Pompalı Sistem", value: pompaliSistem });
  }

  // Günlük Arıtma Kapasitesi (Litre) - verilerde tam olarak "Günlük Arıtma Kapasitesi (Litre)" olarak kayıtlı
  for (const spec of allSpecifications) {
   if (spec.items) {
    const gunlukItem = spec.items.find(item => {
     if (!item.key) return false;
     const keyLower = item.key.toLowerCase();
     return keyLower.includes("günlük") && keyLower.includes("arıtma") && keyLower.includes("kapasite");
    });
    if (gunlukItem) {
     importantFeatures.push({ key: "Günlük Arıtma Kapasitesi (Litre)", value: gunlukItem.value });
     break;
    }
   }
  }
 } else {
  // Diğer ürünler için genel özellikler
  // Boyutlar (eğer varsa)
  if (product.dimensions) {
   const dims = [];
   if (product.dimensions.height) dims.push(`Yükseklik: ${product.dimensions.height} cm`);
   if (product.dimensions.width) dims.push(`Genişlik: ${product.dimensions.width} cm`);
   if (product.dimensions.depth) dims.push(`Derinlik: ${product.dimensions.depth} cm`);
   if (dims.length > 0) {
    importantFeatures.push({ key: "Boyutlar", value: dims.join(", ") });
   }
  }

  // Net Ağırlık
  if (product.netWeight && product.netWeight > 0) {
   importantFeatures.push({ key: "Net Ağırlık", value: `${product.netWeight} kg` });
  }

  // Specifications'tan ilk birkaç önemli özelliği al
  const technicalSpecs = allSpecifications.find(spec =>
   spec.category && (
    spec.category.toLowerCase().includes('teknik') ||
    spec.category.toLowerCase().includes('performans') ||
    spec.category.toLowerCase().includes('özellik')
   )
  );

  if (technicalSpecs && technicalSpecs.items) {
   const topFeatures = technicalSpecs.items.slice(0, 4);
   topFeatures.forEach(item => {
    if (!importantFeatures.find(f => f.key === item.key)) {
     importantFeatures.push({ key: item.key, value: item.value });
    }
   });
  }
 }

 if (importantFeatures.length === 0) {
  return null;
 }

 // Grid class'ını ürün tipine göre belirle
 const gridClass = isAirConditionerIndoorUnit
  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 md:p-6"
  : isAirConditionerOutdoorUnit
   ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-5 md:p-6"
   : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-5 md:p-6";

 return (
  <div className="mt-6 sm:mt-8 md:mt-12 pt-6 sm:pt-8 md:pt-12 border-t">
   <h2 className="font-bold text-xl sm:text-2xl mb-4 sm:mb-5 md:mb-6 text-gray-900">Önemli Özellikler</h2>

   <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className={gridClass}>
     {importantFeatures.map((feature, index) => {
      // Her 4. öğede (klima iç ünite için) veya her 3. öğede (diğer ürünler için) border olmasın
      const columnsPerRow = isAirConditionerIndoorUnit ? 4 : (isAirConditionerOutdoorUnit ? 3 : 3);
      const isLastInRow = (index + 1) % columnsPerRow === 0;
      // Border'ı sadece lg ekranlarda göster (desktop'ta 4 veya 3 sütunlu grid)
      const borderClass = !isLastInRow ? 'lg:border-r lg:border-gray-200 lg:pr-4' : '';

      return (
       <div key={index} className={`flex flex-col ${borderClass}`}>
        <dt className="font-semibold text-indigo-900 text-xs sm:text-sm mb-1">{feature.key}</dt>
        <dd className="text-gray-600 font-medium text-xs sm:text-sm md:text-base break-words">{feature.value}</dd>
       </div>
      );
     })}
    </div>
   </div>
  </div>
 );
}