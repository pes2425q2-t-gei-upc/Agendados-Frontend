// app/Services/AuthService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Token storage keys
const TOKEN_KEY = 'user_auth_token';
const USER_INFO_KEY = 'user_info';

// Token management
export const storeUserToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getUserToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const removeUserToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_INFO_KEY);
};

// User info storage
export const storeUserInfo = async (userInfo: any): Promise<void> => {
  await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
};

export const getUserInfo = async (): Promise<any | null> => {
  const userInfo = await AsyncStorage.getItem(USER_INFO_KEY);
  return userInfo ? JSON.parse(userInfo) : null;
};

export const login = async (
  username: string,
  password: string
): Promise<any> => {
  try {
    const response = await fetch(
      'https://agendados-backend-842309366027.europe-southwest1.run.app/api/users/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      }
    );

    if (!response.ok) {
      // Manejo de errores...
    }

    const data = await response.json();

    // Añade logs para depuración
    console.log('Login response:', data);

    // Verifica que el token exista en la respuesta
    if (data.token) {
      await storeUserToken(data.token);
      console.log('Token stored successfully');

      if (data.user) {
        await storeUserInfo(data.user);
      }
      return data;
    } else {
      console.error('No token received from server');
      throw new Error('No authentication token received');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (
  username: string,
  email: string,
  password: string
): Promise<any> => {
  try {
    const response = await fetch(
      'https://agendados-backend-842309366027.europe-southwest1.run.app/api/users/signup',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message ?? 'Failed to register');
    }

    const data = await response.json();

    // Si el registro también devuelve un token, lo guardamos
    if (data.token) {
      await storeUserToken(data.token);

      if (data.user) {
        await storeUserInfo(data.user);
      }
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  await removeUserToken();
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getUserToken();
  return token !== null;
};
