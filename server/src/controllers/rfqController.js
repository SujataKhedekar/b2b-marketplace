import RFQ from '../models/RFQ.js';
import Bid from '../models/Bid.js';

// POST /api/rfqs  (buyer)
export const createRFQ = async (req, res) => {
  const { productName, quantity, budget, deliveryLocation, deliveryDeadline, description, attachments } = req.body;
  const rfq = await RFQ.create({
    buyer: req.user._id,
    productName, quantity, budget, deliveryLocation, deliveryDeadline, description, attachments,
  });
  res.status(201).json(rfq);
};

// GET /api/rfqs  (sellers see open RFQs; buyers see their own)
export const listRFQs = async (req, res) => {
  const filter = {};
  if (req.user.role === 'buyer') {
    filter.buyer = req.user._id;
  } else if (req.user.role === 'seller') {
    filter.status = { $in: ['open', 'negotiating'] };
  }
  // admin: no filter -> all
  const rfqs = await RFQ.find(filter).populate('buyer', 'name company').sort('-createdAt');
  res.json(rfqs);
};

// GET /api/rfqs/:id
export const getRFQ = async (req, res) => {
  const rfq = await RFQ.findById(req.params.id).populate('buyer', 'name company');
  if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
  const bids = await Bid.find({ rfq: rfq._id, status: { $ne: 'withdrawn' } })
    .populate('seller', 'name company rating')
    .sort('pricePerUnit');
  res.json({ rfq, bids });
};

// PATCH /api/rfqs/:id/close  (buyer owner)
export const closeRFQ = async (req, res) => {
  const rfq = await RFQ.findById(req.params.id);
  if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
  if (rfq.buyer.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not your RFQ' });
  rfq.status = 'closed';
  await rfq.save();
  res.json(rfq);
};
