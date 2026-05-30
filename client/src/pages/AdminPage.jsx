import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  const loadUsers = () => api.get('/admin/users').then(({ data }) => setUsers(data));
  useEffect(() => {
    api.get('/admin/analytics').then(({ data }) => setStats(data));
    loadUsers();
  }, []);

  const toggle = async (id, field, value) => {
    await api.patch(`/admin/users/${id}`, { [field]: value });
    loadUsers();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Console</h1>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            ['Users', stats.users], ['RFQs', stats.rfqs], ['Bids', stats.bids],
            ['Orders', stats.orders], ['Revenue', stats.revenue], ['Commission', stats.commission],
          ].map(([label, val]) => (
            <div key={label} className="card text-center">
              <p className="text-2xl font-bold">{val}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card overflow-x-auto">
        <h2 className="font-semibold mb-3">Users</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b">
            <th className="py-2">Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Active</th>
          </tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b last:border-0">
                <td className="py-2">{u.name}</td>
                <td>{u.email}</td>
                <td className="capitalize">{u.role}</td>
                <td><button className="text-brand" onClick={() => toggle(u._id, 'isVerified', !u.isVerified)}>
                  {u.isVerified ? 'Yes' : 'No'}</button></td>
                <td><button className="text-brand" onClick={() => toggle(u._id, 'isActive', !u.isActive)}>
                  {u.isActive ? 'Yes' : 'No'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
