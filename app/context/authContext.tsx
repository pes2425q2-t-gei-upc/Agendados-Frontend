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
  changePassword as apiChangePassword,
  storeUserToken, // En lugar de saveUserToken
  storeUserInfo,
  getUserProfile, // Agregar esta importación
} from '../Services/AuthService';

// Definir tipos de usuario
interface UserInfo {
  id?: number | string;
  username?: string;
  name?: string;
  email?: string;
  profile_image?: string;
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
        console.log('🔍 Checking for stored token...');
        const token = await getUserToken();
        const user = await getUserInfo();

        console.log('🔍 Token found:', !!token);
        console.log('🔍 User found:', !!user);

        if (token) {
          setUserToken(token);
          setUserInfo(user);
          setIsAuthenticated(true);
          console.log('✅ User authenticated from storage');
        } else {
          console.log('❌ No token found in storage');
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
    try {
      // Usa las funciones originales que tienen las claves correctas
      await storeUserToken(token);
      if (user) {
        await storeUserInfo(user);
      }

      // Actualizar estado local
      setUserToken(token);
      setUserInfo(user ?? null);
      setIsAuthenticated(true);

      // Refresh del perfil del usuario después del login exitoso
      try {
        const updatedProfile = await getUserProfile(token);
        if (updatedProfile) {
          // Actualizar con la información más reciente del servidor
          setUserInfo(updatedProfile);
          await storeUserInfo(updatedProfile);
        }
      } catch (profileError) {
        // Si falla el refresh del perfil, no afecta el login principal
        // Solo registramos el error silenciosamente
        if (profileError instanceof Error) {
          // Error al refrescar perfil, pero el login fue exitoso
        }
      }
    } catch (error) {
      throw error;
    }
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

  const updateUserProfile = async (
    data: Partial<UserInfo>
  ): Promise<boolean> => {
    if (!userToken) {
      console.error('updateUserProfile: No user token available');
      return false;
    }
    if (!userInfo) {
      console.error('updateUserProfile: No user info available');
      return false;
    }

    setLoading(true);
    try {
      // Normalizar los datos: si viene avatar o profile_image, asegurarse de que ambos estén sincronizados
      const normalizedData = { ...data };

      if (data.avatar && !data.profile_image) {
        normalizedData.profile_image = data.avatar;
      } else if (data.profile_image && !data.avatar) {
        normalizedData.avatar = data.profile_image;
      }

      // Fusionar con la información existente
      const newUserInfo = { ...userInfo, ...normalizedData };

      // Asegurarse de que ambos campos estén sincronizados
      if (newUserInfo.profile_image) {
        newUserInfo.avatar = newUserInfo.profile_image;
      } else if (newUserInfo.avatar) {
        newUserInfo.profile_image = newUserInfo.avatar;
      }

      setUserInfo(newUserInfo);
      await storeUserInfo(newUserInfo);
      console.log('✅ User profile updated locally');

      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
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
