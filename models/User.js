import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
 title: {
  type: String,
  required: true,
 },
 firstName: {
  type: String,
  required: true,
 },
 lastName: {
  type: String,
  required: true,
 },
 fullName: {
  type: String,
  required: false,
 },
 phone: {
  type: String,
  required: true,
 },
 address: {
  type: String,
  required: true,
 },
 city: {
  type: String,
  required: true,
 },
 district: {
  type: String,
  required: true,
 },
 isDefault: {
  type: Boolean,
  default: false,
 },
}, { _id: true });

const CardSchema = new mongoose.Schema({
 title: {
  type: String,
  required: true,
 },
 cardHolder: {
  type: String,
  required: true,
 },
 cardNumberLast4: {
  type: String,
  required: true,
 },
 cardNumberMasked: {
  type: String,
  required: true,
 },
 cardType: {
  type: String,
  enum: ['Visa', 'Mastercard', 'Troy', 'Amex', 'Kart'],
  default: 'Kart',
 },
 month: {
  type: String,
  required: true,
 },
 year: {
  type: String,
  required: true,
 },
 cvc: {
  type: String,
  required: true,
 },
 isDefault: {
  type: Boolean,
  default: false,
 },
 createdAt: {
  type: Date,
  default: Date.now,
 },
}, { _id: true });

const UserSchema = new mongoose.Schema({
 name: {
  type: String,
  required: false,
  trim: true,
 },
 firstName: {
  type: String,
  required: [true, 'Ad gereklidir'],
  trim: true,
 },
 lastName: {
  type: String,
  required: [true, 'Soyad gereklidir'],
  trim: true,
 },
 email: {
  type: String,
  required: [true, 'Email gereklidir'],
  unique: true,
  lowercase: true,
  trim: true,
 },
 password: {
  type: String,
  required: [true, 'Şifre gereklidir'],
 },
 phone: {
  type: String,
  default: '',
 },
 profileImage: {
  type: String,
  default: '',
 },
 addresses: [AddressSchema],
 cards: [CardSchema],
 orders: [{
  orderId: String,
  date: Date,
  status: String,
  deliveredAt: Date,
  total: Number,
  items: Array,
  payment: mongoose.Schema.Types.Mixed,
  addressId: String,
  addressSummary: String,
  shippingAddress: mongoose.Schema.Types.Mixed,
  billingAddress: mongoose.Schema.Types.Mixed,
  returnRequest: {
   status: { type: String, default: "" },   // Talep Edildi / Onaylandı / Reddedildi vb.
   requestedAt: Date,
   approvedAt: Date,
   completedAt: Date,
   cancelledAt: Date,
   cancelReason: { type: String, default: "" },
   note: { type: String, default: "" },
  },
  createdAt: {
   type: Date,
   default: Date.now,
  },
  updatedAt: Date,
 }],
 favorites: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Product',
 }],
 cart: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Product',
 }],
 tempOrders: [{
  orderId: String,
  userId: String,
  items: Array,
  total: Number,
  address: mongoose.Schema.Types.Mixed,
  createdAt: Date,
 }],
 notificationPreferences: {
  emailNotifications: {
   type: Boolean,
   default: true,
  },
 },
 resetPasswordToken: String,
 resetPasswordExpires: Date,
 emailVerificationCode: String,
 emailVerificationCodeExpires: Date,
 isEmailVerified: {
  type: Boolean,
  default: false,
 },
 createdAt: {
  type: Date,
  default: Date.now,
 },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
