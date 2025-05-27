/* eslint-disable @typescript-eslint/no-unused-vars */
// app/Services/AuthService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Consistent API base URL
const API_BASE =
  'https://agendados-backend-842309366027.europe-southwest1.run.app';

// Token storage keys
const TOKEN_KEY = 'user_auth_token';
const USER_INFO_KEY = 'user_info';

// Define type for profile update data that AuthService will handle
interface ProfileUpdateData {
  username?: string;
  name?: string;
  email?: string;
  avatar?: string; // Crucial for the photo upload feature
  // Add other fields that can be updated via this function
}

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
    console.log('[Login] Attempting login with username');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    const response = await fetch(`${API_BASE}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ username, password }),
      signal: controller.signal,
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    console.log('[Login] Server response status:', response.status);

    // Read response as text first to safely handle any response format
    const responseText = await response.text();

    // Try to parse it as JSON if possible
    let data: any;
    try {
      data = JSON.parse(responseText);
      console.log('[Login] Response parsed successfully as JSON');
    } catch (e) {
      console.error(
        '[Login] Response is not valid JSON:',
        responseText.substring(0, 200)
      );
      throw new Error('La respuesta del servidor no es un formato JSON válido');
    }

    // Check if the response was successful
    if (!response.ok) {
      console.error('[Login] Error response:', data);
      throw new Error(
        data?.message ?? `Error del servidor: ${response.status}`
      );
    }

    // Verifica que el token exista en la respuesta
    if (data.token) {
      await storeUserToken(data.token);
      console.log('[Login] Token stored successfully');

      if (data.user) {
        await storeUserInfo(data.user);
        console.log('[Login] User info stored successfully');
      }
      return data;
    } else {
      console.error('[Login] No token received from server');
      throw new Error('No se recibió token de autenticación');
    }
  } catch (error) {
    const isTimeoutError =
      error instanceof Error && error.name === 'AbortError';

    if (isTimeoutError) {
      console.error('[Login] Request timed out');
      throw new Error(
        'La solicitud ha tomado demasiado tiempo. Por favor, inténtalo de nuevo.'
      );
    }

    // Better error logging
    if (error instanceof Error) {
      console.error('[Login] Error:', error.message);
      console.error('[Login] Stack:', error.stack);
    } else {
      console.error('[Login] Unknown error:', error);
    }

    throw error;
  }
};

export const register = async (
  username: string,
  email: string,
  password: string
): Promise<any> => {
  try {
    console.log('[Register] Attempting registration');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    const response = await fetch(`${API_BASE}/api/users/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
      signal: controller.signal,
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    console.log('[Register] Server response status:', response.status);

    // Read response as text first to safely handle any response format
    const responseText = await response.text();

    // Try to parse it as JSON if possible
    let data: any;
    try {
      data = JSON.parse(responseText);
      console.log('[Register] Response parsed successfully as JSON');
    } catch (e) {
      console.error(
        '[Register] Response is not valid JSON:',
        responseText.substring(0, 200)
      );
      throw new Error('La respuesta del servidor no es un formato JSON válido');
    }

    // Check if the response was successful
    if (!response.ok) {
      console.error('[Register] Error response:', data);
      throw new Error(
        data?.message ?? `Error del servidor: ${response.status}`
      );
    }

    // Si el registro también devuelve un token, lo guardamos
    if (data.token) {
      await storeUserToken(data.token);
      console.log('[Register] Token stored successfully');

      if (data.user) {
        await storeUserInfo(data.user);
        console.log('[Register] User info stored successfully');
      }
    }

    return data;
  } catch (error) {
    const isTimeoutError =
      error instanceof Error && error.name === 'AbortError';

    if (isTimeoutError) {
      console.error('[Register] Request timed out');
      throw new Error(
        'La solicitud ha tomado demasiado tiempo. Por favor, inténtalo de nuevo.'
      );
    }

    // Better error logging
    if (error instanceof Error) {
      console.error('[Register] Error:', error.message);
      console.error('[Register] Stack:', error.stack);
    } else {
      console.error('[Register] Unknown error:', error);
    }

    throw error;
  }
};

