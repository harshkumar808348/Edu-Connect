import config from '../config/config';

export const registerStudent = async (userData) => {
  try {
    const response = await fetch(`${config.API_URL}/auth/student/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData)
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const loginStudent = async (credentials) => {
  try {
    const response = await fetch(`${config.API_URL}/auth/student/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
}; 