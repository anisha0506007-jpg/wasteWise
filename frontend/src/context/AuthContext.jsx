import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useToast } from '../hooks/useToast.js';
import { UNAUTHORIZED_EVENT } from '../services/api.js';
import * as authService from '../services/authService.js';
import { AuthContext } from './authContextInstance.js';

export function AuthProvider({ children }) {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until we know if someone is logged in
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Asks the backend "who am I?" using the cookie
  const fetchCurrentUser = useCallback(async () => {
    try {
      const data = await authService.getCurrentUser();
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // On page load / refresh: restore the session from the cookie
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // If any API call returns 401 while someone is logged in, their session ended
  useEffect(() => {
    const handleUnauthorized = () => {
      if (userRef.current) {
        setUser(null);
        toast.info('Your session has expired. Please log in again.');
      }
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [toast]);

  const login = useCallback(async (credentials) => {
    const data = await authService.loginUser(credentials);
    setUser(data.user);
    return data.user;
  }, []);

  // Registering does not log the user in
  const register = useCallback((formData) => authService.registerUser(formData), []);

  const logout = useCallback(async () => {
    await authService.logoutUser(); // clears the cookie on the server
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, register, logout, fetchCurrentUser }),
    [user, loading, login, register, logout, fetchCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}