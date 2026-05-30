import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api.js';
import StarRating from '../components/StarRating.jsx';

export default function SellerReviewsPage() {
  const { sellerId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/sellers/${sellerId}/reviews`).then(({ data }) => setData(data));
  }, [sellerId]);

  if (!data) return <p>Loading…</p>;
  const { seller, reviews } = data;

  return (
    <div className="max-w-xl space-y-4">
      <div className="card">
        <h1 className="text-2xl font-bold">{seller.company || seller.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          <StarRating value={seller.rating} />
          <span className="text-gray-500 text-sm">
            {seller.rating || 0} · {seller.totalReviews || 0} review{seller.totalReviews === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          reviews.map((r) => (
            <div key={r._id} className="card">
              <StarRating value={r.rating} size="text-base" />
              {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
              <p className="text-xs text-gray-400 mt-1">
                {r.buyer?.company || r.buyer?.name} · {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
