import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice.js';
import { allRead } from '../features/notifications/notificationSlice.js';
import api from '../services/api.js';

export default function AppLayout() {
  const { user } = useSelector((s) => s.auth);
  const { unread } = useSelector((s) => s.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLogout = () => { dispatch(logout()); navigate('/login'); };
  const onBell = async () => { await api.patch('/notifications/read-all'); dispatch(allRead()); };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-bold text-brand">B2B Marketplace</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/rfqs" className="hover:text-brand">RFQs</Link>
            <Link to="/orders" className="hover:text-brand">Orders</Link>
            {user?.role === 'admin' && <Link to="/admin" className="hover:text-brand">Admin</Link>}
            <button onClick={onBell} className="relative">
              🔔
              {unread > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                  {unread}
                </span>
              )}
            </button>
            <span className="text-gray-500">{user?.name} ({user?.role})</span>
            <button onClick={onLogout} className="btn-outline py-1 px-3">Logout</button>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
