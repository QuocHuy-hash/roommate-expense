import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, parseAmount } from "@/lib/utils";
import ExpenseForm from "./expense-form";
import SettlementForm from "./settlement-form";
import TransactionList from "./transaction-list";
import { Plus, Handshake, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

// Mock users - In a real app, you'd fetch this from an API
const mockUsers = [
  {
    id: "user-2",
    email: "user2@example.com",
    firstName: "User",
    lastName: "Two",
    profileImageUrl: null,
  },
];

export default function Dashboard() {
  // Mock user data
  const mockUser = {
    id: "user-1",
    email: "user1@example.com", 
    firstName: "User",
    lastName: "One"
  };
  
  const user = mockUser; // Use mock user instead of useAuth
  const { toast } = useToast();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);

  // Mock data for UI display
  const mockExpensesData = {
    expenses: [
      {
        id: "1",
        description: "Tiền điện tháng 12",
        amount: "500000",
        payerId: "user-1",
        isShared: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2", 
        description: "Tiền nước",
        amount: "200000",
        payerId: "user-2",
        isShared: true,
        createdAt: new Date().toISOString(),
      }
    ]
  };

  const mockSettlementsData = {
    settlements: [
      {
        id: "1",
        amount: "150000",
        payerId: "user-1",
        payeeId: "user-2",
        description: "Thanh toán tiền điện",
        createdAt: new Date().toISOString(),
      }
    ]
  };

  // Use mock data instead of API calls
  const expensesData = mockExpensesData;
  const settlementsData = mockSettlementsData;
  const expensesLoading = false;
  const settlementsLoading = false;
  const expensesError = null;
  const settlementsError = null;

  const expenses = expensesData?.expenses || [];
  const settlements = settlementsData?.settlements || [];
  const isLoading = expensesLoading || settlementsLoading;

  // Calculate financial summary
  const calculateSummary = () => {
    if (!user) return { totalPaid: 0, totalReceived: 0, sharedExpenses: 0, personalExpenses: 0, balance: 0 };

    let totalPaid = 0;
    let sharedExpenses = 0;
    let personalExpenses = 0;
    let totalReceived = 0;

    // Calculate from expenses
    expenses.forEach(expense => {
      const amount = parseAmount(expense.amount);
      if (expense.payerId === user.id) {
        totalPaid += amount;
        if (expense.isShared) {
          sharedExpenses += amount;
        } else {
          personalExpenses += amount;
        }
      }
    });

    // Calculate from settlements
    settlements.forEach(settlement => {
      const amount = parseAmount(settlement.amount);
      if (settlement.payerId === user.id) {
        totalPaid += amount; // Money you paid out
      } else if (settlement.payeeId === user.id) {
        totalReceived += amount; // Money you received
      }
    });

    // Simple balance calculation (this would be more complex in a real app with multiple users)
    const balance = totalReceived - totalPaid + (sharedExpenses / 2); // Assuming 2-person split

    return {
      totalPaid,
      totalReceived,
      sharedExpenses,
      personalExpenses,
      balance,
    };
  };

  const summary = calculateSummary();

  const handleExpenseSuccess = () => {
    setShowExpenseModal(false);
    toast({
      title: "Thành công",
      description: "Đã thêm chi tiêu mới",
    });
  };

  const handleSettlementSuccess = () => {
    setShowSettlementModal(false);
    toast({
      title: "Thành công",
      description: "Đã ghi nhận thanh toán",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Xin chào, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600">Quản lý chi tiêu của bạn</p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm chi tiêu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <ExpenseForm onSuccess={handleExpenseSuccess} />
            </DialogContent>
          </Dialog>

          <Dialog open={showSettlementModal} onOpenChange={setShowSettlementModal}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Handshake className="mr-2 h-4 w-4" />
                Thanh toán
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <SettlementForm onSuccess={handleSettlementSuccess} users={mockUsers} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng chi</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              Số tiền bạn đã chi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã nhận</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalReceived)}
            </div>
            <p className="text-xs text-muted-foreground">
              Thanh toán đã nhận
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chi tiêu chung</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.sharedExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Chi tiêu được chia sẻ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cân bằng</CardTitle>
            <TrendingUp className={`h-4 w-4 ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(summary.balance))}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.balance >= 0 ? 'Bạn được nợ' : 'Bạn nợ'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle>Giao dịch gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <TransactionList />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
