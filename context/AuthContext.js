import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the Auth Context
const AuthContext = createContext(null);

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    // Load token and user info from storage
    const loadStoredData = async () => {
      try {
        setIsLoading(true);
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUserInfo = await AsyncStorage.getItem('userInfo');
        
        if (storedToken && storedUserInfo) {
          setUserToken(storedToken);
          setUserInfo(JSON.parse(storedUserInfo));
        }
      } catch (error) {
        console.error('Error loading stored auth data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStoredData();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      
      // This would normally be an API call to your backend
      // For demo purposes, we're using mock authentication
      if (email === 'test@example.com' && password === 'password') {
        // Simulate API response
        const userData = {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          age: 30,
          gender: 'Male'
        };
        
        // Save authentication data
        const token = 'demo-token-12345';
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
        
        setUserInfo(userData);
        setUserToken(token);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: 'Invalid email or password' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'An error occurred during login' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
  
      // Call the backend API
      const response = await fetch('http://10.0.2.2:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
  
      const data = await response.json();
  
      setIsLoading(false);
  
      if (!response.ok) {
        return { success: false, message: data.message || "Registration failed" };
      }
  
      return { success: true, message: "User registered successfully" };
    } catch (error) {
      setIsLoading(false);
      console.error("Registration error:", error);
      return { success: false, message: "An error occurred during registration" };
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      // Clear stored data
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      // Reset state
      setUserToken(null);
      setUserInfo(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create the context value object with all the functions and state
  const authContextValue = {
    isLoading,
    userInfo,
    userToken,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};