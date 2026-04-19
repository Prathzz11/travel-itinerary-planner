import React, { createContext, useEffect, useState, useContext, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [socket, setSocket] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  
  // Track mock intervals so we can clear them
  const mockTimeouts = useRef([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to backend Socket server');
    });

    newSocket.on('active_users_update', (users) => {
      setActiveUsers(users);
    });

    newSocket.on('user_typing', ({ user: typingUser }) => {
      setTypingUsers(prev => {
        if (!prev.find(u => u.id === typingUser.id)) {
          return [...prev, typingUser];
        }
        return prev;
      });
      // Auto-clear typing indicator after 3 seconds
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(u => u.id !== typingUser.id));
      }, 3000);
    });

    newSocket.on('user_stop_typing', ({ user: stopTypingUser }) => {
      setTypingUsers(prev => prev.filter(u => u.id !== stopTypingUser.id));
    });

    return () => {
      newSocket.close();
      mockTimeouts.current.forEach(clearTimeout);
    };
  }, []);

  const joinTripRoom = useCallback((tripId) => {
    if (socket && user) {
      socket.emit('join_trip', { tripId, user });
      
      // Clear old mock intervals if joining a new room
      mockTimeouts.current.forEach(clearTimeout);
      
      // Simulate real-time alerts after joining a room
      const t1 = setTimeout(() => {
        addNotification("Alex Travels just joined the trip", "info");
      }, 5000);
      
      const t2 = setTimeout(() => {
        addNotification("Sarah Maps added a new activity: 'Tokyo Tower Visit'", "success");
      }, 15000);

      const t3 = setTimeout(() => {
        addNotification("Alex Travels logged a new expense: $45.00 for Dinner", "warning");
      }, 25000);

      mockTimeouts.current = [t1, t2, t3];
    }
  }, [socket, user, addNotification]);

  const emitTyping = useCallback((tripId) => {
    if (socket && user) {
      socket.emit('typing', { tripId, user });
    }
  }, [socket, user]);

  const emitStopTyping = useCallback((tripId) => {
    if (socket && user) {
      socket.emit('stop_typing', { tripId, user });
    }
  }, [socket, user]);

  const emitAction = useCallback((tripId, action, payload) => {
    if (socket) {
      socket.emit('sync_action', { tripId, action, payload });
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{ 
      socket, 
      activeUsers, 
      typingUsers,
      joinTripRoom,
      emitTyping,
      emitStopTyping,
      emitAction
    }}>
      {children}
    </SocketContext.Provider>
  );
};