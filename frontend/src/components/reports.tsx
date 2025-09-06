import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { TrendingUp, TrendingDown, Calendar, PieChart, BarChart3, Download, Target } from "lucide-react";
import { apiUrl } from "@/lib/utils";
import type { Expense, Settlement } from "@shared/schema";

type BalanceData = {
  totalPaid: number;
  totalShared: number;
  netBalance: number;
  personalExpenses: number;
};

export default function Reports() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Get other user ID (hardcoded for 2-user system)
  const otherUserId = user?.id === "927070657" ? "927070658" : "927070657";

  const { data: balance } = useQuery<BalanceData>({
    queryKey: ["/api/balance", otherUserId],
    enabled: !!user && !!otherUserId,
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: settlements = [] } = useQuery<Settlement[]>({
    queryKey: ["/api/settlements"],
  });

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

  // Calculate statistics
  const totalTransactions = expenses.length + settlements.length;
  const sharedExpenses = expenses.filter(exp => exp.isShared);
  const personalExpenses = expenses.filter(exp => !exp.isShared);
  
  const thisMonth = new Date();
  const firstDayOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
  
  const thisMonthExpenses = expenses.filter(exp => 
    exp.createdAt && new Date(exp.createdAt) >= firstDayOfMonth
  );
  
  const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => 
    sum + parseFloat(exp.amount), 0
  );

  const avgExpenseAmount = expenses.length > 0 
    ? expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) / expenses.length 
    : 0;

  return (
    <section data-testid="reports-section">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-reports-title">
          Báo cáo chi tiêu
        </h2>
        <p className="text-muted-foreground">
          Thống kê và phân tích chi tiêu của bạn
        </p>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng giao dịch</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-transactions">
                  {totalTransactions}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-primary" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tháng này</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-month-total">
                  {formatCurrency(thisMonthTotal)}
                </p>
              </div>
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Calendar className="text-success" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Chi tiêu TB</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-avg-expense">
                  {formatCurrency(avgExpenseAmount)}
                </p>
              </div>
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Target className="text-warning" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Số dư hiện tại</p>
                <p className={`text-2xl font-bold ${balance?.netBalance && balance.netBalance > 0 ? 'text-success' : balance?.netBalance && balance.netBalance < 0 ? 'text-destructive' : 'text-foreground'}`} data-testid="text-current-balance">
                  {balance?.netBalance ? (balance.netBalance > 0 ? '+' : '') + formatCurrency(Math.abs(balance.netBalance)) : formatCurrency(0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                {balance?.netBalance && balance.netBalance > 0 ? (
                  <TrendingUp className="text-success" size={20} />
                ) : balance?.netBalance && balance.netBalance < 0 ? (
                  <TrendingDown className="text-destructive" size={20} />
                ) : (
                  <PieChart className="text-primary" size={20} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Phân loại chi tiêu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm">Chi tiêu chung</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium" data-testid="text-shared-count">
                    {sharedExpenses.length} giao dịch
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(sharedExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0))}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-sm">Chi tiêu cá nhân</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium" data-testid="text-personal-count">
                    {personalExpenses.length} giao dịch
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(personalExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0))}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <span className="text-sm">Thanh toán</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium" data-testid="text-settlements-count">
                    {settlements.length} thanh toán
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(settlements.reduce((sum, sett) => sum + parseFloat(sett.amount), 0))}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Xuất báo cáo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Xuất tất cả giao dịch ra file CSV để phân tích chi tiết hoặc lưu trữ.
              </p>
              
              <Button 
                onClick={handleExportCSV}
                className="w-full"
                data-testid="button-export-csv-reports"
              >
                <Download className="mr-2" size={16} />
                Xuất file CSV
              </Button>
              
              <div className="text-xs text-muted-foreground">
                <p>Báo cáo sẽ bao gồm:</p>
                <ul className="mt-1 space-y-1 ml-2">
                  <li>• Tất cả chi tiêu và thanh toán</li>
                  <li>• Thông tin người trả và người nhận</li>
                  <li>• Ngày tháng và mô tả chi tiết</li>
                  <li>• Liên kết đến hình ảnh hóa đơn</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}