import Review from '../models/Review.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { notify } from '../services/notificationService.js';

// Recompute a seller's average rating and review count from all their reviews.
const recalcSellerRating = async (sellerId) => {
  const agg = await Review.aggregate([
    { $match: { seller: sellerId } },
    { $group: { _id: '$seller', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = agg[0] || {};
  await User.findByIdAndUpdate(sellerId, {
    rating: +avg.toFixed(2),
    totalReviews: count,
  });
};

// POST /api/orders/:orderId/review  (buyer reviews seller after completion)
export const createReview = async (req, res) => {
  const { rating, comment } = req.body;
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (order.buyer.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Only the buyer can review this order' });
  if (order.status !== 'completed')
    return res.status(400).json({ message: 'You can only review completed orders' });
  if (order.reviewedByBuyer)
    return res.status(400).json({ message: 'You have already reviewed this order' });

  const review = await Review.create({
    order: order._id,
    buyer: order.buyer,
    seller: order.seller,
    rating,
    comment,
  });

  order.reviewedByBuyer = true;
  await order.save();
  await recalcSellerRating(order.seller);

  await notify({
    user: order.seller,
    type: 'order_status',
    title: 'New review received',
    message: `You received a ${rating}-star review`,
    link: `/orders/${order._id}`,
  });

  res.status(201).json(review);
};

// GET /api/sellers/:sellerId/reviews  (public list for a seller)
export const listSellerReviews = async (req, res) => {
  const seller = await User.findById(req.params.sellerId).select('name company rating totalReviews');
  if (!seller || seller.role === undefined) {
    // role omitted by select; just guard on existence
  }
  if (!seller) return res.status(404).json({ message: 'Seller not found' });

  const reviews = await Review.find({ seller: req.params.sellerId })
    .populate('buyer', 'name company')
    .sort('-createdAt');

  res.json({ seller, reviews });
};

// GET /api/orders/:orderId/review  (fetch the review for an order, if any)
export const getOrderReview = async (req, res) => {
  const review = await Review.findOne({ order: req.params.orderId })
    .populate('buyer', 'name company');
  res.json(review || null);
};
