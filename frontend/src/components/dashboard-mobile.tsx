import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, parseAmount } from "@/lib/utils";
import ExpenseFormSimple from "./expense-form-simple";
import SettlementFormSimple from "./settlement-form-simple";
import { 
  Plus, 
  Handshake, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Wallet,
  Receipt,
  DollarSign,
  CreditCard
} from "lucide-react";

export default function Dashboard() {
  // Mock user data
  const mockUser = {
    id: "user-1",
    email: "user1@example.com", 
    firstName: "User",
    lastName: "One"
  };
  
  const user = mockUser;
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
      },
      {
        id: "3",
        description: "Mua đồ ăn",
        amount: "150000", 
        payerId: "user-1",
        isShared: false,
        createdAt: new Date().toISOString(),
      }
    ]
  };

  const mockSettlementsData = {
    settlements: [
      {
        id: "1",
        amount: "100000",
        payerId: "user-1",
        payeeId: "user-2",
        description: "Thanh toán tiền điện",
        createdAt: new Date().toISOString(),
      }
    ]
  };

  const expensesData = mockExpensesData;
  const settlementsData = mockSettlementsData;
  const expenses = expensesData?.expenses || [];
  const settlements = settlementsData?.settlements || [];

  // Calculate financial summary
  const calculateSummary = () => {
    if (!user) return { totalPaid: 0, totalReceived: 0, sharedExpenses: 0, personalExpenses: 0, balance: 0 };

    let totalPaid = 0;
    let totalReceived = 0;
    let sharedExpenses = 0;
    let personalExpenses = 0;

    // Calculate from expenses
    expenses.forEach((expense) => {
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
    settlements.forEach((settlement) => {
      const amount = parseAmount(settlement.amount);
      if (settlement.payerId === user.id) {
        totalPaid += amount;
      } else if (settlement.payeeId === user.id) {
        totalReceived += amount;
      }
    });

    const balance = totalReceived - totalPaid;

    return {
      totalPaid,
      totalReceived, 
      sharedExpenses,
      personalExpenses,
      balance
    };
  };

  const summary = calculateSummary();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
          
            <div className="flex gap-2">
              <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm chi tiêu
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] sm:max-w-md w-full max-h-[85vh] overflow-y-auto m-4">
                  <ExpenseFormSimple onSuccess={() => setShowExpenseModal(false)} />
                </DialogContent>
              </Dialog>

              <Dialog open={showSettlementModal} onOpenChange={setShowSettlementModal}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Handshake className="w-4 h-4 mr-1" />
                    Thanh toán
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] sm:max-w-md w-full max-h-[85vh] overflow-y-auto m-4">
                  <SettlementFormSimple onSuccess={() => setShowSettlementModal(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="p-4 space-y-4">
        {/* Financial Summary Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Tổng chi */}
          <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng chi</p>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(summary.totalPaid)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Số tiền bạn đã chi</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Đã nhận */}
          <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đã nhận</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(summary.totalReceived)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Thanh toán đã nhận</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chi tiêu chung */}
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chi tiêu chung</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(summary.sharedExpenses)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Chi tiêu được chia sẻ</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cân bằng */}
          <Card className={`border-l-4 ${summary.balance >= 0 ? 'border-l-green-500 bg-gradient-to-r from-green-50 to-white' : 'border-l-red-500 bg-gradient-to-r from-red-50 to-white'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cân bằng</p>
                  <p className={`text-lg font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(summary.balance))}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {summary.balance >= 0 ? 'Bạn được nợ' : 'Bạn nợ'}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${summary.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Wallet className={`w-5 h-5 ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center">
              <Receipt className="w-4 h-4 mr-2" />
              Thao tác nhanh
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => setShowExpenseModal(true)}
                className="h-12 bg-blue-600 hover:bg-blue-700 flex-col"
              >
                <Plus className="w-5 h-5 mb-1" />
                <span className="text-xs">Thêm chi tiêu</span>
              </Button>
              
              <Button 
                onClick={() => setShowSettlementModal(true)}
                variant="outline"
                className="h-12 flex-col border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <CreditCard className="w-5 h-5 mb-1" />
                <span className="text-xs">Thanh toán</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Giao dịch gần đây
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600">
                Xem tất cả
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              {expenses.slice(0, 3).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${expense.isShared ? 'bg-blue-100' : 'bg-orange-100'}`}>
                      {expense.isShared ? (
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Wallet className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{expense.description}</p>
                      <p className="text-xs text-gray-500">
                        {expense.isShared ? 'Chi tiêu chung' : 'Chi tiêu cá nhân'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-gray-900">
                      {formatCurrency(parseAmount(expense.amount))}
                    </p>
                    <p className="text-xs text-gray-500">
                      {expense.payerId === user.id ? 'Bạn đã trả' : 'Bạn được trả'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
