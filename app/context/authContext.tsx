// app/context/authContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

import {
  getUserToken,
  getUserInfo,
  removeUserToken,
} from '../Services/AuthService';

interface AuthContextType {
  isAuthenticated: boolean;
  userToken: string | null;
  userInfo: any | null;
  login: (token: string, userInfo?: any) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userToken: null,
  userInfo: null,
  login: async () => {},
  logout: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Verificar si hay token al cargar la app
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await getUserToken();
        const user = await getUserInfo();

        if (token) {
          setUserToken(token);
          setUserInfo(user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  const login = async (token: string, user?: any) => {
    setUserToken(token);
    if (user) {
      setUserInfo(user);
    }
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await removeUserToken();
    setUserToken(null);
    setUserInfo(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userToken,
        userInfo,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
