import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './sockets/index.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  const server = http.createServer(app);
  await initSocket(server, process.env.CLIENT_URL || 'http://localhost:5173');
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();
