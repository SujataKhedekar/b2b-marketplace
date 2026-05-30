import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { register } from '../features/auth/authSlice.js';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer', company: '' });

  const submit = (e) => { e.preventDefault(); dispatch(register(form)); };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">Create account</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div><label className="label">Name</label>
          <input className="input" value={form.name} onChange={set('name')} required /></div>
        <div><label className="label">Company</label>
          <input className="input" value={form.company} onChange={set('company')} /></div>
        <div><label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={set('email')} required /></div>
        <div><label className="label">Password</label>
          <input className="input" type="password" value={form.password} onChange={set('password')} required /></div>
        <div><label className="label">I am a</label>
          <select className="input" value={form.role} onChange={set('role')}>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select></div>
        <button className="btn-primary w-full" disabled={status === 'loading'}>Register</button>
        <p className="text-sm text-center">Have an account? <Link to="/login" className="text-brand">Sign in</Link></p>
      </form>
    </div>
  );
}
