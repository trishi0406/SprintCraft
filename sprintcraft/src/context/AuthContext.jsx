import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, getToken, setToken } from '../lib/api';
import { normalizeUser } from '../lib/normalize';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // While we validate a stored token we must not redirect to /login.
  const [loading, setLoading] = useState(() => !!getToken());

  // Restore the session from a stored JWT.
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    api
      .get('/auth/me')
      .then((data) => {
        if (!cancelled) setUser(normalizeUser(data));
      })
      .catch((err) => {
        // Only drop the token if the server actually rejected it.
        if (err.status === 401 || err.status === 404) setToken(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // A 401 from any API call means the token expired or is invalid.
  useEffect(() => {
    const onExpired = () => logout();
    window.addEventListener('sprintcraft:auth-expired', onExpired);
    return () => window.removeEventListener('sprintcraft:auth-expired', onExpired);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    try {
      const data = await api.post('/auth/login', { email, password });
      setToken(data.token);
      setUser(normalizeUser(data));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const data = await api.post('/auth/register', { name, email, password });
      setToken(data.token);
      setUser(normalizeUser(data));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
