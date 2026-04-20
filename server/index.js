const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Volatile state to track who is currently in what trip
const activeUsers = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_trip', ({ tripId, user }) => {
    socket.join(tripId);
    console.log(`Socket ${socket.id} joined trip ${tripId} as ${user.name}`);
    
    // Store user info attached to socket ID
    activeUsers[socket.id] = { tripId, user };

    // Broadcast to the room that this user joined
    io.to(tripId).emit('user_joined', { user, timestamp: new Date() });
    
    // Send updated active users list to the room
    const usersInRoom = Object.values(activeUsers)
      .filter(u => u.tripId === tripId)
      .map(u => u.user);
    io.to(tripId).emit('active_users_update', usersInRoom);
  });

  socket.on('typing', ({ tripId, user }) => {
    // Broadcast to everyone else in the room
    socket.to(tripId).emit('user_typing', { user });
  });

  socket.on('stop_typing', ({ tripId, user }) => {
    socket.to(tripId).emit('user_stop_typing', { user });
  });

  // Generic data sync relay
  socket.on('sync_action', ({ tripId, action, payload }) => {
    // action e.g., 'ADD_EXPENSE', 'ADD_ACTIVITY'
    console.log(`Relaying action [${action}] to trip ${tripId}`);
    socket.to(tripId).emit('receive_action', { action, payload });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const userInfo = activeUsers[socket.id];
    
    if (userInfo) {
      const { tripId, user } = userInfo;
      io.to(tripId).emit('user_left', { user, timestamp: new Date() });
      
      delete activeUsers[socket.id];
      
      const usersInRoom = Object.values(activeUsers)
        .filter(u => u.tripId === tripId)
        .map(u => u.user);
      io.to(tripId).emit('active_users_update', usersInRoom);
    }
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server running on http://localhost:${PORT}`);
});
