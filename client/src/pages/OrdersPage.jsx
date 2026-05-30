import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/orders').then(({ data }) => setOrders(data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      {loading ? <p>Loading…</p> : orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o._id} to={`/orders/${o._id}`} className="card flex justify-between items-center hover:shadow-md">
              <div>
                <h2 className="font-semibold">{o.rfq?.productName}</h2>
                <p className="text-sm text-gray-500">
                  {o.buyer?.company} → {o.seller?.company} · {o.amount}
                  · payment: {o.payment?.status}
                </p>
              </div>
              <StatusBadge status={o.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
