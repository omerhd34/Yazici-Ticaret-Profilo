"use client";
import { useState, useEffect } from "react";
import { HiX, HiUpload, HiChevronDown, HiChevronUp, HiPlus } from "react-icons/hi";
import Image from "next/image";
import { MENU_ITEMS } from "@/app/utils/menuItems";
import axiosInstance from "@/lib/axios";

const MAX_IMAGES = 15;
const MAX_DESCRIPTION = 200;
const MAX_NAME = 100;
const MAX_BRAND = 50;

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
 if (!raw) return undefined;
 if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw)) return raw;
 const key = normalizeColorName(raw);
 return COLOR_HEX_MAP[key];
};


const subCategoryOptions = {};
MENU_ITEMS.forEach((item) => {
 if (item.subCategories && item.subCategories.length > 0) {
  subCategoryOptions[item.name] = item.subCategories.map((subCat) => subCat.name);
 }
});

const categoryBrands = {
 "Buzdolabı": ["Profilo", "LG"],
 "Kurutma Makinesi": ["Profilo", "LG"],
 "Set Üstü Ocak": ["Profilo", "LG"],
 "Derin Dondurucu": ["Profilo", "LG"],
 "Bulaşık Makinesi": ["Profilo", "LG"],
 "Mikrodalga Fırın": ["Profilo", "LG"],
 "Çamaşır Makinesi": ["Profilo", "LG"],
 "Fırın": ["Profilo", "LG"],

 "Televizyon": ["Profilo", "LG"],

 "Elektrikli Süpürge": ["Profilo", "LG"],

 "Ankastre Fırın": ["Profilo", "LG"],
 "Ankastre Mikrodalga Fırın": ["Profilo", "LG"],
 "Ankastre Ocak": ["Profilo", "LG"],
 "Ankastre Aspiratör / Davlumbaz": ["Profilo", "LG"],
 "Ankastre Bulaşık Makinesi": ["Profilo", "LG"],
 "Ankastre Setler": ["Profilo", "LG"],

 "Klima": ["Profilo", "LG"],
 "Su Sebili ve Su Arıtma": ["Profilo", "LG"],
 "Türk Kahve Makineleri": ["Profilo", "LG"],
};

