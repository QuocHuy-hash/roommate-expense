import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { expensesAPI, settlementsAPI } from "@/lib/api";
import { formatCurrency, parseAmount } from "@/lib/utils";
import { TrendingUp, TrendingDown, Calendar, PieChart, BarChart3, Download, Target } from "lucide-react";

export default function Reports() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch expenses
  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: expensesAPI.getAll,
  });

  // Fetch settlements
  const { data: settlementsData, isLoading: settlementsLoading } = useQuery({
    queryKey: ["settlements"],
    queryFn: settlementsAPI.getAll,
  });

  const expenses = expensesData?.expenses || [];
  const settlements = settlementsData?.settlements || [];
  const isLoading = expensesLoading || settlementsLoading;

  // Calculate statistics
  const calculateStats = () => {
    if (!user) return { totalExpenses: 0, myExpenses: 0, sharedExpenses: 0, totalSettlements: 0 };

    const totalExpenses = expenses.reduce((sum, expense) => sum + parseAmount(expense.amount), 0);
    const myExpenses = expenses
      .filter(expense => expense.payerId === user.id)
      .reduce((sum, expense) => sum + parseAmount(expense.amount), 0);
    const sharedExpenses = expenses
      .filter(expense => expense.isShared)
      .reduce((sum, expense) => sum + parseAmount(expense.amount), 0);
    const totalSettlements = settlements.reduce((sum, settlement) => sum + parseAmount(settlement.amount), 0);

    return { totalExpenses, myExpenses, sharedExpenses, totalSettlements };
  };

  const stats = calculateStats();

  // Export CSV function (simplified)
  const handleExportCSV = () => {
    try {
      const csvData = [
        ['Date', 'Type', 'Title', 'Amount', 'Description'],
        ...expenses.map(expense => [
          new Date(expense.createdAt).toLocaleDateString('vi-VN'),
          'Chi tiêu',
          expense.title,
          expense.amount,
          expense.description || ''
        ]),
        ...settlements.map(settlement => [
          new Date(settlement.createdAt).toLocaleDateString('vi-VN'),
          'Thanh toán',
          'Thanh toán',
          settlement.amount,
          settlement.description || ''
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `chi-tieu-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Thành công",
        description: "Đã xuất file CSV thành công",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xuất file CSV",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Báo cáo & Thống kê</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
          <p className="text-gray-600">Tổng quan về tình hình chi tiêu</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Xuất CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng chi tiêu</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tất cả chi tiêu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chi tiêu của tôi</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.myExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Chi tiêu do bạn trả
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chi tiêu chung</CardTitle>
            <PieChart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.sharedExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Chi tiêu được chia sẻ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thanh toán</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats.totalSettlements)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tổng thanh toán
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Tóm tắt tháng này
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {expenses.length}
              </div>
              <p className="text-sm text-gray-600">Giao dịch chi tiêu</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {settlements.length}
              </div>
              <p className="text-sm text-gray-600">Giao dịch thanh toán</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {expenses.length + settlements.length}
              </div>
              <p className="text-sm text-gray-600">Tổng giao dịch</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Thống kê nhanh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Chi tiêu trung bình mỗi lần</span>
              <span className="font-semibold">
                {expenses.length > 0 ? formatCurrency(stats.totalExpenses / expenses.length) : formatCurrency(0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Tỷ lệ chi tiêu chung</span>
              <span className="font-semibold">
                {stats.totalExpenses > 0 ? `${Math.round((stats.sharedExpenses / stats.totalExpenses) * 100)}%` : '0%'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Thanh toán trung bình</span>
              <span className="font-semibold">
                {settlements.length > 0 ? formatCurrency(stats.totalSettlements / settlements.length) : formatCurrency(0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
