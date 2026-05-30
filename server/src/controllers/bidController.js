import Bid from '../models/Bid.js';
import RFQ from '../models/RFQ.js';
import { emitToRFQ, emitToUser } from '../sockets/index.js';
import { notify } from '../services/notificationService.js';

// Re-fetch the sorted bid list for an RFQ and broadcast it to the room.
const broadcastBids = async (rfqId) => {
  const bids = await Bid.find({ rfq: rfqId, status: { $ne: 'withdrawn' } })
    .populate('seller', 'name company rating')
    .sort('pricePerUnit');
  emitToRFQ(rfqId.toString(), 'bids:update', bids);
  return bids;
};

// POST /api/rfqs/:rfqId/bids  (seller)
export const submitBid = async (req, res) => {
  const { pricePerUnit, deliveryDays, message } = req.body;
  const rfq = await RFQ.findById(req.params.rfqId);
  if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
  if (!['open', 'negotiating'].includes(rfq.status))
    return res.status(400).json({ message: 'RFQ is not open for bidding' });

  const totalPrice = pricePerUnit * rfq.quantity;

  // One active bid per seller per RFQ -> update if exists
  let bid = await Bid.findOne({ rfq: rfq._id, seller: req.user._id });
  let isNew = false;
  if (bid) {
    bid.history.push({
      pricePerUnit: bid.pricePerUnit,
      totalPrice: bid.totalPrice,
      deliveryDays: bid.deliveryDays,
    });
    bid.pricePerUnit = pricePerUnit;
    bid.totalPrice = totalPrice;
    bid.deliveryDays = deliveryDays;
    bid.message = message;
    bid.status = 'active';
  } else {
    isNew = true;
    bid = new Bid({
      rfq: rfq._id, seller: req.user._id,
      pricePerUnit, totalPrice, deliveryDays, message,
    });
  }
  await bid.save();

  await broadcastBids(rfq._id);
  await notify({
    user: rfq.buyer,
    type: isNew ? 'new_bid' : 'bid_updated',
    title: isNew ? 'New bid received' : 'Bid updated',
    message: `${req.user.name} ${isNew ? 'placed' : 'updated'} a bid on "${rfq.productName}"`,
    link: `/rfqs/${rfq._id}`,
  });

  res.status(isNew ? 201 : 200).json(bid);
};

// DELETE /api/bids/:id  (seller withdraws)
export const withdrawBid = async (req, res) => {
  const bid = await Bid.findById(req.params.id);
  if (!bid) return res.status(404).json({ message: 'Bid not found' });
  if (bid.seller.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not your bid' });
  bid.status = 'withdrawn';
  await bid.save();
  await broadcastBids(bid.rfq);
  res.json({ message: 'Bid withdrawn' });
};

// GET /api/bids/mine  (seller's own bids)
export const myBids = async (req, res) => {
  const bids = await Bid.find({ seller: req.user._id })
    .populate('rfq', 'productName quantity status deliveryDeadline')
    .sort('-updatedAt');
  res.json(bids);
};
