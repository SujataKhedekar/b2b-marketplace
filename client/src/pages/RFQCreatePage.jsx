import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function RFQCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    productName: '', quantity: 1, budget: 0, deliveryLocation: '', deliveryDeadline: '', description: '',
  });
  const [error, setError] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/rfqs', {
        ...form, quantity: Number(form.quantity), budget: Number(form.budget),
      });
      navigate(`/rfqs/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create RFQ');
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Post an RFQ</h1>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <form onSubmit={submit} className="card space-y-4">
        <div><label className="label">Product name</label>
          <input className="input" value={form.productName} onChange={set('productName')} required /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Quantity</label>
            <input className="input" type="number" min="1" value={form.quantity} onChange={set('quantity')} required /></div>
          <div><label className="label">Max price / unit</label>
            <input className="input" type="number" min="0" step="0.01" value={form.budget} onChange={set('budget')} required /></div>
        </div>
        <div><label className="label">Delivery location</label>
          <input className="input" value={form.deliveryLocation} onChange={set('deliveryLocation')} required /></div>
        <div><label className="label">Delivery deadline</label>
          <input className="input" type="date" value={form.deliveryDeadline} onChange={set('deliveryDeadline')} required /></div>
        <div><label className="label">Description</label>
          <textarea className="input" rows="3" value={form.description} onChange={set('description')} /></div>
        <button className="btn-primary w-full">Publish RFQ</button>
      </form>
    </div>
  );
}
