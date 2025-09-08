import { useState, useEffect } from "react";
import { authAPI, handleAPIError, type User } from "@/lib/api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, setForceUpdate] = useState(0); // Force update mechanism

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log('Checking auth status...');
        const token = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('user');
        
        console.log('Found token:', !!token, 'Found user:', !!savedUser);
        
        if (!token || !savedUser) {
          console.log('No token or user found, setting not authenticated');
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          return;
        }

        const userData = JSON.parse(savedUser);
        console.log('Setting user as authenticated:', userData);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Add storage event listener to sync auth state across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'user') {
        console.log('Storage changed, rechecking auth...');
        const token = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            console.log('Storage sync: Setting user as authenticated:', userData);
            setUser(userData);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Storage sync error:', error);
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          console.log('Storage sync: Clearing authentication');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    };

    const handleAuthChange = (e: CustomEvent) => {
      console.log('Auth change event received:', e.detail);
      if (e.detail.isAuthenticated) {
        console.log('Custom event: Setting authenticated state');
        setUser(e.detail.user);
        setIsAuthenticated(true);
      } else {
        console.log('Custom event: Clearing authenticated state');
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
      console.log('Login attempt for:', email);
      setIsLoading(true);
      const response = await authAPI.login({ email, password });
      
      const { user: userData, token } = response;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('Login successful, user authenticated:', userData);
      console.log('Setting user state and authentication status...');
      
      // Force re-render by setting states in the correct order
      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      // Dispatch custom event to ensure all components are notified
      window.dispatchEvent(new CustomEvent('auth-changed', { 
        detail: { isAuthenticated: true, user: userData } 
      }));
      
      console.log('Login state updated - user should be redirected to home');
      
      return userData;
    } catch (error: any) {
      console.error('Login error:', error);
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
    console.log('Logout function called');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    console.log('Setting logout state...');
    setUser(null);
    setIsAuthenticated(false);
    
    // Force component re-render
    setForceUpdate(prev => prev + 1);
    
    // Dispatch custom event to ensure all components are notified
    window.dispatchEvent(new CustomEvent('auth-changed', { 
      detail: { isAuthenticated: false, user: null } 
    }));
    
    console.log('Logout completed - user should be logged out and redirected to landing');
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
