import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    rfq: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
    bid: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    commission: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'],
      default: 'pending',
    },
    payment: {
      status: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
      gateway: { type: String, enum: ['stripe', 'razorpay', null], default: null },
      transactionId: { type: String, default: null },
      paidAt: { type: Date, default: null },
    },
    statusHistory: [
      {
        status: String,
        at: { type: Date, default: Date.now },
      },
    ],
    reviewedByBuyer: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
