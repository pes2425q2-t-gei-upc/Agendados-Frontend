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
const API_BASE =
  'https://agendados-backend-842309366027.europe-south1.run.app';

export const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE}/api/users/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al solicitar el restablecimiento de contraseña');
    }

    return { success: true, message: data.message || 'Se ha enviado un correo con las instrucciones' };
  } catch (error) {
    console.error('Password reset request error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error al procesar la solicitud' 
    };
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE}/api/users/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al restablecer la contraseña');
    }

    return { success: true, message: 'Contraseña actualizada correctamente' };
  } catch (error) {
    console.error('Password reset error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error al procesar la solicitud' 
    };
  }
};

export const changePassword = async (
  token: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/api/users/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    if (!response.ok) {
      // Opcional: leer mensaje de error del servidor para debug
      const errorData = await response.json().catch(() => null);
      console.error('Change password failed:', errorData ?? response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Network or unexpected error in changePassword:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  await removeUserToken();
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getUserToken();
  return !!token;
};

export const loginWithGoogle = async (idToken: string): Promise<any> => {
  try {
    const response = await fetch(
      'https://agendados-backend-842309366027.europe-southwest1.run.app/api/auth/google',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      }
    );

    let data: any;
    if (!response.ok) {
      // Try to parse error as JSON, if fails, log raw text
      let errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || 'Error al iniciar sesión con Google');
      } catch (jsonErr) {
        // If parsing fails, log the raw response
        console.error('Google login error - non-JSON response:', errorText);
        throw new Error('Error al iniciar sesión con Google: respuesta inesperada del servidor');
      }
    }

    // Try to parse success as JSON, else log raw
    let rawText = await response.text();
    try {
      data = JSON.parse(rawText);
    } catch (jsonErr) {
      console.error('Google login success - non-JSON response:', rawText);
      throw new Error('Error al procesar la respuesta del servidor de Google.');
    }

    if (data.token) {
      await storeUserToken(data.token);
      if (data.user) {
        await storeUserInfo(data.user);
      }
      return data;
    } else {
      throw new Error('No se recibió el token de autenticación');
    }
  } catch (error) {
    console.error('Error en login con Google:', error);
    throw error;
  }
};
