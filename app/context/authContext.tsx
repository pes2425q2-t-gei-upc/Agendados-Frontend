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
  storeUserInfo,
  updateUserProfile as apiUpdateProfile,
  changePassword as apiChangePassword,
} from '../Services/AuthService';

// Definir tipos de usuario
interface UserInfo {
  id?: number | string;
  username?: string;
  name?: string;
  email?: string;
  avatar?: string;
  createdAt?: string;
  [key: string]: any;
}

// Definir tipo para el contexto
interface AuthContextType {
  isAuthenticated: boolean;
  userToken: string | null;
  userInfo: UserInfo | null;
  login: (token: string, userInfo?: UserInfo) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUserProfile: (data: Partial<UserInfo>) => Promise<boolean>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  getToken: () => string | null;
  getUsername: () => string | undefined | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userToken: null,
  userInfo: null,
  login: async () => {},
  logout: async () => {},
  loading: true,
  updateUserProfile: async () => false,
  changePassword: async () => false,
  getToken: () => null,
  getUsername: () => null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
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

  const login = async (token: string, user?: UserInfo) => {
    setUserToken(token);
    if (user) {
      setUserInfo(user);
    }
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      setLoading(true);
      await removeUserToken();
      setUserToken(null);
      setUserInfo(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para actualizar el perfil
  const updateUserProfile = async (
    data: Partial<UserInfo>
  ): Promise<boolean> => {
    try {
      setLoading(true);

      if (!userToken) {
        throw new Error('No authentication token available');
      }

      // Llamar a la API para actualizar el perfil
      const updatedUser = await apiUpdateProfile(userToken, data);

      if (updatedUser) {
        // Actualizar estado local con la información actualizada
        const newUserInfo = { ...userInfo, ...updatedUser };
        setUserInfo(newUserInfo);

        // Guardar en almacenamiento local
        await storeUserInfo(newUserInfo);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para cambiar la contraseña
  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      setLoading(true);

      if (!userToken) {
        throw new Error('No authentication token available');
      }

      // Llamar a la API para cambiar la contraseña
      const success = await apiChangePassword(
        userToken,
        currentPassword,
        newPassword
      );
      return success;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getToken = (): string | null => {
    return userToken;
  };

  const getUsername = (): string | undefined | null => {
    return userInfo?.username;
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
        updateUserProfile,
        changePassword,
        getToken,
        getUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
