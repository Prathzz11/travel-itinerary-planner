import React, { createContext } from 'react';

// No-op socket context — socket.io has been removed.
// Kept as a shell so existing consumers don't crash.
export const SocketContext = createContext({
  socket: null,
  isConnected: false,
});

export const SocketProvider = ({ children }) => {
  return (
    <SocketContext.Provider value={{ socket: null, isConnected: false }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;