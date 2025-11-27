// User service for handling user registration and authentication
import { getBackendUrl } from './apiUtils';

interface RegisterUserParams {
  username: string;
  password: string;
}

interface RegisterUserResponse {
  success: boolean;
  userId?: string;
  username?: string;
  message?: string;
  error?: string;
}

interface LoginUserResponse {
  success: boolean;
  userId?: string;
  username?: string;
  message?: string;
  error?: string;
}

export const userService = {
  // Register a new user
  registerUser: async (params: RegisterUserParams): Promise<RegisterUserResponse> => {
    const backendUrl = getBackendUrl();
    
    try {
      console.log('Registering user with backend URL:', backendUrl);
      console.log('Registration params:', params);
      
      const response = await fetch(`${backendUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      console.log('Registration response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to register user. Status:', response.status, 'Error:', errorText);
        return { 
          success: false, 
          error: `Failed to register user: ${response.status} ${errorText}` 
        };
      }
      
      const data = await response.json();
      console.log('Registration response:', data);
      return data;
    } catch (error) {
      console.error('Network error during user registration:', error);
      return { 
        success: false, 
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  },
  
  // Login a user
  loginUser: async (params: RegisterUserParams): Promise<LoginUserResponse> => {
    const backendUrl = getBackendUrl();
    
    try {
      console.log('Logging in user with backend URL:', backendUrl);
      console.log('Login params:', params);
      
      const response = await fetch(`${backendUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to login user. Status:', response.status, 'Error:', errorText);
        return { 
          success: false, 
          error: `Failed to login user: ${response.status} ${errorText}` 
        };
      }
      
      const data = await response.json();
      console.log('Login response:', data);
      return data;
    } catch (error) {
      console.error('Network error during user login:', error);
      return { 
        success: false, 
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
};