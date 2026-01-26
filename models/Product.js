import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
 name: {
  type: String,
  required: [true, 'Ürün adı gereklidir'],
  trim: true,
 },
 slug: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
 },
 serialNumber: {
  type: String,
  default: '',
  trim: true,
 },
 description: {
  type: String,
  required: [true, 'Ürün açıklaması gereklidir'],
 },
 price: {
  type: Number,
  required: [true, 'Fiyat gereklidir'],
  min: 0,
 },
 discountPrice: {
  type: Number,
  default: null,
  min: 0,
 },
 category: {
  type: String,
  required: [true, 'Kategori gereklidir'],
 },
 subCategory: {
  type: String,
  default: '',
 },
 images: [{
  type: String,
  required: true,
 }],
 colors: [{
  name: {
   type: String,
   required: true,
  },
  hexCode: String,
  price: {
   type: Number,
   required: true,
   min: 0,
  },
  discountPrice: {
   type: Number,
   default: null,
   min: 0,
  },
  serialNumber: {
   type: String,
   required: true,
   trim: true,
  },
  images: [{
   type: String,
   required: true,
  }],
  stock: {
   type: Number,
   default: 0,
   min: 0,
  },
  manualLink: {
   type: String,
   default: '',
   trim: true,
  },
  specifications: [{
   category: {
    type: String,
    required: true,
    trim: true,
   },
   items: [{
    key: {
     type: String,
     required: true,
     trim: true,
    },
    value: {
     type: String,
     required: true,
     trim: true,
    },
   }],
  }],
  productsInside: [{
   type: mongoose.Schema.Types.Mixed,
  }],
 }],
 stock: {
  type: Number,
  required: true,
  min: 0,
  default: 0,
 },
 brand: {
  type: String,
  default: '',
 },
 material: {
  type: String,
  default: '',
 },
 dimensions: {
  height: {
   type: Number,
   default: null,
  },
  width: {
   type: Number,
   default: null,
  },
  depth: {
   type: Number,
   default: null,
  },
 },
 netWeight: {
  type: Number,
  default: null,
  min: 0,
 },
 specifications: [{
  category: {
   type: String,
   required: true,
   trim: true,
  },
  items: [{
   key: {
    type: String,
    required: true,
    trim: true,
   },
   value: {
    type: String,
    required: true,
    trim: true,
   },
  }],
 }],
 tags: [{
  type: String,
 }],
 isNewProduct: {
  type: Boolean,
  default: false,
 },
 isFeatured: {
  type: Boolean,
  default: false,
 },
 rating: {
  type: Number,
  default: 0,
  min: 0,
  max: 5,
 },
 reviewCount: {
  type: Number,
  default: 0,
 },
 ratings: [{
  userId: {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'User',
   required: true,
  },
  rating: {
   type: Number,
   required: true,
   min: 1,
   max: 5,
  },
  createdAt: {
   type: Date,
   default: Date.now,
  },
  updatedAt: {
   type: Date,
   default: Date.now,
  },
 }],
 soldCount: {
  type: Number,
  default: 0,
 },
 viewCount: {
  type: Number,
  default: 0,
 },
}, {
 timestamps: true
});

ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

if (mongoose.models.Product) {
 delete mongoose.models.Product;
}

export default mongoose.model('Product', ProductSchema);

