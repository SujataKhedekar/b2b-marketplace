import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api.js';
import { getSocket } from '../services/socket.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function RFQDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [rfq, setRfq] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidForm, setBidForm] = useState({ pricePerUnit: '', deliveryDays: '', message: '' });
  const [error, setError] = useState(null);

  const load = () =>
    api.get(`/rfqs/${id}`).then(({ data }) => { setRfq(data.rfq); setBids(data.bids); });

  useEffect(() => { load(); }, [id]);

  // Join the RFQ room and listen for live bid updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('rfq:join', id);
    const onUpdate = (list) => setBids(list);
    socket.on('bids:update', onUpdate);
    return () => { socket.emit('rfq:leave', id); socket.off('bids:update', onUpdate); };
  }, [id]);

  const submitBid = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post(`/rfqs/${id}/bids`, {
        pricePerUnit: Number(bidForm.pricePerUnit),
        deliveryDays: Number(bidForm.deliveryDays),
        message: bidForm.message,
      });
      setBidForm({ pricePerUnit: '', deliveryDays: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Bid failed');
    }
  };

  const acceptBid = async (bidId) => {
    const { data } = await api.post(`/bids/${bidId}/accept`);
    navigate(`/orders/${data._id}`);
  };

  const negotiate = async (bidId) => {
    const { data } = await api.post(`/bids/${bidId}/negotiate`);
    navigate(`/negotiations/${data._id}`);
  };

  if (!rfq) return <p>Loading…</p>;

  const lowest = bids.length ? Math.min(...bids.map((b) => b.pricePerUnit)) : null;
  const isBuyerOwner = user.role === 'buyer' && rfq.buyer?._id === user._id;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{rfq.productName}</h1>
            <p className="text-gray-500">
              Qty {rfq.quantity} · Max {rfq.budget}/unit · {rfq.deliveryLocation}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Deadline {new Date(rfq.deliveryDeadline).toLocaleDateString()}
            </p>
            {rfq.description && <p className="mt-2 text-sm">{rfq.description}</p>}
          </div>
          <StatusBadge status={rfq.status} />
        </div>
      </div>

      {/* Seller bid form */}
      {user.role === 'seller' && ['open', 'negotiating'].includes(rfq.status) && (
        <form onSubmit={submitBid} className="card space-y-3">
          <h2 className="font-semibold">Place / update your bid</h2>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Price / unit</label>
              <input className="input" type="number" min="0" step="0.01" required
                value={bidForm.pricePerUnit}
                onChange={(e) => setBidForm({ ...bidForm, pricePerUnit: e.target.value })} /></div>
            <div><label className="label">Delivery days</label>
              <input className="input" type="number" min="0" required
                value={bidForm.deliveryDays}
                onChange={(e) => setBidForm({ ...bidForm, deliveryDays: e.target.value })} /></div>
          </div>
          <input className="input" placeholder="Message (optional)"
            value={bidForm.message}
            onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })} />
          <button className="btn-primary">Submit bid</button>
        </form>
      )}

      {/* Live bid list */}
      <div>
        <h2 className="font-semibold mb-3">Bids ({bids.length}) — live</h2>
        <div className="space-y-2">
          {bids.map((b) => (
            <div key={b._id}
              className={`card flex justify-between items-center ${b.pricePerUnit === lowest ? 'ring-2 ring-green-400' : ''}`}>
              <div>
                <p className="font-medium">
                  {b.seller?.company || b.seller?.name}
                  {b.pricePerUnit === lowest && <span className="badge bg-green-100 text-green-700 ml-2">Lowest</span>}
                </p>
                <p className="text-sm text-gray-500">
                  {b.pricePerUnit}/unit · total {b.totalPrice} · {b.deliveryDays} days
                  {b.seller?._id && (
                    <Link to={`/sellers/${b.seller._id}/reviews`} className="text-brand ml-1">
                      {b.seller?.rating ? `· ★ ${b.seller.rating}` : '· reviews'}
                    </Link>
                  )}
                </p>
                {b.message && <p className="text-xs text-gray-400 mt-1">{b.message}</p>}
              </div>
              {isBuyerOwner && rfq.status !== 'awarded' && (
                <div className="flex gap-2">
                  <button onClick={() => negotiate(b._id)} className="btn-outline py-1 px-3">Negotiate</button>
                  <button onClick={() => acceptBid(b._id)} className="btn-primary py-1 px-3">Accept</button>
                </div>
              )}
            </div>
          ))}
          {bids.length === 0 && <p className="text-gray-500">No bids yet.</p>}
        </div>
      </div>
    </div>
  );
}
