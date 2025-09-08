import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard, TrendingDown, TrendingUp, BarChart3, Settings, LogOut } from "lucide-react";
import ExpenseFormSimple from "@/components/expense-form-simple";
import SettlementFormSimple from "@/components/settlement-form-simple-new";
import ProfileForm from "@/components/profile-form";
import BottomNavigation from "@/components/bottom-navigation";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

export default function HomeMain() {
  const { user, logout } = useAuth();
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const handleLogout = () => {
    console.log('HomeMain: Logout button clicked');
    logout();
    console.log('HomeMain: Logout function called');
  };

  // Mock data
  const summaryData = {
    totalSpent: 750000,
    received: 0,
    sharedExpenses: 500000,
    balance: 750000
  };

  const recentTransactions = [
    {
      id: 1,
      title: "Tiền điện tháng 12",
      type: "shared",
      amount: 500000,
      status: "paid",
      date: "7/7/2025",
      icon: <BarChart3 className="w-5 h-5 text-blue-500" />
    },
    {
      id: 2,
      title: "Tiền nước",
      type: "shared", 
      amount: 200000,
      status: "unpaid",
      date: "7/7/2025",
      icon: <BarChart3 className="w-5 h-5 text-blue-500" />
    },
    {
      id: 3,
      title: "Mua đồ ăn",
      type: "personal",
      amount: 150000,
      status: "paid",
      date: "7/7/2025",
      icon: <CreditCard className="w-5 h-5 text-orange-500" />
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

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
              onClick={handleLogout}
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

          {/* Thao tác nhanh */}
          <div className="p-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-lg">⚡</span>
                  <h3 className="font-semibold">Thao tác nhanh</h3>
                </div>
                <div className="flex space-x-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm chi tiêu
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 w-[90vw] max-w-sm mx-auto">
                      <ExpenseFormSimple onSuccess={() => {}} />
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1 h-12 border-2">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Thanh toán
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 w-[90vw] max-w-sm mx-auto">
                      <SettlementFormSimple onSuccess={() => {}} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Giao dịch gần đây */}
          <div className="p-4 pt-0">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">💰</span>
                    <h3 className="font-semibold">Giao dịch gần đây</h3>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    Xem tất cả
                  </Button>
                </div>
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {transaction.icon}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.title}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant={transaction.type === 'shared' ? 'default' : 'secondary'} className="text-xs">
                              {transaction.type === 'shared' ? 'Chi tiêu chung' : 'Chi tiêu cá nhân'}
                            </Badge>
                            <span className="text-xs text-gray-500">{transaction.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">-{formatCurrency(transaction.amount)}</p>
                        <p className="text-xs text-gray-500">
                          {transaction.status === 'paid' ? 'Bạn đã trả' : 'Bạn được trả'}
                        </p>
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
