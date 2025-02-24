import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  
  const API_URL = 'http://10.0.2.2:5000'; // Use this for Android emulator
  // const API_URL = 'http://localhost:5000'; // Use this for iOS simulator
  
  // Function to handle login
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/api/login`, {
        email,
        password,
      });
      
      const { token, user } = response.data;
      
      setUserToken(token);
      setUserInfo(user);
      
      // Store token and user info
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      console.error('Login error:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };
  
  // Function to handle registration
  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/api/register`, userData);
      setIsLoading(false);
      return { success: true, message: response.data.message };
    } catch (error) {
      setIsLoading(false);
      console.error('Registration error:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };
  
  // Function to handle logout
  const logout = async () => {
    try {
      setIsLoading(true);
      setUserToken(null);
      setUserInfo(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      setIsLoading(false);
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);
    }
  };
  
  // Check if user is logged in on app start
  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUserInfo = await AsyncStorage.getItem('userInfo');
      
      if (storedToken && storedUserInfo) {
        setUserToken(storedToken);
        setUserInfo(JSON.parse(storedUserInfo));
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Token restore error:', error);
      setIsLoading(false);
    }
  };
  
  // Run on component mount
  useEffect(() => {
    isLoggedIn();
  }, []);
  
  return (
    <AuthContext.Provider 
      value={{ 
        login, 
        register, 
        logout, 
        isLoading, 
        userToken, 
        userInfo 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;