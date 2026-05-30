import Notification from '../models/Notification.js';

// GET /api/notifications
export const listNotifications = async (req, res) => {
  const items = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50);
  const unread = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({ items, unread });
};

// PATCH /api/notifications/:id/read
export const markRead = async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true }
  );
  res.json({ message: 'Marked read' });
};

// PATCH /api/notifications/read-all
export const markAllRead = async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ message: 'All marked read' });
};
