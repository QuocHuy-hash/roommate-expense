import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, CreditCard, TrendingDown, TrendingUp, BarChart3, Settings, LogOut } from "lucide-react";
import ExpenseFormSimple from "@/components/expense-form-simple";
import SettlementFormSimple from "@/components/settlement-form-simple-new";
import ProfileForm from "@/components/profile-form";
import BottomNavigation from "@/components/bottom-navigation";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { expensesAPI, settlementsAPI, type Expense, type Settlement } from "@/lib/api";

export default function HomeMain() {
  const { user, logout } = useAuth();
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Fetch expenses and settlements from API
  const { data: expensesData, isLoading: expensesLoading, error: expensesError } = useQuery({
    queryKey: ['expenses'],
    queryFn: expensesAPI.getAll,
  });

  const { data: settlementsData, isLoading: settlementsLoading, error: settlementsError } = useQuery({
    queryKey: ['settlements'],
    queryFn: settlementsAPI.getAll,
  });

  const expenses = expensesData?.expenses || [];
  const settlements = settlementsData?.settlements || [];

  // Calculate summary data from real data
  const calculateSummary = () => {
    const totalSpent = expenses
      .filter(expense => expense.payerId === user?.id)
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    const received = settlements
      .filter(settlement => settlement.payerId === user?.id)
      .reduce((sum, settlement) => sum + parseFloat(settlement.amount), 0);

    const sharedExpenses = expenses
      .filter(expense => expense.isShared && expense.payerId === user?.id)
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    const owedToMe = settlements
      .filter(settlement => settlement.payeeId === user?.id)
      .reduce((sum, settlement) => sum + parseFloat(settlement.amount), 0);

    const balance = totalSpent - received + owedToMe;

    return {
      totalSpent,
      received,
      sharedExpenses,
      balance
    };
  };

  const summaryData = calculateSummary();

  // Function to get icon based on transaction type and title
  const getTransactionIcon = (type: string, title: string) => {
    if (type === 'settlement') return '💳';
    
    // Map expense titles to appropriate icons
    const iconMap: { [key: string]: string } = {
      'đồ ăn': '🍕',
      'pizza': '🍕',
      'ăn uống': '🍕',
      'thức ăn': '🍕',
      'mua đồ ăn': '🍕',
      'tiền điện': '💡',
      'điện': '💡',
      'hóa đơn điện': '💡',
      'tiền nước': '💧',
      'nước': '💧',
      'hóa đơn nước': '💧',
      'đồ dùng': '🛒',
      'mua sắm': '🛒',
      'siêu thị': '🛒',
      'mua đồ': '🛒',
    };

    const titleLower = title.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (titleLower.includes(key)) {
        return icon;
      }
    }
    
    // Default icons
    return type === 'shared' ? '🍕' : '🛒';
  };

  // Function to get background color
  const getBackgroundColor = (type: string, title: string) => {
    if (type === 'settlement') return 'bg-blue-500';
    
    const titleLower = title.toLowerCase();
    if (titleLower.includes('điện') || titleLower.includes('đèn')) return 'bg-yellow-500';
    if (titleLower.includes('nước')) return 'bg-blue-400';
    if (titleLower.includes('ăn') || titleLower.includes('pizza') || titleLower.includes('thức ăn')) return 'bg-red-200';
    
    return 'bg-red-300'; // default
  };

  // Convert expenses and settlements to transaction format
  const recentTransactions = [
    ...expenses.slice(0, 5).map((expense: Expense) => ({
      id: expense.id,
      title: expense.title,
      type: expense.isShared ? "shared" : "personal",
      amount: parseFloat(expense.amount),
      status: "paid",
      date: new Date(expense.createdAt).toLocaleDateString('vi-VN'),
      createdAt: expense.createdAt, // Keep original for sorting
      icon: expense.isShared ? 
        <BarChart3 className="w-5 h-5 text-blue-500" /> : 
        <CreditCard className="w-5 h-5 text-orange-500" />
    })),
    ...settlements.slice(0, 3).map((settlement: Settlement) => ({
      id: settlement.id,
      title: settlement.description || "Thanh toán",
      type: "settlement",
      amount: parseFloat(settlement.amount),
      status: "paid",
      date: new Date(settlement.createdAt).toLocaleDateString('vi-VN'),
      createdAt: settlement.createdAt, // Keep original for sorting
      icon: <TrendingUp className="w-5 h-5 text-green-500" />
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  const formatCurrency = (amount: number) => {
    // Format number with dots as thousands separators
    const formatted = Math.abs(amount).toLocaleString('de-DE');
    return `${formatted}`;
  };

  // Loading state
  if (expensesLoading || settlementsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <div className="text-lg text-gray-600">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (expensesError || settlementsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-lg text-gray-600 mb-4">Không thể tải dữ liệu</div>
          <Button onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🏠</span>
            <span className="font-semibold">RoomMate Expense</span>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white">
                  <Settings className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="p-0 w-[90vw] max-w-sm mx-auto" aria-describedby="profile-form-description">
                <ProfileForm onSuccess={() => setIsSettingsOpen(false)} />
              </DialogContent>
            </Dialog>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:text-red-200" 
              onClick={logout}
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="mt-2">
          <span className="text-sm opacity-90">
            👋 Xin chào, {user?.firstName} {user?.lastName}!
          </span>
        </div>
      </div>

      {/* Main Content - only show home tab content for now */}
      {activeTab === 'home' && (
        <>
          {/* Action Buttons */}
          <div className="p-4 bg-white">
            <div className="flex space-x-3">
              <Dialog open={isExpenseOpen} onOpenChange={setIsExpenseOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm chi tiêu
                  </Button>
                </DialogTrigger>
                <DialogContent className="p-0 w-[90vw] max-w-sm mx-auto" aria-describedby="expense-form-description">
                  <ExpenseFormSimple onSuccess={() => setIsExpenseOpen(false)} />
                </DialogContent>
              </Dialog>

              <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 h-12 rounded-lg border-2">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Thanh toán
                  </Button>
                </DialogTrigger>
                <DialogContent className="p-0 w-[90vw] max-w-sm mx-auto" aria-describedby="settlement-form-description">
                  <SettlementFormSimple onSuccess={() => setIsPaymentOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-3">
              {/* Tổng chi */}
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tổng chi</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(summaryData.totalSpent)}
                      </p>
                      <p className="text-xs text-gray-500">Số tiền bạn đã chi</p>
                    </div>
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Đã nhận */}
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Đã nhận</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(summaryData.received)}
                      </p>
                      <p className="text-xs text-gray-500">Thanh toán đã nhận</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chi tiêu chung */}
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Chi tiêu chung</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(summaryData.sharedExpenses)}
                      </p>
                      <p className="text-xs text-gray-500">Chi tiêu được chia sẻ</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cân bằng */}
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Cân bằng</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(summaryData.balance)}
                      </p>
                      <p className="text-xs text-gray-500">Bạn nợ</p>
                    </div>
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Giao dịch gần đây */}
          <div className="p-4 pt-0">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">💰</span>
                    <h3 className="font-semibold text-gray-800">Giao dịch gần đây</h3>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    Xem tất cả
                  </Button>
                </div>
                <div className="space-y-1">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        {/* Icon với background màu */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getBackgroundColor(transaction.type, transaction.title)}`}>
                          <span className="text-white text-lg">{getTransactionIcon(transaction.type, transaction.title)}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-base">{transaction.title}</h4>
                          <p className="text-gray-500 text-sm">
                            {transaction.type === 'shared' ? 'Chi tiêu chung' : 
                             transaction.type === 'settlement' ? 'Thanh toán' : 'Chi tiêu cá nhân'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-lg flex items-baseline justify-end ${
                          transaction.type === 'settlement' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <span>{transaction.type === 'settlement' ? '+' : '-'}</span>
                          <span>{formatCurrency(transaction.amount)}</span>
                          <span className="text-sm ml-1">đ</span>
                        </div>
                        <p className="text-xs text-gray-400">{transaction.date}</p>
                        <p className="text-xs text-gray-400">Bạn đã trả</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Other tabs content - placeholder for now */}
      {activeTab !== 'home' && (
        <div className="p-4 mt-4">
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Chức năng đang phát triển</h3>
              <p className="text-gray-600">Tính năng này sẽ có trong phiên bản tiếp theo!</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Spacer for bottom navigation */}
      <div className="h-20"></div>
    </div>
  );
}
