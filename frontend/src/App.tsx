import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import HomeMain from "./pages/home-main";
import LandingPage from "./pages/landing-page";
import ErrorBoundary from "./components/error-boundary";

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('🏠 AuthenticatedApp render:', { isAuthenticated, isLoading });

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('⏳ Showing loading screen...');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">🏠</div>
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    );
  }

  console.log('🎯 Rendering main content:', isAuthenticated ? 'HomeMain' : 'LandingPage');

  return (
    <>
      <Toaster />
      {isAuthenticated ? <HomeMain /> : <LandingPage />}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div id="app-root" style={{ minHeight: '100vh' }}>
            <AuthenticatedApp />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
