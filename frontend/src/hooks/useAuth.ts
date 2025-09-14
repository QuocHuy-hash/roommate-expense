import { useState, useEffect } from "react";
import { authAPI, handleAPIError, type User } from "@/lib/api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  console.log('🔐 useAuth hook initialized', { isLoading, isAuthenticated, user: !!user });

  // Check if user is logged in on mount
  useEffect(() => {
    console.log('🔍 useAuth: checking authentication...');
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('user');
        
        if (!token || !savedUser) {
          console.log('🔓 No token or saved user found');
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          return;
        }

        const userData = JSON.parse(savedUser);
        console.log('✅ Auth found:', { email: userData.email });
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        console.log('🏁 Auth check completed');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Add storage event listener to sync auth state across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'user') {
        const token = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Storage sync error:', error);
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    };

    const handleAuthChange = (e: CustomEvent) => {
      if (e.detail.isAuthenticated) {
        setUser(e.detail.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-changed', handleAuthChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-changed', handleAuthChange as EventListener);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('🔐 Attempting login with:', { email, passwordLength: password.length });
      const response = await authAPI.login({ email, password });
      console.log('✅ Login successful:', response);
      
      const { user: userData, token } = response;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      // Dispatch custom event to ensure all components are notified
      window.dispatchEvent(new CustomEvent('auth-changed', { 
        detail: { isAuthenticated: true, user: userData } 
      }));
      
      return userData;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error?.response?.data);
      setIsLoading(false);
      throw new Error(handleAPIError(error));
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register({
        email,
        password,
        firstName,
        lastName
      });
      
      const { user: userData, token } = response;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return userData;
    } catch (error: any) {
      throw new Error(handleAPIError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    
    // Dispatch custom event to ensure all components are notified
    window.dispatchEvent(new CustomEvent('auth-changed', { 
      detail: { isAuthenticated: false, user: null } 
    }));
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout
  };
}
