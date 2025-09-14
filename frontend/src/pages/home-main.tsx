import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, CreditCard, TrendingDown, TrendingUp, BarChart3, Settings, LogOut, ChevronRight, Home, Receipt, History, User } from "lucide-react";
import ExpenseFormSimple from "@/components/expense-form-simple";
import ProfileForm from "@/components/profile-form";
import TransactionListEnhanced from "@/components/transaction-list-enhanced-new";
import PaymentHistoryList from "@/components/payment-history-list";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { expensesAPI, settlementsAPI, type Expense, type Settlement } from "@/lib/api";

export default function HomeMain() {
  const { user, logout } = useAuth();
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
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
    // Chỉ lấy các khoản chưa thanh toán
    const unpaidExpenses = expenses.filter(e => !e.isPaid && !e.isSettled);
    const myTotalSpent = unpaidExpenses
      .filter(expense => expense.payerId === user?.id)
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    const mySharedExpenses = unpaidExpenses
      .filter(expense => expense.isShared && expense.payerId === user?.id)
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    const othersSharedExpenses = unpaidExpenses
      .filter(expense => expense.isShared && expense.payerId !== user?.id)
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    const totalSharedExpenses = mySharedExpenses + othersSharedExpenses;
    const numberOfPeople = 2;
    const mySharOfSharedExpenses = totalSharedExpenses / numberOfPeople;

    // Chỉ lấy các settlement chưa thanh toán (nếu có trường status hoặc filter theo logic tương tự)
    const unpaidSettlements = settlements; // Nếu có trường status thì filter thêm
    const paid = unpaidSettlements
      .filter(settlement => settlement.payerId === user?.id)
      .reduce((sum, settlement) => sum + parseFloat(settlement.amount), 0);

    const received = unpaidSettlements
      .filter(settlement => settlement.payeeId === user?.id)
      .reduce((sum, settlement) => sum + parseFloat(settlement.amount), 0);

    const rawBalance = mySharedExpenses - mySharOfSharedExpenses - paid + received;

    return {
      totalSpent: myTotalSpent,
      received,
      sharedExpenses: mySharedExpenses,
      totalSharedExpenses,
      othersSharedExpenses,
      mySharOfSharedExpenses,
      balance: rawBalance,
      netBalance: Math.abs(rawBalance),
      isOwing: rawBalance < 0
    };
  };

  const summaryData = calculateSummary();

  const getTransactionIcon = (type: string, title: string) => {
    if (type === 'settlement') return '💳';
    
    const iconMap = {
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
    
    return type === 'shared' ? '🍕' : '🛒';
  };

  const getBackgroundColor = (type: string, title: string) => {
    if (type === 'settlement') return 'bg-blue-500';
    
    const titleLower = title.toLowerCase();
    if (titleLower.includes('điện') || titleLower.includes('đèn')) return 'bg-yellow-500';
    if (titleLower.includes('nước')) return 'bg-blue-400';
    if (titleLower.includes('ăn') || titleLower.includes('pizza') || titleLower.includes('thức ăn')) return 'bg-red-200';
    
    return 'bg-red-300';
  };

  const recentTransactions = expenses
    .slice(0, 8)
    .map((expense) => ({
      id: expense.id,
      title: expense.title,
      type: expense.isShared ? "shared" : "personal",
      amount: parseFloat(expense.amount),
      status: "paid",
      date: new Date(expense.createdAt).toLocaleDateString('vi-VN'),
      createdAt: expense.createdAt,
      payer: expense.payerFirstName && expense.payerLastName 
        ? `${expense.payerFirstName} ${expense.payerLastName}` 
        : (expense.payerId === user?.id ? 'Bạn' : 'Người dùng khác'),
      icon: expense.isShared ? 
        <BarChart3 className="w-5 h-5 text-blue-500" /> : 
        <CreditCard className="w-5 h-5 text-orange-500" />
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const formatCurrency = (amount : number) => {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 text-white px-4 py-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <span className="text-2xl">🏠</span>
            </div>
            <div>
              <span className="font-bold text-lg">RoomMate Expense</span>
              <div className="text-purple-100 text-sm">Quản lý chi tiêu thông minh</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              
              <DialogContent className="p-0 w-[90vw] max-w-sm mx-auto" aria-describedby="profile-form-description">
                <ProfileForm onSuccess={() => setIsSettingsOpen(false)} />
              </DialogContent>
            </Dialog>
            <button 
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              onClick={logout}
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'home' && (
        <>
          {/* Enhanced Action Buttons */}
          <div className="px-4 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
            <div className="grid grid-cols-1 gap-3">
              <Dialog open={isExpenseOpen} onOpenChange={setIsExpenseOpen}>
                <DialogTrigger asChild>
                  <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 px-2 rounded-xl font-semibold text-base flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    <Plus className="w-3 h-3 mr-2" />
                    Thêm chi tiêu mới
                  </button>
                </DialogTrigger>
                <DialogContent className="p-0 w-[90vw] max-w-sm mx-auto" aria-describedby="expense-form-description">
                  <ExpenseFormSimple onSuccess={() => setIsExpenseOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Compact Summary Grid */}
          <div className="px-2 py-1">
            <div className="grid grid-cols-2 gap-2">
              {/* Tổng chi */}
              <div className="bg-white rounded-lg p-3 border-l-4 border-l-red-500 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-0.5">Tổng chi</p>
                    <p className="text-base font-bold text-red-600 mb-0.5">
                      {formatCurrency(summaryData.totalSpent)}
                    </p>
                    <p className="text-[10px] text-gray-500">Số tiền bạn đã chi</p>
                  </div>
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center ml-2">
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Bạn chi chung */}
              <div className="bg-white rounded-lg p-3 border-l-4 border-l-blue-500 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-0.5">Tổng chi tiêu chung</p>
                    <p className="text-base font-bold text-blue-600 mb-0.5">
                     {formatCurrency(summaryData.totalSharedExpenses)} đ
                    </p>
                  </div>
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center ml-2">
                    <BarChart3 className="w-3 h-3 text-blue-500" />
                  </div>
                </div>
              </div>

              {/* Bạn nên chi */}
              <div className="bg-white rounded-lg p-3 border-l-4 border-l-orange-500 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-0.5">Số tiền chia</p>
                    <p className="text-base font-bold text-orange-600 mb-0.5">
                      {formatCurrency(summaryData.mySharOfSharedExpenses)}
                    </p>
                    <p className="text-[10px] text-gray-500">Phần của bạn (50%)</p>
                  </div>
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center ml-2">
                    <TrendingUp className="w-3 h-3 text-orange-500" />
                  </div>
                </div>
              </div>

              {/* Cân bằng */}
              <div className={`bg-white rounded-lg p-3 border-l-4 shadow-sm ${summaryData.isOwing ? 'border-l-red-500' : 'border-l-green-500'}`}>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Cân bằng</p>
                  <p className={`text-base font-bold mb-1 ${summaryData.isOwing ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(summaryData.netBalance)}
                  </p>
                  <p className="text-[10px] text-gray-500 mb-2">
                    {summaryData.isOwing ? 'Bạn nợ' : 'Bạn được nợ'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Recent Transactions */}
          <div className="px-4 pb-3">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">💰</span>
                  <h3 className="font-medium text-gray-800 text-sm">Giao dịch gần đây</h3>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-xs flex items-center">
                  Xem tất cả
                  <ChevronRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>
              <div className="divide-y">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getBackgroundColor(transaction.type, transaction.title)}`}>
                        <span className="text-white text-xs">{getTransactionIcon(transaction.type, transaction.title)}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{transaction.title}</h4>
                        <p className="text-gray-500 text-xs">
                          {transaction.type === 'shared' ? 'Chi tiêu chung' : 
                           transaction.type === 'settlement' ? 'Thanh toán' : 'Chi tiêu cá nhân'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold text-sm flex items-baseline justify-end ${
                        transaction.type === 'settlement' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <span>{transaction.type === 'settlement' ? '+' : '-'}</span>
                        <span>{formatCurrency(transaction.amount)}</span>
                        <span className="text-xs ml-0.5">đ</span>
                      </div>
                      <p className="text-[10px] text-gray-400">{transaction.date}</p>
                      <p className="text-[10px] text-gray-400">Người trả: {transaction.payer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="px-2 py-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Danh sách chi tiêu</h2>
          </div>
          <TransactionListEnhanced />
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="px-2 py-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Lịch sử thanh toán</h2>
          </div>
          <PaymentHistoryList />
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="px-2 py-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h2>
          </div>
          <Card className="max-w-md mx-auto">
            <CardContent className="p-4 space-y-4">
              <div className="text-center pb-4 border-b">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg">{user?.firstName} {user?.lastName}</h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Họ và tên</p>
                  <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-sm">{user?.email}</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={logout}
                className="w-full"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="grid grid-cols-4">
          {[
            { id: 'home', icon: Home, label: 'Trang chủ' },
            { id: 'expenses', icon: Receipt, label: 'Chi tiêu' },
            { id: 'history', icon: History, label: 'Lịch sử' },
            { id: 'profile', icon: User, label: 'Cá nhân' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 flex flex-col items-center space-y-1 transition-colors ${
                activeTab === tab.id 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Spacer for bottom navigation */}
      <div className="h-16"></div>
    </div>
  );
}