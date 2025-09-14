import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, CreditCard, TrendingDown, TrendingUp, BarChart3, Settings, LogOut, ChevronRight, Home, Receipt, History, User } from "lucide-react";
import ExpenseFormSimple from "@/components/expense-form-simple";
import SettlementFormSimple from "@/components/settlement-form-simple-new";
import SettlementFormWithExpenses from "@/components/settlement-form-with-expenses";
import ProfileForm from "@/components/profile-form";
import TransactionListEnhanced from "@/components/transaction-list-enhanced";
import PaymentHistoryList from "@/components/payment-history-list";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { expensesAPI, settlementsAPI, type Expense, type Settlement } from "@/lib/api";

export default function HomeMain() {
  const { user, logout } = useAuth();
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isQuickPaymentOpen, setIsQuickPaymentOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSettlementDialog, setShowSettlementDialog] = useState(false);
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
    const myTotalSpent = expenses
      .filter(expense => expense.payerId === user?.id)
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    const mySharedExpenses = expenses
      .filter(expense => expense.isShared && expense.payerId === user?.id)
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    const othersSharedExpenses = expenses
      .filter(expense => expense.isShared && expense.payerId !== user?.id)
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    const totalSharedExpenses = mySharedExpenses + othersSharedExpenses;
    const numberOfPeople = 2;
    const mySharOfSharedExpenses = totalSharedExpenses / numberOfPeople;
    const sharedBalance = mySharedExpenses - mySharOfSharedExpenses;

    const received = settlements
      .filter(settlement => settlement.payeeId === user?.id)
      .reduce((sum, settlement) => sum + parseFloat(settlement.amount), 0);

    const paid = settlements
      .filter(settlement => settlement.payerId === user?.id)
      .reduce((sum, settlement) => sum + parseFloat(settlement.amount), 0);

    const finalBalance = sharedBalance + received - paid;

    return {
      totalSpent: myTotalSpent,
      received,
      sharedExpenses: mySharedExpenses,
      totalSharedExpenses,
      othersSharedExpenses,
      mySharOfSharedExpenses,
      balance: finalBalance,
      netBalance: Math.abs(finalBalance),
      isOwing: finalBalance < 0
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

  const recentTransactions = [
    ...expenses.slice(0, 5).map((expense) => ({
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
    })),
    ...settlements.slice(0, 3).map((settlement) => ({
      id: settlement.id,
      title: settlement.description || "Thanh toán",
      type: "settlement",
      amount: parseFloat(settlement.amount),
      status: "paid",
      date: new Date(settlement.createdAt).toLocaleDateString('vi-VN'),
      createdAt: settlement.createdAt,
      payer: settlement.payerId === user?.id ? 'Bạn' : 'Người dùng khác',
      icon: <TrendingUp className="w-5 h-5 text-green-500" />
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

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
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🏠</span>
            <span className="font-medium text-sm">RoomMate Expense</span>
          </div>
          <div className="flex items-center space-x-1">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <button className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </DialogTrigger>
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
        <div className="mt-1">
          <span className="text-xs opacity-90">
            👋 Xin chào, {user?.firstName} {user?.lastName}!
          </span>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'home' && (
        <>
          {/* Compact Action Buttons */}
          <div className="px-4 py-3 bg-white border-b">
            <div className="grid grid-cols-2 gap-2">
              <Dialog open={isExpenseOpen} onOpenChange={setIsExpenseOpen}>
                <DialogTrigger asChild>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-3 rounded-lg font-medium text-sm flex items-center justify-center transition-colors">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Thêm chi tiêu
                  </button>
                </DialogTrigger>
                <DialogContent className="p-0 w-[90vw] max-w-sm mx-auto" aria-describedby="expense-form-description">
                  <ExpenseFormSimple onSuccess={() => setIsExpenseOpen(false)} />
                </DialogContent>
              </Dialog>

              <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogTrigger asChild>
                  <button className="border-2 border-gray-300 hover:border-gray-400 py-2.5 px-3 rounded-lg font-medium text-sm flex items-center justify-center transition-colors">
                    <CreditCard className="w-4 h-4 mr-1.5" />
                    Thanh toán
                  </button>
                </DialogTrigger>
                <DialogContent className="p-0 w-[90vw] max-w-sm mx-auto" aria-describedby="settlement-form-description">
                  <SettlementFormSimple onSuccess={() => setIsPaymentOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Compact Summary Grid */}
          <div className="px-4 py-3">
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
                    <p className="text-xs text-gray-600 mb-0.5">Bạn chi chung</p>
                    <p className="text-base font-bold text-blue-600 mb-0.5">
                      {formatCurrency(summaryData.sharedExpenses)}
                    </p>
                    <p className="text-[10px] text-gray-500">Của {formatCurrency(summaryData.totalSharedExpenses)}</p>
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
                    <p className="text-xs text-gray-600 mb-0.5">Bạn nên chi</p>
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
                  {summaryData.isOwing && summaryData.netBalance > 0 && (
                    <Dialog open={isQuickPaymentOpen} onOpenChange={setIsQuickPaymentOpen}>
                      <DialogTrigger asChild>
                        <button className="w-full bg-red-600 hover:bg-red-700 text-white text-[10px] py-1 px-2 rounded font-medium transition-colors">
                          Thanh toán {formatCurrency(summaryData.netBalance)}đ
                        </button>
                      </DialogTrigger>
                      <DialogContent className="p-0 w-[90vw] max-w-sm mx-auto" aria-describedby="settlement-form-description">
                        <SettlementFormSimple 
                          onSuccess={() => setIsQuickPaymentOpen(false)}
                          defaultAmount={summaryData.netBalance.toString()}
                          defaultDescription={`Thanh toán cân bằng chi tiêu chung`}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
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
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Danh sách chi tiêu</h2>
          </div>
          <TransactionListEnhanced />
        </div>
      )}

      {/* Settlements Tab */}
      {activeTab === 'settlements' && (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Thanh toán</h2>
            <Dialog open={showSettlementDialog} onOpenChange={setShowSettlementDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center space-x-1">
                  <Plus className="w-3 h-3" />
                  <span className="text-xs">Ghi nhận</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <SettlementFormWithExpenses 
                  onSuccess={() => setShowSettlementDialog(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2 text-sm">💡 Hướng dẫn thanh toán</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Chọn người nhận tiền từ danh sách roommate</li>
                <li>• Chọn các khoản chi tiêu cần thanh toán (tùy chọn)</li>
                <li>• Nhập số tiền và phương thức thanh toán</li>
                <li>• Hệ thống sẽ tự động đánh dấu các khoản đã thanh toán</li>
              </ul>
            </div>
            <TransactionListEnhanced />
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Lịch sử thanh toán</h2>
          </div>
          <PaymentHistoryList />
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="px-4 py-3">
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
        <div className="grid grid-cols-5">
          {[
            { id: 'home', icon: Home, label: 'Trang chủ' },
            { id: 'expenses', icon: Receipt, label: 'Chi tiêu' },
            { id: 'settlements', icon: CreditCard, label: 'Thanh toán' },
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