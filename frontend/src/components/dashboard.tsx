import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import ExpenseForm from "./expense-form";
import SettlementForm from "./settlement-form";
import { Users, User, CreditCard, Scale, Plus, Handshake, Download } from "lucide-react";
import type { User as UserType } from "@shared/schema";
import { apiUrl } from "@/lib/utils";

type BalanceData = {
  totalPaid: number;
  totalShared: number;
  netBalance: number;
  personalExpenses: number;
};

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);

  // Get other user ID (hardcoded for 2-user system)
  const otherUserId = user?.id === "927070657" ? "927070658" : "927070657";

  const { data: balance, isLoading: balanceLoading, error: balanceError } = useQuery<BalanceData>({
    queryKey: ["/api/balance", otherUserId],
    enabled: !!user && !!otherUserId,
  });

  // Handle balance query error
  if (balanceError) {
    if (isUnauthorizedError(balanceError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }

  const handleExportCSV = async () => {
    try {
      const response = await fetch(apiUrl('/api/export/csv'), { credentials: 'include' });
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'expenses-export.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "CSV exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export CSV",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getBalanceMessage = (netBalance: number) => {
    if (netBalance > 0) {
      return "Người kia nợ bạn";
    } else if (netBalance < 0) {
      return "Bạn nợ người kia";
    } else {
      return "Không có nợ";
    }
  };

  if (balanceLoading) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Tổng quan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8" data-testid="dashboard">
      <h2 className="text-2xl font-bold text-foreground mb-6" data-testid="text-dashboard-title">
        Tổng quan
      </h2>
      
      {/* Balance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        {/* Total Shared Expenses */}
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Chi tiêu chung</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground" data-testid="text-total-shared">
                  {formatCurrency(balance?.totalShared || 0)}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mt-2 sm:mt-0 self-start sm:self-auto">
                <Users className="text-primary" size={16} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Expenses */}
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Chi tiêu cá nhân</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground" data-testid="text-personal-expenses">
                  {formatCurrency(balance?.personalExpenses || 0)}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-success/10 rounded-lg flex items-center justify-center mt-2 sm:mt-0 self-start sm:self-auto">
                <User className="text-success" size={16} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amount Paid */}
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Đã trả</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground" data-testid="text-total-paid">
                  {formatCurrency(balance?.totalPaid || 0)}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-warning/10 rounded-lg flex items-center justify-center mt-2 sm:mt-0 self-start sm:self-auto">
                <CreditCard className="text-warning" size={16} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Balance */}
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Số dư</p>
                <p className={`text-lg sm:text-2xl font-bold ${balance?.netBalance && balance.netBalance > 0 ? 'balance-positive' : balance?.netBalance && balance.netBalance < 0 ? 'balance-negative' : 'text-foreground'}`} data-testid="text-net-balance">
                  {balance?.netBalance ? (balance.netBalance > 0 ? '+' : '') + formatCurrency(Math.abs(balance.netBalance)) : formatCurrency(0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block" data-testid="text-balance-message">
                  {balance?.netBalance ? getBalanceMessage(balance.netBalance) : ''}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-success/10 rounded-lg flex items-center justify-center mt-2 sm:mt-0 self-start sm:self-auto">
                <Scale className="text-success" size={16} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
          <DialogTrigger asChild>
            <Button className="flex-1 text-sm sm:text-base py-2 sm:py-3" data-testid="button-add-expense">
              <Plus className="mr-1 sm:mr-2" size={14} />
              Thêm chi tiêu
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <ExpenseForm onSuccess={() => setShowExpenseModal(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showSettlementModal} onOpenChange={setShowSettlementModal}>
          <DialogTrigger asChild>
            <Button variant="secondary" className="flex-1 text-sm sm:text-base py-2 sm:py-3" data-testid="button-add-settlement">
              <Handshake className="mr-1 sm:mr-2" size={14} />
              Thanh toán
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <SettlementForm onSuccess={() => setShowSettlementModal(false)} />
          </DialogContent>
        </Dialog>

        <Button 
          variant="outline" 
          onClick={handleExportCSV}
          className="text-sm sm:text-base py-2 sm:py-3"
          data-testid="button-export-csv"
        >
          <Download className="mr-1 sm:mr-2" size={14} />
          <span className="hidden sm:inline">Xuất CSV</span>
          <span className="sm:hidden">CSV</span>
        </Button>
      </div>
    </section>
  );
}
