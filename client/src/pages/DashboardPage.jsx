import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useSelector((s) => s.auth);

  const cards = {
    buyer: [
      { to: '/rfqs/new', title: 'Post an RFQ', desc: 'Broadcast a bulk requirement to sellers' },
      { to: '/rfqs', title: 'My RFQs', desc: 'Review incoming bids in real time' },
      { to: '/orders', title: 'My Orders', desc: 'Track delivery and payments' },
    ],
    seller: [
      { to: '/rfqs', title: 'Open RFQs', desc: 'Find requirements and place bids' },
      { to: '/orders', title: 'My Orders', desc: 'Fulfil accepted orders' },
    ],
    admin: [
      { to: '/admin', title: 'Admin Console', desc: 'Users, analytics & oversight' },
      { to: '/rfqs', title: 'All RFQs', desc: 'Monitor platform activity' },
      { to: '/orders', title: 'All Orders', desc: 'Track transactions' },
    ],
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Welcome, {user?.name}</h1>
      <p className="text-gray-500 mb-6 capitalize">{user?.role} dashboard</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(cards[user?.role] || []).map((c) => (
          <Link key={c.to} to={c.to} className="card hover:shadow-md transition">
            <h2 className="font-semibold text-brand">{c.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