export const requestPasswordReset = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('[PasswordReset] Requesting password reset');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    const response = await fetch(`${API_BASE}/api/users/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email }),
      signal: controller.signal,
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    console.log('[PasswordReset] Server response status:', response.status);

    // Read response as text first to safely handle any response format
    const responseText = await response.text();

    // Try to parse it as JSON if possible
    let data: any;
    try {
      data = JSON.parse(responseText);
      console.log('[PasswordReset] Response parsed successfully as JSON');
    } catch (e) {
      console.error(
        '[PasswordReset] Response is not valid JSON:',
        responseText.substring(0, 200)
      );
      throw new Error('La respuesta del servidor no es un formato JSON válido');
    }

    // Check if the response was successful
    if (!response.ok) {
      console.error('[PasswordReset] Error response:', data);
      throw new Error(
        data?.message ?? 'Error al solicitar el restablecimiento de contraseña'
      );
    }

    return {
      success: true,
      message: data.message ?? 'Se ha enviado un correo con las instrucciones',
    };
  } catch (error) {
    const isTimeoutError =
      error instanceof Error && error.name === 'AbortError';

    if (isTimeoutError) {
      console.error('[PasswordReset] Request timed out');
      return {
        success: false,
        message:
          'La solicitud ha tomado demasiado tiempo. Por favor, inténtalo de nuevo.',
      };
    }

    // Better error logging
    if (error instanceof Error) {
      console.error('[PasswordReset] Error:', error.message);
      console.error('[PasswordReset] Stack:', error.stack);
      return {
        success: false,
        message: error.message || 'Error al procesar la solicitud',
      };
    } else {
      console.error('[PasswordReset] Unknown error:', error);
      return {
        success: false,
        message: 'Error desconocido al procesar la solicitud',
      };
    }
  }
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('[ResetPassword] Resetting password with token');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    const response = await fetch(`${API_BASE}/api/users/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
      signal: controller.signal,
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    console.log('[ResetPassword] Server response status:', response.status);

    // Read response as text first to safely handle any response format
    const responseText = await response.text();

    // Try to parse it as JSON if possible
    let data: any;
    try {
      data = JSON.parse(responseText);
      console.log('[ResetPassword] Response parsed successfully as JSON');
    } catch (e) {
      console.error(
        '[ResetPassword] Response is not valid JSON:',
        responseText.substring(0, 200)
      );
      throw new Error('La respuesta del servidor no es un formato JSON válido');
    }

    // Check if the response was successful
    if (!response.ok) {
      console.error('[ResetPassword] Error response:', data);
      throw new Error(data?.message ?? 'Error al restablecer la contraseña');
    }

    return {
      success: true,
      message: 'Contraseña actualizada correctamente',
    };
  } catch (error) {
    const isTimeoutError =
      error instanceof Error && error.name === 'AbortError';

    if (isTimeoutError) {
      console.error('[ResetPassword] Request timed out');
      return {
        success: false,
        message:
          'La solicitud ha tomado demasiado tiempo. Por favor, inténtalo de nuevo.',
      };
    }

    // Better error logging
    if (error instanceof Error) {
      console.error('[ResetPassword] Error:', error.message);
      console.error('[ResetPassword] Stack:', error.stack);
      return {
        success: false,
        message: error.message || 'Error al procesar la solicitud',
      };
    } else {
      console.error('[ResetPassword] Unknown error:', error);
      return {
        success: false,
        message: 'Error desconocido al procesar la solicitud',
      };
    }
  }
};

