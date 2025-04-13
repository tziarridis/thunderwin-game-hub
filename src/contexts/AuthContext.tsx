
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
  updateBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  updateBalance: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('casino_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    } else {
      // Create a demo user for testing
      const demoUser = {
        id: 'guest',
        username: 'Demo User',
        email: 'demo@example.com',
        balance: 1000,
      };
      setUser(demoUser);
      setIsAuthenticated(true);
      localStorage.setItem('casino_user', JSON.stringify(demoUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Demo login function
    const mockUser = {
      id: 'user_' + Math.random().toString(36).substring(2, 9),
      username: email.split('@')[0],
      email,
      balance: 1000,
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('casino_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('casino_user');
  };

  const register = async (username: string, email: string, password: string) => {
    // Demo register function
    const mockUser = {
      id: 'user_' + Math.random().toString(36).substring(2, 9),
      username,
      email,
      balance: 1000,
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('casino_user', JSON.stringify(mockUser));
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem('casino_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        register,
        updateBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
