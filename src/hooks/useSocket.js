import { useContext } from 'react';
import { SocketContext } from '../contexts/SocketContext';

// No-op hook — socket.io removed
export const useSocket = () => useContext(SocketContext);
export default useSocket;