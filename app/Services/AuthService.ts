export const login = async (
  username: string,
  password: string
): Promise<any> => {
  try {
    const response = await fetch('http://192.168.1.43:8000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();

      // Check if it's a user not found error
      if (
        response.status === 404 ||
        errorData.message?.includes('user not found')
      ) {
        throw new Error('User does not exist');
      }

      // Handle other errors
      throw new Error(errorData.message ?? 'Failed to login');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
};

export const register = (
  username: string,
  email: string,
  password: string
): Promise<Response> => {
  return fetch('http://192.168.1.43:8000/api/users/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });
};
