import Negotiation from '../models/Negotiation.js';
import Bid from '../models/Bid.js';
import RFQ from '../models/RFQ.js';
import { emitToNegotiation } from '../sockets/index.js';
import { notify } from '../services/notificationService.js';

// POST /api/bids/:bidId/negotiate  (buyer starts/gets negotiation thread)
export const startNegotiation = async (req, res) => {
  const bid = await Bid.findById(req.params.bidId).populate('rfq');
  if (!bid) return res.status(404).json({ message: 'Bid not found' });
  if (bid.rfq.buyer.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not your RFQ' });

  let neg = await Negotiation.findOne({ bid: bid._id });
  if (!neg) {
    neg = await Negotiation.create({
      rfq: bid.rfq._id, bid: bid._id,
      buyer: bid.rfq.buyer, seller: bid.seller,
    });
    bid.rfq.status = 'negotiating';
    await bid.rfq.save();
  }
  res.status(201).json(neg);
};

// POST /api/negotiations/:id/messages
export const postMessage = async (req, res) => {
  const { text, type, offer } = req.body;
  const neg = await Negotiation.findById(req.params.id);
  if (!neg) return res.status(404).json({ message: 'Negotiation not found' });

  const isParty = [neg.buyer.toString(), neg.seller.toString()].includes(req.user._id.toString());
  if (!isParty) return res.status(403).json({ message: 'Not part of this negotiation' });

  const msg = { sender: req.user._id, type: type || 'message', text, offer };
  neg.messages.push(msg);
  await neg.save();

  const saved = neg.messages[neg.messages.length - 1];
  emitToNegotiation(neg._id.toString(), 'negotiation:message', saved);

  const recipient =
    req.user._id.toString() === neg.buyer.toString() ? neg.seller : neg.buyer;
  await notify({
    user: recipient,
    type: 'negotiation',
    title: 'New negotiation message',
    message: type === 'counter_offer' ? 'A counter-offer was made' : 'New message in negotiation',
    link: `/negotiations/${neg._id}`,
  });

  res.status(201).json(saved);
};

// GET /api/negotiations/:id
export const getNegotiation = async (req, res) => {
  const neg = await Negotiation.findById(req.params.id)
    .populate('buyer', 'name company')
    .populate('seller', 'name company')
    .populate('messages.sender', 'name role');
  if (!neg) return res.status(404).json({ message: 'Negotiation not found' });
  res.json(neg);
};
