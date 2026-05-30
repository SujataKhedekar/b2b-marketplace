import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { login } from '../features/auth/authSlice.js';

export default function LoginPage() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const submit = (e) => { e.preventDefault(); dispatch(login(form)); };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">Sign in</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={set('email')} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" value={form.password} onChange={set('password')} required />
        </div>
        <button className="btn-primary w-full" disabled={status === 'loading'}>
          {status === 'loading' ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-sm text-center">
          No account? <Link to="/register" className="text-brand">Register</Link>
        </p>
        <p className="text-xs text-gray-400 text-center">Demo: buyer@demo.com / password</p>
      </form>
    </div>
  );
}
