import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import StarRating from '../components/StarRating.jsx';

// Forward transitions a seller/buyer can trigger from the UI
const NEXT = {
  pending: 'accepted', accepted: 'processing', processing: 'shipped',
  shipped: 'delivered', delivered: 'completed',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useSelector((s) => s.auth);
  const [order, setOrder] = useState(null);
  const [review, setReview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState(null);

  const load = async () => {
    const { data } = await api.get(`/orders/${id}`);
    setOrder(data);
    // Fetch any existing review for this order
    const { data: r } = await api.get(`/orders/${id}/review`);
    setReview(r);
  };
  useEffect(() => { load(); }, [id]);

  const advance = async (status) => {
    setBusy(true);
    try { await api.patch(`/orders/${id}/status`, { status }); await load(); }
    finally { setBusy(false); }
  };

  // Demo payment: confirm directly (production verifies via gateway/webhook)
  const pay = async (gateway) => {
    setBusy(true);
    try {
      await api.post(`/orders/${id}/pay/confirm`, { gateway, transactionId: `demo_${Date.now()}` });
      await load();
    } finally { setBusy(false); }
  };

  const submitReview = async () => {
    setBusy(true);
    setReviewError(null);
    try {
      await api.post(`/orders/${id}/review`, reviewForm);
      await load();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally { setBusy(false); }
  };

  if (!order) return <p>Loading…</p>;
  const isBuyer = order.buyer?._id === user._id;
  const isSeller = order.seller?._id === user._id;
  const next = NEXT[order.status];

  return (
    <div className="max-w-xl space-y-4">
      <div className="card">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold">{order.rfq?.productName}</h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="text-gray-500 mt-1">
          {order.buyer?.company} → {order.seller?.company}
        </p>
        <p className="mt-2">Amount: <b>{order.amount}</b> · Commission: {order.commission}</p>
        <p>Payment: <b>{order.payment?.status}</b>
          {order.payment?.gateway ? ` via ${order.payment.gateway}` : ''}</p>
      </div>

      {/* Buyer payment */}
      {isBuyer && order.payment?.status === 'unpaid' && (
        <div className="card space-y-2">
          <h2 className="font-semibold">Complete payment</h2>
          <div className="flex gap-2">
            <button disabled={busy} onClick={() => pay('stripe')} className="btn-primary">Pay with Stripe</button>
            <button disabled={busy} onClick={() => pay('razorpay')} className="btn-outline">Pay with Razorpay</button>
          </div>
          <p className="text-xs text-gray-400">Demo mode — confirms instantly without charging.</p>
        </div>
      )}

      {/* Status advancement */}
      {next && (
        <div className="card">
          <h2 className="font-semibold mb-2">Update status</h2>
          {/* Seller drives accepted→shipped; buyer confirms delivered→completed */}
          {((isSeller && ['pending','accepted','processing','shipped'].includes(order.status)) ||
            (isBuyer && order.status === 'delivered')) ? (
            <button disabled={busy} onClick={() => advance(next)} className="btn-primary">
              Mark as {next}
            </button>
          ) : (
            <p className="text-sm text-gray-500">Waiting on the other party.</p>
          )}
        </div>
      )}

      {/* Review section — only for completed orders */}
      {order.status === 'completed' && (
        <div className="card">
          <h2 className="font-semibold mb-2">Seller review</h2>

          {review ? (
            <div>
              <StarRating value={review.rating} />
              {review.comment && <p className="text-sm text-gray-600 mt-1">{review.comment}</p>}
              <p className="text-xs text-gray-400 mt-1">
                by {review.buyer?.company || review.buyer?.name}
              </p>
            </div>
          ) : isBuyer ? (
            <div className="space-y-3">
              {reviewError && <p className="text-red-600 text-sm">{reviewError}</p>}
              <div>
                <label className="label">Your rating</label>
                <StarRating
                  value={reviewForm.rating}
                  onChange={(rating) => setReviewForm({ ...reviewForm, rating })}
                />
              </div>
              <div>
                <label className="label">Comment (optional)</label>
                <textarea
                  className="input"
                  rows="3"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="How was working with this seller?"
                />
              </div>
              <button disabled={busy} onClick={submitReview} className="btn-primary">
                Submit review
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No review left yet.</p>
          )}
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold mb-2">History</h2>
        <ul className="text-sm text-gray-600 space-y-1">
          {order.statusHistory?.map((h, i) => (
            <li key={i}>{h.status} — {new Date(h.at).toLocaleString()}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
