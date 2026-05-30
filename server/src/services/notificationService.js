import Notification from '../models/Notification.js';
import { emitToUser } from '../sockets/index.js';

/**
 * Persist a notification and push it to the user in real time.
 * Email delivery is stubbed here (see sendEmail) so the channel matches
 * the proposal's "Email + In-app" spec without requiring SMTP setup in dev.
 */
export const notify = async ({ user, type, title, message, link }) => {
  const notification = await Notification.create({ user, type, title, message, link });
  emitToUser(user.toString(), 'notification:new', notification);
  sendEmail({ to: user, title, message }); // fire-and-forget stub
  return notification;
};

// Stub: swap with nodemailer / provider in production
const sendEmail = async ({ to, title }) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[email stub] -> user ${to}: ${title}`);
  }
};
