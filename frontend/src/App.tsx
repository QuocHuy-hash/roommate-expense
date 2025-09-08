import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import HomeMain from "./pages/home-main";
import LandingPage from "./pages/landing-page";
import "./debug-auth"; // Import debug utilities

function AuthenticatedApp() {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('AuthenticatedApp rendering...', { 
    isAuthenticated, 
    isLoading, 
    user: user ? user.email : 'no user' 
  });

  // Add effect to track authentication state changes
  useEffect(() => {
    console.log('Authentication state changed:', {
      isAuthenticated,
      isLoading,
      hasUser: !!user,
      userEmail: user?.email || 'no user'
    });
    
    if (!isAuthenticated && !isLoading) {
      console.log('User is not authenticated and not loading - should show landing page');
    } else if (isAuthenticated && user) {
      console.log('User is authenticated - should show home page');
    }
  }, [isAuthenticated, isLoading, user]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('Showing loading screen...');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">🏠</div>
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    );
  }

  console.log('Deciding which component to render:', isAuthenticated ? 'HomeMain' : 'LandingPage');

  return (
    <>
      <Toaster />
      {isAuthenticated ? <HomeMain /> : <LandingPage />}
    </>
  );
}

function App() {
  console.log('App component rendering...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div id="app-root" style={{ minHeight: '100vh' }}>
          <AuthenticatedApp />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
