import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

// POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, password, role, company, phone } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already registered' });

  // Prevent self-registration as admin
  const safeRole = role === 'seller' ? 'seller' : 'buyer';
  const user = await User.create({ name, email, password, role: safeRole, company, phone });

  res.status(201).json({
    token: generateToken(user._id),
    user: sanitize(user),
  });
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  if (!user.isActive) return res.status(403).json({ message: 'Account disabled' });

  res.json({ token: generateToken(user._id), user: sanitize(user) });
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

const sanitize = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  company: u.company,
  phone: u.phone,
  isVerified: u.isVerified,
  rating: u.rating,
});
