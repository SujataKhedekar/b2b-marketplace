import mongoose from 'mongoose';

const rfqSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    budget: { type: Number, required: true, min: 0 }, // max acceptable price
    deliveryLocation: { type: String, required: true, trim: true },
    deliveryDeadline: { type: Date, required: true },
    description: { type: String, trim: true },
    attachments: [{ type: String }], // file URLs / paths
    status: {
      type: String,
      enum: ['open', 'negotiating', 'awarded', 'closed', 'cancelled'],
      default: 'open',
    },
    awardedBid: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid', default: null },
  },
  { timestamps: true }
);

const RFQ = mongoose.model('RFQ', rfqSchema);
export default RFQ;