export default function ProductFormModal({ show, editingProduct, onClose, onSuccess, onError }) {
 const [form, setForm] = useState({
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  category: "",
  subCategory: "",
  images: [],
  colors: [],
  stock: "",
  brand: "",
  material: "",
  tags: "",
  serialNumber: "",
  specifications: [],
  isNew: false,
  isFeatured: false,
 });

 const [uploadingImage, setUploadingImage] = useState(false);
 const [imagePreview, setImagePreview] = useState([]);
 const [loading, setLoading] = useState(false);
 const [isProductSpecsExpanded, setIsProductSpecsExpanded] = useState(false);
 const [isColorsExpanded, setIsColorsExpanded] = useState(false);

 // Editing product veya show değiştiğinde formu doldur/temizle
 useEffect(() => {
  if (show && editingProduct) {
   let colors = [];
   if (Array.isArray(editingProduct.colors) && editingProduct.colors.length > 0) {
    if (typeof editingProduct.colors[0] === 'string') {
     colors = editingProduct.colors.map((name, idx) => ({
      name: name.trim(),
      hexCode: inferHexCode(name),
      price: editingProduct.price || 0,
      discountPrice: editingProduct.discountPrice || null,
      serialNumber: editingProduct.serialNumber ? `${editingProduct.serialNumber}-${idx + 1}` : "",
      images: editingProduct.images || [],
      stock: editingProduct.stock || 0,
     }));
    } else {
     colors = editingProduct.colors.map(c => ({
      name: c.name || "",
      hexCode: c.hexCode || inferHexCode(c.name),
      price: c.price || editingProduct.price || 0,
      discountPrice: c.discountPrice !== undefined ? c.discountPrice : null,
      serialNumber: c.serialNumber || "",
      images: c.images || [],
      stock: c.stock !== undefined ? c.stock : editingProduct.stock || 0,
      specifications: c.specifications && Array.isArray(c.specifications) ? c.specifications : [],
      manualLink: c.manualLink || "",
     }));
    }
   }

   // Renk bazlı stokların toplamını hesapla
   const totalStock = colors.reduce((sum, color) => {
    return sum + (parseInt(color.stock || 0) || 0);
   }, 0);

   setForm({
    name: editingProduct.name || "",
    description: editingProduct.description || "",
    price: editingProduct.price || "",
    discountPrice: editingProduct.discountPrice || "",
    category: editingProduct.category || "",
    subCategory: editingProduct.subCategory || "",
    images: editingProduct.images || [],
    colors: colors,
    stock: totalStock, // Renk bazlı stokların toplamı
    brand: editingProduct.brand || "",
    material: editingProduct.material || "",
    tags: editingProduct.tags ? editingProduct.tags.join(", ") : "",
    serialNumber: editingProduct.serialNumber ? String(editingProduct.serialNumber).trim() : "",
    specifications: editingProduct.specifications && Array.isArray(editingProduct.specifications) ? editingProduct.specifications : [],
    isNew: editingProduct.isNew || false,
    isFeatured: editingProduct.isFeatured || false,
   });
   setImagePreview(editingProduct.images);
  } else if (!show) {
   // Modal kapandığında formu temizle
   setForm({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    subCategory: "",
    images: [],
    colors: [],
    stock: "",
    brand: "",
    material: "",
    tags: "",
    serialNumber: "",
    specifications: [],
    isNew: false,
    isFeatured: false,
   });
   setImagePreview([]);
  }
 }, [editingProduct, show]);


 const handleImageUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const currentCount = (form.images || []).length;
  if (currentCount >= MAX_IMAGES) {
   if (onError) onError(`En fazla ${MAX_IMAGES} görsel ekleyebilirsiniz.`);
   try { e.target.value = ""; } catch { }
   return;
  }
  setUploadingImage(true);
  try {
   const formData = new FormData();
   formData.append("file", file);
   const res = await axiosInstance.post("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
   });
   if (res.data?.success && res.data?.url) {
    const url = res.data.url;
    setForm(prev => {
     const prevImages = prev.images || [];
     if (prevImages.length >= MAX_IMAGES) return prev;
     return { ...prev, images: [...prevImages, url] };
    });
    setImagePreview(prev => {
     const prevList = prev || [];
     if (prevList.length >= MAX_IMAGES) return prevList;
     return [...prevList, url];
    });
   } else {
    if (onError) onError("Görsel yüklenemedi");
   }
  } catch {
   if (onError) onError("Görsel yüklenemedi");
  } finally {
   setUploadingImage(false);
  }
 };

 const removeImage = (idx) => {
  setForm(prev => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== idx) }));
  setImagePreview(prev => (prev || []).filter((_, i) => i !== idx));
 };

 const addColor = () => {
  setIsColorsExpanded(true);
  setForm(prev => ({
   ...prev,
   colors: [...(prev.colors || []), {
    name: "",
    hexCode: "",
    price: prev.price || "",
    discountPrice: prev.discountPrice || "",
    serialNumber: "",
    images: [],
    stock: prev.stock || "",
    manualLink: "",
    specifications: [],
   }]
  }));
 };

 const removeColor = (idx) => {
  setForm(prev => ({
   ...prev,
   colors: (prev.colors || []).filter((_, i) => i !== idx)
  }));
 };

 const updateColor = (idx, field, value) => {
  setForm(prev => {
   const newColors = [...(prev.colors || [])];
   newColors[idx] = { ...newColors[idx], [field]: value };
   return { ...prev, colors: newColors };
  });
 };

 const handleColorImageUpload = async (e, colorIdx) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const color = form.colors[colorIdx];
  if (!color) return;

  const currentCount = (color.images || []).length;
  if (currentCount >= MAX_IMAGES) {
   if (onError) onError(`Maksimum ${MAX_IMAGES} görsel eklenebilir`);
   return;
  }

  setUploadingImage(true);
  try {
   const formData = new FormData();
   formData.append("file", file);
   const res = await axiosInstance.post("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
   });
   if (res.data?.url) {
    const url = res.data.url;
    updateColor(colorIdx, "images", [...(color.images || []), url]);
   } else {
    if (onError) onError("Görsel yüklenemedi");
   }
  } catch {
   if (onError) onError("Görsel yüklenemedi");
  } finally {
   setUploadingImage(false);
  }
 };

 const removeColorImage = (colorIdx, imgIdx) => {
  const color = form.colors[colorIdx];
  if (!color) return;
  updateColor(colorIdx, "images", (color.images || []).filter((_, i) => i !== imgIdx));
 };

 // Specifications yönetimi (ürün seviyesi)
 const addProductSpecificationCategory = () => {
  setIsProductSpecsExpanded(true);
  setForm(prev => ({
   ...prev,
   specifications: [...(prev.specifications || []), {
    category: "",
    items: []
   }]
  }));
 };

 const removeProductSpecificationCategory = (catIdx) => {
  setForm(prev => ({
   ...prev,
   specifications: (prev.specifications || []).filter((_, i) => i !== catIdx)
  }));
 };

 const updateProductSpecificationCategory = (catIdx, category) => {
  setForm(prev => {
   const newSpecs = [...(prev.specifications || [])];
   if (newSpecs[catIdx]) {
    newSpecs[catIdx] = {
     ...newSpecs[catIdx],
     category
    };
   }
   return { ...prev, specifications: newSpecs };
  });
 };

 const addProductSpecificationItem = (catIdx) => {
  setForm(prev => {
   const newSpecs = [...(prev.specifications || [])];
   if (newSpecs[catIdx]) {
    newSpecs[catIdx] = {
     ...newSpecs[catIdx],
     items: [...(newSpecs[catIdx].items || []), { key: "", value: "" }]
    };
   }
   return { ...prev, specifications: newSpecs };
  });
 };

 const removeProductSpecificationItem = (catIdx, itemIdx) => {
  setForm(prev => {
   const newSpecs = [...(prev.specifications || [])];
   if (newSpecs[catIdx]) {
    newSpecs[catIdx] = {
     ...newSpecs[catIdx],
     items: (newSpecs[catIdx].items || []).filter((_, i) => i !== itemIdx)
    };
   }
   return { ...prev, specifications: newSpecs };
  });
 };

 const updateProductSpecificationItem = (catIdx, itemIdx, field, value) => {
  setForm(prev => {
   const newSpecs = [...(prev.specifications || [])];
   if (newSpecs[catIdx] && newSpecs[catIdx].items[itemIdx]) {
    newSpecs[catIdx].items[itemIdx] = {
     ...newSpecs[catIdx].items[itemIdx],
     [field]: value
    };
   }
   return { ...prev, specifications: newSpecs };
  });
 };

 // Specifications yönetimi (renk bazlı)
 const addSpecificationCategory = (colorIdx) => {
  setForm(prev => {
   const newColors = [...(prev.colors || [])];
   if (newColors[colorIdx]) {
    newColors[colorIdx] = {
     ...newColors[colorIdx],
     specifications: [...(newColors[colorIdx].specifications || []), {
      category: "",
      items: []
     }]
    };
   }
   return { ...prev, colors: newColors };
  });
 };

 const removeSpecificationCategory = (colorIdx, catIdx) => {
  setForm(prev => {
   const newColors = [...(prev.colors || [])];
   if (newColors[colorIdx]) {
    newColors[colorIdx] = {
     ...newColors[colorIdx],
     specifications: (newColors[colorIdx].specifications || []).filter((_, i) => i !== catIdx)
    };
   }
   return { ...prev, colors: newColors };
  });
 };

 const updateSpecificationCategory = (colorIdx, catIdx, category) => {
  setForm(prev => {
   const newColors = [...(prev.colors || [])];
   if (newColors[colorIdx] && newColors[colorIdx].specifications[catIdx]) {
    newColors[colorIdx].specifications[catIdx] = {
     ...newColors[colorIdx].specifications[catIdx],
     category
    };
   }
   return { ...prev, colors: newColors };
  });
 };

 const addSpecificationItem = (colorIdx, catIdx) => {
  setForm(prev => {
   const newColors = [...(prev.colors || [])];
   if (newColors[colorIdx] && newColors[colorIdx].specifications[catIdx]) {
    newColors[colorIdx].specifications[catIdx] = {
     ...newColors[colorIdx].specifications[catIdx],
     items: [...(newColors[colorIdx].specifications[catIdx].items || []), { key: "", value: "" }]
    };
   }
   return { ...prev, colors: newColors };
  });
 };

 const removeSpecificationItem = (colorIdx, catIdx, itemIdx) => {
  setForm(prev => {
   const newColors = [...(prev.colors || [])];
   if (newColors[colorIdx] && newColors[colorIdx].specifications[catIdx]) {
    newColors[colorIdx].specifications[catIdx] = {
     ...newColors[colorIdx].specifications[catIdx],
     items: (newColors[colorIdx].specifications[catIdx].items || []).filter((_, i) => i !== itemIdx)
    };
   }
   return { ...prev, colors: newColors };
  });
 };

 const updateSpecificationItem = (colorIdx, catIdx, itemIdx, field, value) => {
  setForm(prev => {
   const newColors = [...(prev.colors || [])];
   if (newColors[colorIdx] && newColors[colorIdx].specifications[catIdx] && newColors[colorIdx].specifications[catIdx].items[itemIdx]) {
    newColors[colorIdx].specifications[catIdx].items[itemIdx] = {
     ...newColors[colorIdx].specifications[catIdx].items[itemIdx],
     [field]: value
    };
   }
   return { ...prev, colors: newColors };
  });
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const nameVal = String(form.name || "").trim();
  if (nameVal.length > MAX_NAME) {
   if (onError) onError(`Ürün adı en fazla ${MAX_NAME} karakter olabilir.`);
   setLoading(false);
   return;
  }
  const brandVal = String(form.brand || "").trim();
  if (brandVal.length > MAX_BRAND) {
   if (onError) onError(`Marka en fazla ${MAX_BRAND} karakter olabilir.`);
   setLoading(false);
   return;
  }

  const desc = String(form.description || "");
  if (desc.length > MAX_DESCRIPTION) {
   if (onError) onError(`Açıklama en fazla ${MAX_DESCRIPTION} karakter olabilir.`);
   setLoading(false);
   return;
  }

  const priceValue = parseFloat(form.price);
  const discountPriceValue = form.discountPrice ? parseFloat(form.discountPrice) : null;
  if (isNaN(priceValue) || priceValue <= 0) {
   if (onError) onError("Fiyat geçerli bir pozitif sayı olmalıdır!");
   setLoading(false);
   return;
  }
  if (discountPriceValue !== null && (isNaN(discountPriceValue) || discountPriceValue <= 0)) {
   if (onError) onError("İndirimli fiyat geçerli bir sayı olmalıdır!");
   setLoading(false);
   return;
  }

  // Renk validasyonu
  if (!form.colors || form.colors.length === 0) {
   if (onError) onError("En az bir renk eklemelisiniz!");
   setLoading(false);
   return;
  }

  for (let i = 0; i < form.colors.length; i++) {
   const color = form.colors[i];
   if (!color.name || !color.name.trim()) {
    if (onError) onError(`${i + 1}. rengin adı boş olamaz!`);
    setLoading(false);
    return;
   }
   if (!color.price || isNaN(parseFloat(color.price)) || parseFloat(color.price) <= 0) {
    if (onError) onError(`${color.name} rengi için geçerli bir fiyat girmelisiniz!`);
    setLoading(false);
    return;
   }
   if (!color.serialNumber || !color.serialNumber.trim()) {
    if (onError) onError(`${color.name} rengi için seri numarası girmelisiniz!`);
    setLoading(false);
    return;
   }
   if (!color.images || color.images.length === 0) {
    if (onError) onError(`${color.name} rengi için en az bir resim eklemelisiniz!`);
    setLoading(false);
    return;
   }
   // Renk bazlı stok validasyonu
   const colorStock = parseInt(color.stock || 0);
   if (isNaN(colorStock) || colorStock < 0) {
    if (onError) onError(`${color.name} rengi için stok değeri geçerli bir sayı olmalıdır!`);
    setLoading(false);
    return;
   }
  }

  try {
   // Renk bazlı stokların toplamını hesapla
   const totalStock = form.colors.reduce((sum, color) => {
    return sum + (parseInt(color.stock || 0) || 0);
   }, 0);

   const payload = {
    ...form,
    price: Number(priceValue),
    discountPrice: discountPriceValue !== null ? Number(discountPriceValue) : undefined,
    stock: totalStock,
    tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    specifications: (form.specifications || []).filter(spec =>
     spec.category && spec.category.trim() && spec.items && spec.items.length > 0
    ).map(spec => ({
     category: spec.category.trim(),
     items: spec.items.filter(item => item.key && item.key.trim() && item.value && item.value.trim()).map(item => ({
      key: item.key.trim(),
      value: item.value.trim()
     }))
    })).filter(spec => spec.items.length > 0),
    colors: form.colors.map(c => ({
     name: c.name.trim(),
     hexCode: c.hexCode || inferHexCode(c.name),
     price: Number(parseFloat(c.price)),
     discountPrice: c.discountPrice && !isNaN(parseFloat(c.discountPrice)) ? Number(parseFloat(c.discountPrice)) : null,
     serialNumber: c.serialNumber.trim(),
     images: c.images || [],
     stock: c.stock ? Number(parseInt(c.stock)) : 0,
     manualLink: c.manualLink ? String(c.manualLink).trim() : "",
     specifications: (c.specifications || []).filter(spec =>
      spec.category && spec.category.trim() && spec.items && spec.items.length > 0
     ).map(spec => ({
      category: spec.category.trim(),
      items: spec.items.filter(item => item.key && item.key.trim() && item.value && item.value.trim()).map(item => ({
       key: item.key.trim(),
       value: item.value.trim()
      }))
     })).filter(spec => spec.items.length > 0),
    })),
   };

   let res;
   if (editingProduct?._id) {
    res = await axiosInstance.put(`/api/products/${editingProduct._id}`, payload);
   } else {
    res = await axiosInstance.post("/api/products", payload);
   }

   if (!res.data?.success) {
    if (onError) onError(res.data?.error || res.data?.message || "İşlem başarısız");
    return;
   }

   if (onSuccess) onSuccess();
  } catch (err) {
   const status = err?.response?.status;
   const apiMsg = err?.response?.data?.error || err?.response?.data?.message;
   const msg = apiMsg || err?.message || "İşlem başarısız";
   if (onError) onError(status ? `${msg} (HTTP ${status})` : msg);
  } finally {
   setLoading(false);
  }
 };

 if (!show) return null;

 return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
   <style dangerouslySetInnerHTML={{
    __html: `
    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
     -webkit-appearance: none;
     margin: 0;
    }
    input[type="number"] {
     -moz-appearance: textfield;
    }
   `}} />
   <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
    <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10 shadow-sm">
     <h3 className="text-xl font-bold">{editingProduct ? "Ürün Düzenle" : "Yeni Ürün Ekle"}</h3>
     <button
      onClick={onClose}
      className="text-gray-500 hover:text-gray-800 transition cursor-pointer"
     >
      <HiX size={24} />
     </button>
    </div>

    <form onSubmit={handleSubmit} className="p-6 space-y-5">
     <div className="grid md:grid-cols-2 gap-4">
      <div>
       <div className="flex items-center justify-between gap-3 mb-2">
        <label className="block text-sm font-semibold text-gray-700">Ürün Adı</label>
        <span className={`text-xs ${String(form.name || "").length > MAX_NAME ? "text-red-600 font-semibold" : "text-gray-500"}`}>
         {String(form.name || "").length}/{MAX_NAME}
        </span>
       </div>
       <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full border rounded-lg px-4 py-3"
        maxLength={MAX_NAME}
        required
       />
      </div>
      <div>
       <label className="block text-sm font-semibold text-gray-700 mb-2">Marka</label>
       {(() => {
        const availableBrands = categoryBrands[form.subCategory] || categoryBrands[form.category] || [];

        if (availableBrands.length > 0) {
         return (
          <select
           value={form.brand}
           onChange={(e) => setForm({ ...form, brand: e.target.value })}
           className="w-full border rounded-lg pl-4 pr-10 py-3 cursor-pointer appearance-none bg-white"
           style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '12px'
           }}
          >
           <option value="">Seçiniz</option>
           {availableBrands.map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
           ))}
          </select>
         );
        }

        return (
         <input
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          className="w-full border rounded-lg px-4 py-3"
          maxLength={MAX_BRAND}
          placeholder="Marka adı"
         />
        );
       })()}
      </div>
     </div>

     <div>
      <div className="flex items-center justify-between gap-3 mb-2">
       <label className="block text-sm font-semibold text-gray-700">Açıklama</label>
       <span className={`text-xs ${String(form.description || "").length > MAX_DESCRIPTION ? "text-red-600 font-semibold" : "text-gray-500"}`}>
        {String(form.description || "").length}/{MAX_DESCRIPTION}
       </span>
      </div>
      <textarea
       value={form.description}
       onChange={(e) => setForm({ ...form, description: e.target.value })}
       className="w-full border rounded-lg px-4 py-3 min-h-[110px]"
       maxLength={MAX_DESCRIPTION}
       required
      />
     </div>

     <div className={`grid gap-4 ${(subCategoryOptions[form.category] || []).length > 0 ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
      <div>
       <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
       <select
        value={form.category}
        onChange={(e) => {
         const newCategory = e.target.value;
         const availableBrands = categoryBrands[newCategory] || [];
         const shouldResetBrand = form.brand && availableBrands.length > 0 && !availableBrands.includes(form.brand);
         setForm({
          ...form,
          category: newCategory,
          subCategory: "",
          brand: shouldResetBrand ? "" : form.brand
         });
        }}
        className="w-full border rounded-lg pl-4 pr-10 py-3 cursor-pointer appearance-none bg-white"
        style={{
         backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
         backgroundRepeat: 'no-repeat',
         backgroundPosition: 'right 0.75rem center',
         backgroundSize: '12px'
        }}
        required
       >
        <option value="">Seçiniz</option>
        {MENU_ITEMS.map((item) => (
         <option key={item.name} value={item.name}>{item.name}</option>
        ))}
       </select>
      </div>
      {(subCategoryOptions[form.category] || []).length > 0 && (
       <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Alt Kategori</label>
        <select
         value={form.subCategory}
         onChange={(e) => {
          const newSubCategory = e.target.value;
          const availableBrands = categoryBrands[newSubCategory] || categoryBrands[form.category] || [];
          const shouldResetBrand = form.brand && availableBrands.length > 0 && !availableBrands.includes(form.brand);
          setForm({
           ...form,
           subCategory: newSubCategory,
           brand: shouldResetBrand ? "" : form.brand
          });
         }}
         className="w-full border rounded-lg pl-4 pr-10 py-3 cursor-pointer appearance-none bg-white"
         style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '12px'
         }}
        >
         <option value="">Seçiniz</option>
         {(subCategoryOptions[form.category] || []).map((sc) => (
          <option key={sc} value={sc}>{sc}</option>
         ))}
        </select>
       </div>
      )}
     </div>

     <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Etiketler (virgülle)</label>
      <input
       value={form.tags}
       onChange={(e) => setForm({ ...form, tags: e.target.value })}
       className="w-full border rounded-lg px-4 py-3"
      />
     </div>

     <div>
      <div className="flex justify-between items-center mb-4">
       <button
        type="button"
        onClick={() => setIsProductSpecsExpanded(!isProductSpecsExpanded)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition cursor-pointer"
       >
        <span>Ürün Özellikleri</span>
        {isProductSpecsExpanded ? (
         <HiChevronUp className="text-gray-500" size={18} />
        ) : (
         <HiChevronDown className="text-gray-500" size={18} />
        )}
       </button>
       <button
        type="button"
        onClick={addProductSpecificationCategory}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2 cursor-pointer"
       >
        <HiPlus size={18} />
        Kategori Ekle
       </button>
      </div>

      {isProductSpecsExpanded && form.specifications && form.specifications.length > 0 && (
       <div className="space-y-3 mb-6">
        {form.specifications.map((spec, catIdx) => (
         <div key={catIdx} className="border border-gray-200 rounded-lg p-3 bg-white">
          <div className="flex items-center gap-2 mb-2">
           <input
            type="text"
            value={spec.category || ""}
            onChange={(e) => updateProductSpecificationCategory(catIdx, e.target.value)}
            placeholder="Kategori adı (örn: Genel Özellikler)"
            className="flex-1 border rounded-lg px-2 py-1.5 text-xs font-semibold"
           />
           <button
            type="button"
            onClick={() => removeProductSpecificationCategory(catIdx)}
            className="px-2 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs cursor-pointer"
           >
            Sil
           </button>
          </div>

          <div className="space-y-2">
           {spec.items && spec.items.map((item, itemIdx) => (
            <div key={itemIdx} className="flex items-center gap-2">
             <input
              type="text"
              value={item.key || ""}
              onChange={(e) => updateProductSpecificationItem(catIdx, itemIdx, "key", e.target.value)}
              placeholder="Özellik adı"
              className="flex-1 border rounded-lg px-2 py-1.5 text-xs"
             />
             <input
              type="text"
              value={item.value || ""}
              onChange={(e) => updateProductSpecificationItem(catIdx, itemIdx, "value", e.target.value)}
              placeholder="Değer"
              className="flex-1 border rounded-lg px-2 py-1.5 text-xs"
             />
             <button
              type="button"
              onClick={() => removeProductSpecificationItem(catIdx, itemIdx)}
              className="px-2 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs cursor-pointer"
             >
              <HiX size={12} />
             </button>
            </div>
           ))}
           <button
            type="button"
            onClick={() => addProductSpecificationItem(catIdx)}
            className="w-full px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-xs font-semibold cursor-pointer flex items-center justify-center gap-2"
           >
            <HiPlus size={12} />
            Özellik Ekle
           </button>
          </div>
         </div>
        ))}
       </div>
      )}
     </div>

     <div>
      <div className="flex justify-between items-center mb-4">
       <button
        type="button"
        onClick={() => setIsColorsExpanded(!isColorsExpanded)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition cursor-pointer"
       >
        <span>Renkler</span>
        {isColorsExpanded ? (
         <HiChevronUp className="text-gray-500" size={18} />
        ) : (
         <HiChevronDown className="text-gray-500" size={18} />
        )}
       </button>
       <button
        type="button"
        onClick={addColor}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2 cursor-pointer"
       >
        <HiPlus size={18} />
        Renk Ekle
       </button>
      </div>

      {isColorsExpanded && (
       <div className="space-y-4">
        {(form.colors || []).map((color, colorIdx) => (
         <div key={colorIdx} className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
           <h4 className="font-semibold text-gray-700">{color.name || `Renk ${colorIdx + 1}`}</h4>
           <button
            type="button"
            onClick={() => removeColor(colorIdx)}
            className="text-red-600 hover:text-red-800 text-sm font-semibold cursor-pointer"
           >
            Sil
           </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
           <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Renk Adı <span className="text-red-600">*</span></label>
            <input
             type="text"
             value={color.name || ""}
             onChange={(e) => {
              const name = e.target.value;
              updateColor(colorIdx, "name", name);
              updateColor(colorIdx, "hexCode", inferHexCode(name));
             }}
             className="w-full border rounded-lg px-4 py-2"
             placeholder="Örn: Beyaz, Paslanmaz çelik"
             required
            />
           </div>
           <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Seri Numarası <span className="text-red-600">*</span></label>
            <input
             type="text"
             value={color.serialNumber || ""}
             onChange={(e) => updateColor(colorIdx, "serialNumber", e.target.value)}
             className="w-full border rounded-lg px-4 py-2"
             placeholder="Örn: BD2086WDAN-W"
             required
            />
           </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
           <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fiyat <span className="text-red-600">*</span></label>
            <input
             type="number"
             step="0.01"
             min="0"
             value={color.price || ""}
             onChange={(e) => updateColor(colorIdx, "price", e.target.value)}
             className="w-full border rounded-lg px-4 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
             placeholder="0.00"
             required
            />
           </div>
           <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">İndirimli Fiyat</label>
            <input
             type="number"
             step="0.01"
             min="0"
             value={color.discountPrice || ""}
             onChange={(e) => updateColor(colorIdx, "discountPrice", e.target.value || null)}
             className="w-full border rounded-lg px-4 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
             placeholder="Opsiyonel"
            />
           </div>
           <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Stok</label>
            <input
             type="number"
             min="0"
             value={color.stock || ""}
             onChange={(e) => updateColor(colorIdx, "stock", e.target.value)}
             className="w-full border rounded-lg px-4 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
             placeholder="0"
            />
           </div>
          </div>

          <div className="mb-4">
           <label className="block text-sm font-semibold text-gray-700 mb-2">
            Görseller <span className="text-red-600">*</span> ({(color.images || []).length}/{MAX_IMAGES})
           </label>
           <div className="flex items-center gap-3 mb-3">
            <label
             className={`shrink-0 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${(color.images || []).length >= MAX_IMAGES || uploadingImage ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"}`}
            >
             <HiUpload size={16} />
             <input
              type="file"
              className="hidden"
              onChange={(e) => handleColorImageUpload(e, colorIdx)}
              disabled={(color.images || []).length >= MAX_IMAGES || uploadingImage}
             />
             Görsel Ekle
            </label>
           </div>
           {(color.images || []).length > 0 && (
            <div className="grid grid-cols-5 gap-3">
             {(color.images || []).map((img, imgIdx) => (
              <div key={imgIdx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
               <Image
                src={img}
                alt={`Renk ${colorIdx + 1} - Görsel ${imgIdx + 1}`}
                width={100}
                height={100}
                className="w-full h-full object-cover"
               />
               <button
                type="button"
                onClick={() => removeColorImage(colorIdx, imgIdx)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 cursor-pointer"
               >
                <HiX size={14} />
               </button>
              </div>
             ))}
            </div>
           )}

           <div className="mb-4 mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Kullanım Kılavuzu Linki</label>
            <input
             type="url"
             value={color.manualLink || ""}
             onChange={(e) => updateColor(colorIdx, "manualLink", e.target.value.trim())}
             className="w-full border rounded-lg px-4 py-2"
             placeholder="https://example.com/kullanim-kilavuzu.pdf"
            />
           </div>

           {/* Renk Bazlı Özellikler */}
           <div className="mt-4 pt-4 border-t border-gray-300">
            <div className="flex items-center justify-between mb-3">
             <label className="block text-sm font-semibold text-gray-700">Ürün Özellikleri ({color.name || `Renk ${colorIdx + 1}`})</label>
             <button
              type="button"
              onClick={() => addSpecificationCategory(colorIdx)}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
             >
              <HiPlus size={14} />
              Kategori Ekle
             </button>
            </div>

            {color.specifications && color.specifications.length > 0 && (
             <div className="space-y-3">
              {color.specifications.map((spec, catIdx) => (
               <div key={catIdx} className="border border-gray-200 rounded-lg p-3 bg-white">
                <div className="flex items-center gap-2 mb-2">
                 <input
                  type="text"
                  value={spec.category || ""}
                  onChange={(e) => updateSpecificationCategory(colorIdx, catIdx, e.target.value)}
                  placeholder="Kategori adı (örn: Genel Özellikler)"
                  className="flex-1 border rounded-lg px-2 py-1.5 text-xs font-semibold"
                 />
                 <button
                  type="button"
                  onClick={() => removeSpecificationCategory(colorIdx, catIdx)}
                  className="px-2 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs cursor-pointer"
                 >
                  Sil
                 </button>
                </div>

                <div className="space-y-2">
                 {spec.items && spec.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center gap-2">
                   <input
                    type="text"
                    value={item.key || ""}
                    onChange={(e) => updateSpecificationItem(colorIdx, catIdx, itemIdx, "key", e.target.value)}
                    placeholder="Özellik adı"
                    className="flex-1 border rounded-lg px-2 py-1.5 text-xs"
                   />
                   <input
                    type="text"
                    value={item.value || ""}
                    onChange={(e) => updateSpecificationItem(colorIdx, catIdx, itemIdx, "value", e.target.value)}
                    placeholder="Değer"
                    className="flex-1 border rounded-lg px-2 py-1.5 text-xs"
                   />
                   <button
                    type="button"
                    onClick={() => removeSpecificationItem(colorIdx, catIdx, itemIdx)}
                    className="px-2 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs cursor-pointer"
                   >
                    ×
                   </button>
                  </div>
                 ))}
                 <button
                  type="button"
                  onClick={() => addSpecificationItem(colorIdx, catIdx)}
                  className="w-full px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-xs font-semibold cursor-pointer flex items-center justify-center gap-2"
                 >
                  <HiPlus size={12} />
                  Özellik Ekle
                 </button>
                </div>
               </div>
              ))}
             </div>
            )}
           </div>
          </div>
         </div>
        ))}
       </div>
      )}
     </div>

     <div className="flex items-center gap-4">
      <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
       <input
        type="checkbox"
        checked={Boolean(form.isNew)}
        onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
        className="cursor-pointer"
       />
       Yeni Ürün
      </label>
      <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
       <input
        type="checkbox"
        checked={Boolean(form.isFeatured)}
        onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
        className="cursor-pointer"
       />
       Öne Çıkan
      </label>
     </div>

     <div className="flex justify-end gap-3 pt-2">
      <button
       type="button"
       onClick={onClose}
       className="px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition cursor-pointer"
      >
       Vazgeç
      </button>
      <button
       type="submit"
       disabled={loading}
       className={`px-6 py-3 rounded-lg font-semibold transition ${loading ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"}`}
      >
       {loading ? "Kaydediliyor..." : (editingProduct ? "Güncelle" : "Kaydet")}
      </button>
     </div>
    </form>
   </div>
  </div>
 );
}
