import User from '../models/User.js';
import RFQ from '../models/RFQ.js';
import Order from '../models/Order.js';
import Bid from '../models/Bid.js';

// GET /api/admin/users
export const listUsers = async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.json(users);
};

// PATCH /api/admin/users/:id  (verify / toggle active)
export const updateUser = async (req, res) => {
  const { isVerified, isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (typeof isVerified === 'boolean') user.isVerified = isVerified;
  if (typeof isActive === 'boolean') user.isActive = isActive;
  await user.save();
  res.json(user);
};

// GET /api/admin/analytics
export const analytics = async (req, res) => {
  const [users, rfqs, bids, orders, revenueAgg] = await Promise.all([
    User.countDocuments(),
    RFQ.countDocuments(),
    Bid.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, revenue: { $sum: '$amount' }, commission: { $sum: '$commission' } } },
    ]),
  ]);
  res.json({
    users, rfqs, bids, orders,
    revenue: revenueAgg[0]?.revenue || 0,
    commission: revenueAgg[0]?.commission || 0,
  });
};
