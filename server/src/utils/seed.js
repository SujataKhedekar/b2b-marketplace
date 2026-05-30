import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import RFQ from '../models/RFQ.js';

// Seeds a few demo accounts and one open RFQ.
const run = async () => {
  await connectDB();
  await Promise.all([User.deleteMany({}), RFQ.deleteMany({})]);

  const admin = await User.create({
    name: 'Platform Admin', email: 'admin@demo.com', password: 'password', role: 'admin', isVerified: true,
  });
  const buyer = await User.create({
    name: 'Acme Procurement', email: 'buyer@demo.com', password: 'password', role: 'buyer',
    company: 'Acme Corp', isVerified: true,
  });
  const seller1 = await User.create({
    name: 'Global Supplies', email: 'seller1@demo.com', password: 'password', role: 'seller',
    company: 'Global Supplies Ltd', isVerified: true, rating: 4.6, totalReviews: 22,
  });
  const seller2 = await User.create({
    name: 'BulkSource', email: 'seller2@demo.com', password: 'password', role: 'seller',
    company: 'BulkSource Inc', isVerified: true, rating: 4.2, totalReviews: 11,
  });

  await RFQ.create({
    buyer: buyer._id,
    productName: 'Industrial Safety Helmets',
    quantity: 500,
    budget: 12,
    deliveryLocation: 'Mumbai, Maharashtra, IN',
    deliveryDeadline: new Date(Date.now() + 21 * 86400000),
    description: 'ISI-certified, ABS shell, adjustable. Provide samples.',
    status: 'open',
  });

  console.log('Seeded:');
  console.log('  admin@demo.com / password (admin)');
  console.log('  buyer@demo.com / password (buyer)');
  console.log('  seller1@demo.com / password (seller)');
  console.log('  seller2@demo.com / password (seller)');
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((e) => { console.error(e); process.exit(1); });
