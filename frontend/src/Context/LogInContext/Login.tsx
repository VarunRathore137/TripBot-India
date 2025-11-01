import React, { createContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface User {
  email: string;
  name?: string;
  picture?: string;
}

interface LogInContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginWithPopup: () => Promise<void>;
  loginWithRedirect: () => Promise<void>;
  logout: () => void;
  checkLocalAuth: () => void;
}

export const LogInContext = createContext<LogInContextType>({
  user: null,
  isAuthenticated: false,
  loginWithPopup: async () => {},
  loginWithRedirect: async () => {},
  logout: () => {},
  checkLocalAuth: () => {},
});

export const LogInProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: auth0User, isAuthenticated: auth0IsAuthenticated, loginWithPopup, loginWithRedirect, logout: auth0Logout } = useAuth0();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkLocalAuth = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUser = localStorage.getItem('user');
    
    if (isLoggedIn && storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    } else {
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    auth0Logout();
  };

  useEffect(() => {
    if (auth0User && auth0IsAuthenticated) {
      setCurrentUser(auth0User);
      setIsAuthenticated(true);
    } else {
      checkLocalAuth();
    }
  }, [auth0User, auth0IsAuthenticated]);

  return (
    <LogInContext.Provider
      value={{
        user: currentUser,
        isAuthenticated,
        loginWithPopup,
        loginWithRedirect,
        logout,
        checkLocalAuth,
      }}
    >
      {children}
    </LogInContext.Provider>
  );
};