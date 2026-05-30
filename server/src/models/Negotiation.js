import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['message', 'counter_offer'], default: 'message' },
    text: { type: String, trim: true },
    // For counter offers
    offer: {
      pricePerUnit: Number,
      deliveryDays: Number,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const negotiationSchema = new mongoose.Schema(
  {
    rfq: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
    bid: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'agreed', 'closed'], default: 'open' },
    messages: [messageSchema],
  },
  { timestamps: true }
);

const Negotiation = mongoose.model('Negotiation', negotiationSchema);
export default Negotiation;
