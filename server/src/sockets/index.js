import jwt from 'jsonwebtoken';

let io = null;

// Authenticate socket connections via JWT passed in handshake auth
const socketAuth = (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication error: no token'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error: invalid token'));
  }
};

export const initSocket = (server, clientUrl) => {
  // Lazy import to avoid circular issues
  return import('socket.io').then(({ Server }) => {
    io = new Server(server, {
      cors: { origin: clientUrl, methods: ['GET', 'POST'], credentials: true },
    });

    io.use(socketAuth);

    io.on('connection', (socket) => {
      // Personal room for direct notifications
      socket.join(`user:${socket.userId}`);
      console.log(`Socket connected: ${socket.id} (user ${socket.userId})`);

      // Buyers/sellers join an RFQ room to receive live bid updates
      socket.on('rfq:join', (rfqId) => socket.join(`rfq:${rfqId}`));
      socket.on('rfq:leave', (rfqId) => socket.leave(`rfq:${rfqId}`));

      // Negotiation rooms
      socket.on('negotiation:join', (negId) => socket.join(`negotiation:${negId}`));
      socket.on('negotiation:leave', (negId) => socket.leave(`negotiation:${negId}`));

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });

    return io;
  });
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

// Convenience emitters used by controllers
export const emitToUser = (userId, event, payload) => {
  if (io) io.to(`user:${userId}`).emit(event, payload);
};

export const emitToRFQ = (rfqId, event, payload) => {
  if (io) io.to(`rfq:${rfqId}`).emit(event, payload);
};

export const emitToNegotiation = (negId, event, payload) => {
  if (io) io.to(`negotiation:${negId}`).emit(event, payload);
};
