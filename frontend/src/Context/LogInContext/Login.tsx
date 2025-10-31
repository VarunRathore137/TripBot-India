import React, { createContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface LogInContextType {
  user: any;
  isAuthenticated: boolean;
  loginWithPopup: () => Promise<void>;
  loginWithRedirect: () => Promise<void>;
  logout: () => void;
}

export const LogInContext = createContext<LogInContextType>({
  user: null,
  isAuthenticated: false,
  loginWithPopup: async () => {},
  loginWithRedirect: async () => {},
  logout: () => {},
});

export const LogInProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loginWithPopup, loginWithRedirect, logout } = useAuth0();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (user && isAuthenticated) {
      setCurrentUser(user);
    }
  }, [user, isAuthenticated]);

  return (
    <LogInContext.Provider
      value={{
        user: currentUser,
        isAuthenticated,
        loginWithPopup,
        loginWithRedirect,
        logout,
      }}
    >
      {children}
    </LogInContext.Provider>
  );
};