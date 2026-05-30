import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function RFQListPage() {
  const { user } = useSelector((s) => s.auth);
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rfqs').then(({ data }) => setRfqs(data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{user?.role === 'seller' ? 'Open RFQs' : 'RFQs'}</h1>
        {user?.role === 'buyer' && <Link to="/rfqs/new" className="btn-primary">New RFQ</Link>}
      </div>
      {loading ? <p>Loading…</p> : rfqs.length === 0 ? (
        <p className="text-gray-500">No RFQs yet.</p>
      ) : (
        <div className="space-y-3">
          {rfqs.map((r) => (
            <Link key={r._id} to={`/rfqs/${r._id}`} className="card flex justify-between items-center hover:shadow-md">
              <div>
                <h2 className="font-semibold">{r.productName}</h2>
                <p className="text-sm text-gray-500">
                  Qty {r.quantity} · Budget {r.budget}/unit · {r.deliveryLocation}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
