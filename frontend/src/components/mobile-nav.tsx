import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ExpenseForm from "./expense-form";
import { Home, List, Plus, BarChart3, User } from "lucide-react";

type Tab = 'dashboard' | 'transactions' | 'reports' | 'profile';

interface MobileNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const handleTabClick = (tab: Tab) => {
    onTabChange(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border sm:hidden z-40" data-testid="mobile-nav">
      <div className="flex items-center justify-around py-2">
        <Button
          variant="ghost"
          className={`flex flex-col items-center py-2 px-4 ${activeTab === 'dashboard' ? 'text-primary' : 'text-muted-foreground'}`}
          onClick={() => handleTabClick('dashboard')}
          data-testid="button-nav-dashboard"
        >
          <Home size={20} />
          <span className="text-xs mt-1">Tổng quan</span>
        </Button>

        <Button
          variant="ghost"
          className={`flex flex-col items-center py-2 px-4 ${activeTab === 'transactions' ? 'text-primary' : 'text-muted-foreground'}`}
          onClick={() => handleTabClick('transactions')}
          data-testid="button-nav-transactions"
        >
          <List size={20} />
          <span className="text-xs mt-1">Giao dịch</span>
        </Button>

        <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              className="rounded-full bg-primary/10 text-primary hover:bg-primary/20"
              data-testid="button-nav-add"
            >
              <Plus size={20} />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <ExpenseForm onSuccess={() => setShowExpenseModal(false)} />
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          className={`flex flex-col items-center py-2 px-4 ${activeTab === 'reports' ? 'text-primary' : 'text-muted-foreground'}`}
          onClick={() => handleTabClick('reports')}
          data-testid="button-nav-reports"
        >
          <BarChart3 size={20} />
          <span className="text-xs mt-1">Báo cáo</span>
        </Button>

        <Button
          variant="ghost"
          className={`flex flex-col items-center py-2 px-4 ${activeTab === 'profile' ? 'text-primary' : 'text-muted-foreground'}`}
          onClick={() => handleTabClick('profile')}
          data-testid="button-nav-profile"
        >
          <User size={20} />
          <span className="text-xs mt-1">Cá nhân</span>
        </Button>
      </div>
    </nav>
  );
}
