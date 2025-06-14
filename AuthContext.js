import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const AuthContext = createContext();

// Use your Vercel deployment URL
const API_BASE_URL = 'https://api-alpha-nine-75.vercel.app';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from storage when the app starts
  useEffect(() => {
    const loadToken = async () => {
      try {
        setIsLoading(true);
        const storedToken = await AsyncStorage.getItem('userToken');
        console.log('AuthContext - Stored token:', storedToken);
        setToken(storedToken);
      } catch (error) {
        console.error('Error retrieving token:', error);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  // Log token changes for debugging
  useEffect(() => {
    console.log('Token state changed:', token);
  }, [token]);

  const login = async (credentials) => {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/login`);
      const response = await axios.post(`${API_BASE_URL}/login`, credentials);
      if (response.data.token) {
        const newToken = response.data.token;
        await AsyncStorage.setItem('userToken', newToken);
        setToken(newToken);
        console.log('Token stored after login:', newToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };

  const register = async (registrationData) => {
    try {
      console.log('Attempting registration to:', `${API_BASE_URL}/register`);
      console.log('Registration data:', registrationData);
      
      const response = await axios.post(`${API_BASE_URL}/register`, registrationData);
      
      if (response.data.token) {
        const newToken = response.data.token;
        await AsyncStorage.setItem('userToken', newToken);
        setToken(newToken);
        console.log('Token stored after registration:', newToken);
        return response.data.user;
      } else if (response.data.user && response.data.user.id) {
        const tempToken = `user_${response.data.user.id}`;
        await AsyncStorage.setItem('userToken', tempToken);
        setToken(tempToken);
        console.log('Generated temp token:', tempToken);
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setToken(null);
      console.log('User signed out, token cleared');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        isLoading,
        login,
        register,
        signOut,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};