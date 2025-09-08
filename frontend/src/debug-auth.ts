// Debug utility to test auth functionality
export const debugAuth = () => {
  console.log('=== DEBUG AUTH STATE ===');
  console.log('Token:', localStorage.getItem('auth_token'));
  console.log('User:', localStorage.getItem('user'));
  console.log('========================');
};

export const clearAuth = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  console.log('Auth cleared manually');
  window.dispatchEvent(new CustomEvent('auth-changed', { 
    detail: { isAuthenticated: false, user: null } 
  }));
};

// Make it available globally for testing
(window as any).debugAuth = debugAuth;
(window as any).clearAuth = clearAuth;
