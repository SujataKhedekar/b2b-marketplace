import Order from '../models/Order.js';
import { createStripeIntent, createRazorpayOrder } from '../services/paymentService.js';
import { notify } from '../services/notificationService.js';

// POST /api/orders/:id/pay/stripe -> returns clientSecret
export const stripeCheckout = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.buyer.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not your order' });
  if (order.payment.status === 'paid')
    return res.status(400).json({ message: 'Already paid' });

  const intent = await createStripeIntent(order.amount, 'usd', { orderId: order._id.toString() });
  res.json({ clientSecret: intent.client_secret });
};

// POST /api/orders/:id/pay/razorpay -> returns razorpay order
export const razorpayCheckout = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.buyer.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not your order' });

  const rpOrder = await createRazorpayOrder(order.amount, 'INR', order._id.toString());
  res.json({ razorpayOrder: rpOrder, keyId: process.env.RAZORPAY_KEY_ID });
};

// POST /api/orders/:id/pay/confirm  (called after client-side success)
// In production, verify via webhook/signature before marking paid.
export const confirmPayment = async (req, res) => {
  const { gateway, transactionId } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.payment.status = 'paid';
  order.payment.gateway = gateway;
  order.payment.transactionId = transactionId;
  order.payment.paidAt = new Date();
  await order.save();

  await notify({
    user: order.seller,
    type: 'payment_confirmed',
    title: 'Payment received',
    message: `Payment confirmed for order ${order._id}`,
    link: `/orders/${order._id}`,
  });

  res.json(order);
};
