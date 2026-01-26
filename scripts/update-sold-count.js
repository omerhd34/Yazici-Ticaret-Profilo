const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
 const envFile = fs.readFileSync(envPath, 'utf8');
 envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
   const key = match[1].trim();
   const value = match[2].trim().replace(/^["']|["']$/g, '');
   process.env[key] = value;
  }
 });
}

const ProductSchema = new mongoose.Schema({
 name: String,
 slug: String,
 serialNumber: String,
 colors: [{
  name: String,
  serialNumber: String,
  price: Number,
  discountPrice: Number,
  images: [String],
  stock: Number,
 }],
 soldCount: { type: Number, default: 0 },
}, { timestamps: true });

let Product;
if (mongoose.models.Product) {
 Product = mongoose.models.Product;
} else {
 Product = mongoose.model('Product', ProductSchema);
}

async function updateSoldCount() {
 try {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
   process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const UserSchema = new mongoose.Schema({
   orders: Array,
  }, { strict: false });
  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  const users = await User.find({}).select('orders').lean();
  const salesBySerial = new Map();

  for (const user of users) {
   if (!Array.isArray(user.orders)) continue;

   for (const order of user.orders) {
    if (!order.status || !order.status.includes('Teslim')) continue;

    if (!Array.isArray(order.items)) continue;

    for (const item of order.items) {
     const serialNumber = item.serialNumber || item.productId || '';
     const quantity = Number(item.quantity || 1) || 1;
     const price = Number(item.price || 0) || 0;

     if (!serialNumber) continue;

     if (!salesBySerial.has(serialNumber)) {
      salesBySerial.set(serialNumber, {
       count: 0,
       totalAmount: 0,
       productId: item.productId || null,
      });
     }

     const sales = salesBySerial.get(serialNumber);
     sales.count += quantity;
     sales.totalAmount += price * quantity;
    }
   }
  }

  const allProducts = await Product.find({});

  let updatedCount = 0;
  for (const product of allProducts) {
   let maxSoldCount = 0;

   if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
    for (const color of product.colors) {
     if (color.serialNumber && salesBySerial.has(color.serialNumber)) {
      const sales = salesBySerial.get(color.serialNumber);
      maxSoldCount = Math.max(maxSoldCount, sales.count);
     }
    }
   } else if (product.serialNumber && salesBySerial.has(product.serialNumber)) {
    const sales = salesBySerial.get(product.serialNumber);
    maxSoldCount = sales.count;
   }

   if (product.soldCount !== maxSoldCount) {
    product.soldCount = maxSoldCount;
    await product.save();
    updatedCount++;
   }
  }


  await mongoose.disconnect();
 } catch (error) {
  await mongoose.disconnect();
  process.exit(1);
 }
}

updateSoldCount();
