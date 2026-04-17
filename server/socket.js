const { Server } = require('socket.io');

let io = null;

/**
 * Initialise Socket.IO on the given HTTP server.
 * Should be called once in index.js after the server is created.
 *
 * @param {import('http').Server} server - The Node.js HTTP server instance
 * @returns {import('socket.io').Server}
 */
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Client joins a trip room to receive real-time updates for that trip
    socket.on('join_trip', (tripId) => {
      socket.join(tripId);
      console.log(`Socket ${socket.id} joined trip room: ${tripId}`);
    });

    // Client leaves a trip room
    socket.on('leave_trip', (tripId) => {
      socket.leave(tripId);
      console.log(`Socket ${socket.id} left trip room: ${tripId}`);
    });

    // Broadcast trip changes (e.g. itinerary edits) to all room members
    socket.on('trip_update', ({ tripId, data }) => {
      // Broadcast to others in the room (exclude sender)
      socket.to(tripId).emit('trip_updated', { tripId, data });
    });

    // Broadcast fork count change to all connected clients
    socket.on('fork_count_updated', ({ tripId, forkCount }) => {
      io.emit('fork_count_updated', { tripId, forkCount });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Returns the initialised Socket.IO instance.
 * Throws if called before initSocket().
 *
 * @returns {import('socket.io').Server}
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialised. Call initSocket(server) first.');
  }
  return io;
};

module.exports = { initSocket, getIO };
