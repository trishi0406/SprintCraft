import { io } from 'socket.io-client';
import { getToken, setSocketIdProvider } from './api';

let socket = null;

export function connectSocket() {
  const token = getToken();
  if (!token) return null;
  if (socket) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL || undefined, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: Infinity,
  });
  setSocketIdProvider(() => (socket && socket.connected ? socket.id : null));
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  setSocketIdProvider(() => null);
}
