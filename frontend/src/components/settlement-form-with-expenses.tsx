import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { settlementsAPI, expensesAPI, handleAPIError, Expense } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SettlementFormWithExpensesProps {
  onSuccess: () => void;
  defaultPayeeId?: string;
}

export default function SettlementFormWithExpenses({ 
  onSuccess, 
  defaultPayeeId = "" 
}: SettlementFormWithExpensesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    payeeId: defaultPayeeId,
    amount: "",
    description: "",
    paymentMethod: "bank_transfer" as const,
  });
  
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get unpaid expenses
  const { data: unpaidExpensesData, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['unpaid-expenses'],
    queryFn: expensesAPI.getUnpaid,
  });

  const unpaidExpenses = unpaidExpensesData?.expenses || [];

  // Filter expenses by selected payee
  const filteredExpenses = unpaidExpenses.filter(expense => 
    !formData.payeeId || expense.payerId === formData.payeeId
  );

  // Calculate total of selected expenses
  const selectedExpensesTotal = filteredExpenses
    .filter(expense => selectedExpenses.includes(expense.id))
    .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  // Auto-update amount when expenses are selected
  useEffect(() => {
    if (selectedExpenses.length > 0) {
      setFormData(prev => ({ 
        ...prev, 
        amount: selectedExpensesTotal.toString() 
      }));
    }
  }, [selectedExpenses, selectedExpensesTotal]);

  // Mock users data - TODO: Replace with API call to get roommates
  const mockUsers = [
    { id: "user-2", firstName: "Huy", lastName: "Nguyễn" },
    { id: "user-3", firstName: "An", lastName: "Trần" },
    { id: "user-4", firstName: "Minh", lastName: "Lê" },
  ];

  // Payment methods
  const paymentMethods = [
    { id: "bank_transfer", name: "Chuyển khoản ngân hàng" },
    { id: "cash", name: "Tiền mặt" },
    { id: "digital_wallet", name: "Ví điện tử" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const handleExpenseToggle = (expenseId: string, checked: boolean) => {
    if (checked) {
      setSelectedExpenses(prev => [...prev, expenseId]);
    } else {
      setSelectedExpenses(prev => prev.filter(id => id !== expenseId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.payeeId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn người nhận tiền",
        variant: "destructive",
      });
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số tiền hợp lệ",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await settlementsAPI.create({
        payeeId: formData.payeeId,
        amount: formData.amount,
        description: formData.description,
        paymentMethod: formData.paymentMethod,
        expenseIds: selectedExpenses.length > 0 ? selectedExpenses : undefined,
      });

      toast({
        title: "Thành công",
        description: "Đã ghi nhận thanh toán thành công",
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['unpaid-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });

      onSuccess();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: handleAPIError(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedUser = mockUsers.find(user => user.id === formData.payeeId);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Ghi nhận thanh toán</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payee Selection */}
          <div className="space-y-2">
            <Label htmlFor="payeeId">Người nhận tiền *</Label>
            <Select 
              value={formData.payeeId} 
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, payeeId: value }));
                setSelectedExpenses([]); // Reset selected expenses when changing payee
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn người nhận tiền" />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Unpaid Expenses Selection */}
          {formData.payeeId && filteredExpenses.length > 0 && (
            <div className="space-y-3">
              <Label>Chọn các khoản chi tiêu cần thanh toán (tùy chọn)</Label>
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-3">
                {filteredExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <Checkbox
                      id={expense.id}
                      checked={selectedExpenses.includes(expense.id)}
                      onCheckedChange={(checked) => handleExpenseToggle(expense.id, checked as boolean)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {expense.title}
                        </p>
                        <Badge variant="outline">
                          {formatCurrency(parseFloat(expense.amount))}
                        </Badge>
                      </div>
                      {expense.description && (
                        <p className="text-xs text-gray-500 truncate">
                          {expense.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(expense.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedExpenses.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Đã chọn {selectedExpenses.length} khoản chi tiêu
                  </p>
                  <p className="text-sm font-medium text-blue-900">
                    Tổng cộng: {formatCurrency(selectedExpensesTotal)}
                  </p>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Số tiền thanh toán *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="Nhập số tiền"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              disabled={selectedExpenses.length > 0} // Disable if expenses are selected
            />
            {selectedExpenses.length > 0 && (
              <p className="text-xs text-gray-500">
                Số tiền được tự động tính từ các khoản chi tiêu đã chọn
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
            <Select 
              value={formData.paymentMethod} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Ghi chú</Label>
            <Textarea
              id="description"
              placeholder="Thêm ghi chú về thanh toán..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Summary */}
          {formData.payeeId && formData.amount && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-gray-900">Tóm tắt thanh toán</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Người nhận:</span>
                  <span className="font-medium">
                    {selectedUser?.firstName} {selectedUser?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Số tiền:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(parseFloat(formData.amount) || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phương thức:</span>
                  <span>
                    {paymentMethods.find(m => m.id === formData.paymentMethod)?.name}
                  </span>
                </div>
                {selectedExpenses.length > 0 && (
                  <div className="flex justify-between">
                    <span>Thanh toán cho:</span>
                    <span>{selectedExpenses.length} khoản chi tiêu</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : "Ghi nhận thanh toán"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}