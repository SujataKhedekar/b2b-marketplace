import Stripe from 'stripe';
import Razorpay from 'razorpay';

// Lazily construct clients so missing keys in dev don't crash boot
let stripe = null;
let razorpay = null;

const getStripe = () => {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

const getRazorpay = () => {
  if (!razorpay && process.env.RAZORPAY_KEY_ID) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

// Create a Stripe PaymentIntent; returns client_secret for the frontend
export const createStripeIntent = async (amount, currency = 'usd', metadata = {}) => {
  const client = getStripe();
  if (!client) throw new Error('Stripe not configured');
  return client.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
};

// Create a Razorpay order
export const createRazorpayOrder = async (amount, currency = 'INR', receipt = '') => {
  const client = getRazorpay();
  if (!client) throw new Error('Razorpay not configured');
  return client.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt,
  });
};
