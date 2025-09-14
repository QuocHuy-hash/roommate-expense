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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Receipt
} from "lucide-react";
import { Label } from "recharts";

interface PaymentHistoryListProps {
  className?: string;
}

export default function PaymentHistoryList({ className }: PaymentHistoryListProps) {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

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
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Receipt className="h-5 w-5" />
          <span>Lịch sử thanh toán</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {paymentHistory.length === 0 ? (
          <div className="text-center py-6">
            <Receipt className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Chưa có lịch sử thanh toán nào</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="rounded-lg border border-gray-200 bg-white px-3 py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="min-w-0">
                      <div className="font-semibold text-base text-gray-900 leading-tight">{formatCurrency(parseFloat(payment.amount))} <span className="text-xs font-normal text-gray-500">đ</span></div>
                      <div className="text-xs text-gray-500 leading-tight">{payment.description}</div>
                      {/* Hiển thị người chuyển */}
                      <div className="text-xs text-gray-500 leading-tight mt-0.5">
                        {(payment.payer?.firstName || payment.payer?.lastName) ? (
                          <span>
                            <span className="font-medium text-gray-700">Người chuyển: {payment.payer.firstName} {payment.payer.lastName}</span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                    
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={getStatusBadgeVariant(payment.status)} className="text-xs px-2 py-0.5">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(payment.status)}
                        <span>{getStatusName(payment.status)}</span>
                      </div>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
   