export const changePassword = async (
  token: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> => {
  try {
    console.log('[ChangePassword] Changing user password');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    const response = await fetch(`${API_BASE}/api/users/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
      signal: controller.signal,
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    console.log('[ChangePassword] Server response status:', response.status);

    if (!response.ok) {
      // Try to read error data for debugging
      const errorData = await response.json().catch(() => null);
      console.error(
        '[ChangePassword] Error response:',
        errorData ?? response.status
      );
      return false;
    }

    return true;
  } catch (error) {
    const isTimeoutError =
      error instanceof Error && error.name === 'AbortError';

    if (isTimeoutError) {
      console.error('[ChangePassword] Request timed out');
      throw new Error(
        'La solicitud ha tomado demasiado tiempo. Por favor, inténtalo de nuevo.'
      );
    }

    // Better error logging
    if (error instanceof Error) {
      console.error('[ChangePassword] Error:', error.message);
      console.error('[ChangePassword] Stack:', error.stack);
    } else {
      console.error('[ChangePassword] Unknown error:', error);
    }

    throw error;
  }
};

export const updateUserProfile = async (
  token: string,
  data: Partial<ProfileUpdateData>
): Promise<boolean> => {
  try {
    console.log('[UpdateProfile] Attempting to update user profile with data:', data);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    // Common endpoint for updating current user's profile is /api/users/me or /api/users/profile
    // Using PATCH as it's for partial updates.
    const response = await fetch(`${API_BASE}/api/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('[UpdateProfile] Server response status:', response.status);

    if (!response.ok) {
      let errorDetails = `Server error: ${response.status}`;
      try {
        // Try to parse JSON error response from backend
        const errorData = await response.json();
        errorDetails = errorData?.message || JSON.stringify(errorData);
      } catch (e) {
        // If response is not JSON, use the raw text
        errorDetails = await response.text();
      }
      console.error('[UpdateProfile] Error response:', errorDetails);
      throw new Error(errorDetails);
    }

    // If the backend returns the updated user object and you need to use it:
    // const updatedUserInfo = await response.json();
    // await storeUserInfo(updatedUserInfo); // Update user info in AsyncStorage
    // console.log('[UpdateProfile] Profile updated successfully via API and local storage updated.');
    // return updatedUserInfo; // Or true, depending on what AuthContext expects

    console.log('[UpdateProfile] Profile update API call successful.');
    return true; // Indicates success to the caller (AuthContext)

  } catch (error) {
    const isTimeoutError = error instanceof Error && error.name === 'AbortError';
    if (isTimeoutError) {
      console.error('[UpdateProfile] Request timed out');
      throw new Error('La solicitud de actualización de perfil ha tomado demasiado tiempo.');
    }

    if (error instanceof Error) {
      console.error('[UpdateProfile] Error:', error.message);
      throw new Error(`Error al actualizar el perfil: ${error.message}`);
    } else {
      console.error('[UpdateProfile] Unknown error:', error);
      throw new Error('Error desconocido al actualizar el perfil.');
    }
  }
};

export const logout = async (): Promise<void> => {
  console.log('[Logout] Removing user authentication data');
  await removeUserToken();
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getUserToken();
  return !!token;
};

export const loginWithGoogle = async (idToken: string): Promise<any> => {
  try {
    console.log('[GoogleLogin] Sending idToken to backend');

    // Make sure we're not sending undefined or null
    if (!idToken) {
      throw new Error('Token de ID de Google no válido');
    }

    // Create request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    // This is the corrected URL with a trailing slash!
    const response = await fetch(`${API_BASE}/api/users/auth/google/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ idToken }),
      signal: controller.signal,
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    console.log('[GoogleLogin] Server response status:', response.status);

    // Read response as text first to safely handle any response format
    const responseText = await response.text();

    // Try to parse it as JSON if possible
    let data: any;
    try {
      data = JSON.parse(responseText);
      console.log('[GoogleLogin] Response parsed successfully as JSON');
    } catch (e) {
      console.error(
        '[GoogleLogin] Response is not valid JSON:',
        responseText.substring(0, 200)
      );
      throw new Error('La respuesta del servidor no es un formato JSON válido');
    }

    // Check if the response was successful
    if (!response.ok) {
      console.error('[GoogleLogin] Error response:', data);
      throw new Error(
        data?.message ?? `Error del servidor: ${response.status}`
      );
    }

    console.log('[GoogleLogin] Authentication successful');

    // Store user data if authentication was successful
    if (data.token) {
      await storeUserToken(data.token);
      console.log('[GoogleLogin] Token stored successfully');

      if (data.user) {
        await storeUserInfo(data.user);
        console.log('[GoogleLogin] User info stored successfully');
      }
    } else {
      console.error('[GoogleLogin] No token in response');
      throw new Error('No se recibió un token de autenticación');
    }

    return data;
  } catch (error) {
    // Fixed error handling for React Native environment
    const isTimeoutError =
      error instanceof Error && error.name === 'AbortError';

    if (isTimeoutError) {
      console.error('[GoogleLogin] Request timed out');
      throw new Error(
        'La solicitud ha tomado demasiado tiempo. Por favor, inténtalo de nuevo.'
      );
    }

    // Better error logging
    if (error instanceof Error) {
      console.error('[GoogleLogin] Error:', error.message);
      console.error('[GoogleLogin] Stack:', error.stack);
    } else {
      console.error('[GoogleLogin] Unknown error:', error);
    }

    throw error;
  }
};
