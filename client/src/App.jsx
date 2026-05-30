import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadMe } from './features/auth/authSlice.js';
import { received, fetchNotifications } from './features/notifications/notificationSlice.js';
import { getSocket } from './services/socket.js';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RFQListPage from './pages/RFQListPage.jsx';
import RFQCreatePage from './pages/RFQCreatePage.jsx';
import RFQDetailPage from './pages/RFQDetailPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import OrderDetailPage from './pages/OrderDetailPage.jsx';
import NegotiationPage from './pages/NegotiationPage.jsx';
import SellerReviewsPage from './pages/SellerReviewsPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

export default function App() {
  const dispatch = useDispatch();
  const { user, booted } = useSelector((s) => s.auth);

  useEffect(() => {
    if (localStorage.getItem('token')) dispatch(loadMe());
    else dispatch({ type: 'auth/loadMe/rejected' });
  }, [dispatch]);

  // Wire live notifications once authenticated
  useEffect(() => {
    if (!user) return;
    dispatch(fetchNotifications());
    const socket = getSocket();
    if (!socket) return;
    const handler = (n) => dispatch(received(n));
    socket.on('notification:new', handler);
    return () => socket.off('notification:new', handler);
  }, [user, dispatch]);

  if (!booted) return <div className="p-8 text-center text-gray-500">Loading…</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/rfqs" element={<RFQListPage />} />
          <Route path="/rfqs/new" element={<RFQCreatePage />} />
          <Route path="/rfqs/:id" element={<RFQDetailPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/negotiations/:id" element={<NegotiationPage />} />
          <Route path="/sellers/:sellerId/reviews" element={<SellerReviewsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
