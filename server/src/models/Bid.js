import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
  {
    rfq: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pricePerUnit: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    deliveryDays: { type: Number, required: true, min: 0 },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: ['active', 'withdrawn', 'accepted', 'rejected'],
      default: 'active',
    },
    // Track every change to this bid for the bid-history feature
    history: [
      {
        pricePerUnit: Number,
        totalPrice: Number,
        deliveryDays: Number,
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

bidSchema.index({ rfq: 1, seller: 1 });

const Bid = mongoose.model('Bid', bidSchema);
export default Bid;
