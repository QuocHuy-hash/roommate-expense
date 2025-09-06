import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiUrl } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/app-header";
import Dashboard from "@/components/dashboard";
import TransactionList from "@/components/transaction-list";
import Reports from "@/components/reports";
import Profile from "@/components/profile";
import MobileNav from "@/components/mobile-nav";

type Tab = 'dashboard' | 'transactions' | 'reports' | 'profile';

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = apiUrl("/api/login");
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen app-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" data-testid="loading-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <Dashboard />
            <div className="block sm:hidden">
              <TransactionList />
            </div>
          </>
        );
      case 'transactions':
        return <TransactionList />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <Profile />;
      default:
        return (
          <>
            <Dashboard />
            <div className="hidden sm:block">
              <TransactionList />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen app-container" data-testid="page-home">
      <AppHeader />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Desktop: Show dashboard and transactions side by side */}
        <div className="hidden sm:block">
          <Dashboard />
          <TransactionList />
        </div>
        
        {/* Mobile: Show active section based on navigation */}
        <div className="block sm:hidden">
          {renderActiveSection()}
        </div>
      </main>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Add bottom padding on mobile to account for bottom navigation */}
      <div className="h-20 sm:hidden"></div>
    </div>
  );
}
