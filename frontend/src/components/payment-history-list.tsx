import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistance } from "date-fns";
import { vi } from "date-fns/locale";
import { settlementsAPI, type PaymentHistory, type PaymentDetailsResponse } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search,
  CalendarDays,
  Receipt,
  Filter
} from "lucide-react";

interface PaymentHistoryListProps {
  className?: string;
}

export default function PaymentHistoryList({ className }: PaymentHistoryListProps) {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch payment history
  const { data: paymentHistoryData, isLoading } = useQuery({
    queryKey: ['payment-history'],
    queryFn: settlementsAPI.getPaymentHistory,
  });

  // Fetch payment details when a payment is selected
  const { data: paymentDetails } = useQuery({
    queryKey: ['payment-details', selectedPayment],
    queryFn: () => selectedPayment ? settlementsAPI.getPaymentDetails(selectedPayment) : null,
    enabled: !!selectedPayment,
  });

  const paymentHistory = paymentHistoryData?.paymentHistory || [];

  // Filter payments
  const filteredPayments = paymentHistory.filter(payment => {
    const matchesStatus = filterStatus === "all" || payment.status === filterStatus;
    const matchesMethod = filterMethod === "all" || payment.paymentMethod === filterMethod;
    const matchesSearch = !searchQuery || 
      payment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.amount.includes(searchQuery);
    
    return matchesStatus && matchesMethod && matchesSearch;
  });

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return <CreditCard className="h-4 w-4" />;
      case "cash":
        return <Banknote className="h-4 w-4" />;
      case "digital_wallet":
        return <Smartphone className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return "Chuyển khoản";
      case "cash":
        return "Tiền mặt";
      case "digital_wallet":
        return "Ví điện tử";
      default:
        return method;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "pending":
        return "Đang xử lý";
      case "failed":
        return "Thất bại";
      default:
        return status;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải lịch sử thanh toán...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Receipt className="h-5 w-5" />
          <span>Lịch sử thanh toán</span>
        </CardTitle>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="search">Tìm kiếm</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search"
                placeholder="Tìm theo số tiền, ghi chú..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="pending">Đang xử lý</SelectItem>
                <SelectItem value="failed">Thất bại</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Phương thức</Label>
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="bank_transfer">Chuyển khoản</SelectItem>
                <SelectItem value="cash">Tiền mặt</SelectItem>
                <SelectItem value="digital_wallet">Ví điện tử</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setFilterStatus("all");
                setFilterMethod("all");
                setSearchQuery("");
              }}
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredPayments.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {paymentHistory.length === 0 ? "Chưa có lịch sử thanh toán nào" : "Không tìm thấy thanh toán nào"}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <Card key={payment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatCurrency(parseFloat(payment.amount))}
                            </p>
                            <p className="text-sm text-gray-500">
                              {getPaymentMethodName(payment.paymentMethod)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {payment.description && (
                            <p className="text-sm text-gray-600 truncate">
                              {payment.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            {formatDistance(new Date(payment.paymentDate), new Date(), { 
                              addSuffix: true, 
                              locale: vi 
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge variant={getStatusBadgeVariant(payment.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(payment.status)}
                            <span>{getStatusName(payment.status)}</span>
                          </div>
                        </Badge>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedPayment(payment.id)}
                            >
                              Chi tiết
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Chi tiết thanh toán</DialogTitle>
                            </DialogHeader>
                            
                            {paymentDetails && selectedPayment === payment.id && (
                              <PaymentDetailsView 
                                payment={paymentDetails.payment}
                                paidExpenses={paymentDetails.paidExpenses}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

// Component to display payment details
function PaymentDetailsView({ 
  payment, 
  paidExpenses 
}: { 
  payment: PaymentHistory;
  paidExpenses: PaymentDetailsResponse["paidExpenses"];
}) {
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return <CreditCard className="h-4 w-4" />;
      case "cash":
        return <Banknote className="h-4 w-4" />;
      case "digital_wallet":
        return <Smartphone className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return "Chuyển khoản ngân hàng";
      case "cash":
        return "Tiền mặt";
      case "digital_wallet":
        return "Ví điện tử";
      default:
        return method;
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Info */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">Số tiền</Label>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(parseFloat(payment.amount))}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Trạng thái</Label>
            <div className="flex items-center space-x-2 mt-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-600 font-medium">Hoàn thành</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">Phương thức thanh toán</Label>
            <div className="flex items-center space-x-2 mt-1">
              {getPaymentMethodIcon(payment.paymentMethod)}
              <span>{getPaymentMethodName(payment.paymentMethod)}</span>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Ngày thanh toán</Label>
            <p className="mt-1">{formatDate(payment.paymentDate)}</p>
          </div>
        </div>
        
        {payment.description && (
          <div>
            <Label className="text-sm font-medium text-gray-500">Ghi chú</Label>
            <p className="mt-1 p-3 bg-gray-50 rounded-lg">{payment.description}</p>
          </div>
        )}
      </div>

      {/* Paid Expenses */}
      {paidExpenses.length > 0 && (
        <>
          <Separator />
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Các khoản chi tiêu đã thanh toán ({paidExpenses.length})
            </h4>
            <div className="space-y-3">
              {paidExpenses.map((paidExpense) => (
                <div key={paidExpense.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{paidExpense.expense.title}</p>
                    {paidExpense.expense.description && (
                      <p className="text-sm text-gray-500">{paidExpense.expense.description}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      Ngày tạo: {formatDate(paidExpense.expense.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {formatCurrency(parseFloat(paidExpense.amountPaid))}
                    </p>
                    <p className="text-xs text-gray-500">
                      / {formatCurrency(parseFloat(paidExpense.expense.amount))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}