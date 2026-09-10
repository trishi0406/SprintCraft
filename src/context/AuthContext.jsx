import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { mockUsers } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usersList, setUsersList] = useState(() => {
    try {
      const saved = localStorage.getItem('sprintcraft_users');
      return saved ? JSON.parse(saved) : mockUsers;
    } catch {
      return mockUsers;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sprintcraft_session');
      return saved ? JSON.parse(saved) : mockUsers[0]; // default to Trishi Sharma
    } catch {
      return mockUsers[0];
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('sprintcraft_auth') === 'true' || true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sprintcraft_users', JSON.stringify(usersList));
    } catch (e) {
      console.error(e);
    }
  }, [usersList]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('sprintcraft_session', JSON.stringify(user));
        localStorage.setItem('sprintcraft_auth', 'true');
      } else {
        localStorage.removeItem('sprintcraft_session');
        localStorage.setItem('sprintcraft_auth', 'false');
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  const login = useCallback((email, password) => {
    const found = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      setIsAuthenticated(true);
      return { success: true };
    }
    if (email && password) {
      const genericUser = {
        id: 'u_' + Date.now(),
        name: email.split('@')[0],
        email,
        avatar: null,
        initials: email.slice(0, 2).toUpperCase(),
        color: '#8B5CF6',
        online: true,
      };
      setUsersList((prev) => [...prev, genericUser]);
      setUser(genericUser);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  }, [usersList]);

  const register = useCallback((name, email) => {
    const newUser = {
      id: 'u_new_' + Date.now(),
      name,
      email,
      avatar: null,
      initials: name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'US',
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      online: true,
    };
    setUsersList((prev) => [...prev, newUser]);
    setUser(newUser);
    setIsAuthenticated(true);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
