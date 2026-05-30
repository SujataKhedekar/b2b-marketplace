import Order from '../models/Order.js';
import Bid from '../models/Bid.js';
import RFQ from '../models/RFQ.js';
import { notify } from '../services/notificationService.js';

const COMMISSION_RATE = 0.05; // 5% platform commission

// POST /api/bids/:bidId/accept  (buyer accepts a bid -> creates order)
export const acceptBid = async (req, res) => {
  const bid = await Bid.findById(req.params.bidId).populate('rfq');
  if (!bid) return res.status(404).json({ message: 'Bid not found' });
  const rfq = bid.rfq;
  if (rfq.buyer.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not your RFQ' });
  if (rfq.status === 'awarded')
    return res.status(400).json({ message: 'RFQ already awarded' });

  bid.status = 'accepted';
  await bid.save();

  // Reject other bids
  await Bid.updateMany(
    { rfq: rfq._id, _id: { $ne: bid._id }, status: 'active' },
    { status: 'rejected' }
  );

  rfq.status = 'awarded';
  rfq.awardedBid = bid._id;
  await rfq.save();

  const commission = +(bid.totalPrice * COMMISSION_RATE).toFixed(2);
  const order = await Order.create({
    rfq: rfq._id, bid: bid._id,
    buyer: rfq.buyer, seller: bid.seller,
    amount: bid.totalPrice, commission,
    status: 'pending',
    statusHistory: [{ status: 'pending' }],
  });

  await notify({
    user: bid.seller,
    type: 'bid_accepted',
    title: 'Bid accepted',
    message: `Your bid on "${rfq.productName}" was accepted. Order created.`,
    link: `/orders/${order._id}`,
  });

  res.status(201).json(order);
};

// GET /api/orders  (role-scoped)
export const listOrders = async (req, res) => {
  const filter = {};
  if (req.user.role === 'buyer') filter.buyer = req.user._id;
  else if (req.user.role === 'seller') filter.seller = req.user._id;
  const orders = await Order.find(filter)
    .populate('rfq', 'productName quantity')
    .populate('buyer', 'name company')
    .populate('seller', 'name company')
    .sort('-createdAt');
  res.json(orders);
};

// GET /api/orders/:id
export const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('rfq')
    .populate('buyer', 'name company email')
    .populate('seller', 'name company email');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
};

// Valid forward transitions for order status
const FLOW = {
  pending: ['accepted', 'cancelled'],
  accepted: ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: ['completed'],
};

// PATCH /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const isSeller = order.seller.toString() === req.user._id.toString();
  const isBuyer = order.buyer.toString() === req.user._id.toString();
  if (!isSeller && !isBuyer && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Not authorized for this order' });

  // Buyer confirms delivery (completed); seller drives accepted->shipped
  if (!FLOW[order.status]?.includes(status))
    return res.status(400).json({ message: `Cannot move from ${order.status} to ${status}` });

  order.status = status;
  order.statusHistory.push({ status });
  await order.save();

  const recipient = isSeller ? order.buyer : order.seller;
  await notify({
    user: recipient,
    type: 'order_status',
    title: 'Order status updated',
    message: `Order is now "${status}"`,
    link: `/orders/${order._id}`,
  });

  res.json(order);
};
