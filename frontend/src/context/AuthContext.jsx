import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

const API_BASE = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  // Validate token on boot
  useEffect(() => {
    const verifyUserToken = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser({ _id: userData._id, username: userData.username, email: userData.email });
          setIsAuthenticated(true);
          setDemoMode(!!userData.demoMode);
        } else {
          // Token expired or invalid
          handleLogout();
        }
      } catch (error) {
        console.error('Boot Auth check failed:', error);
        // If server is down, keep token but set loading false so user can see app states
      } finally {
        setIsLoading(false);
      }
    };

    verifyUserToken();
  }, [token]);

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({ _id: data._id, username: data.username, email: data.email });
      setIsAuthenticated(true);
      setDemoMode(!!data.demoMode);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleRegister = async (username, email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({ _id: data._id, username: data.username, email: data.email });
      setIsAuthenticated(true);
      setDemoMode(!!data.demoMode);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setDemoMode(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      isLoading,
      demoMode,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
