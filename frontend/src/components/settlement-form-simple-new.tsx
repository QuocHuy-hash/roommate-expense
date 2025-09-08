import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { settlementsAPI, handleAPIError } from "@/lib/api";

interface SettlementFormProps {
  onSuccess: () => void;
}

export default function SettlementFormSimple({ onSuccess }: SettlementFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    payeeId: "",
    amount: "",
    description: "",
    paymentMethod: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  // Mock users data - TODO: Replace with API call to get roommates
  const mockUsers = [
    { id: "user-2", firstName: "Huy", lastName: "Nguyễn" },
    { id: "user-3", firstName: "An", lastName: "Trần" },
    { id: "user-4", firstName: "Minh", lastName: "Lê" },
  ];

  // Payment methods
  const paymentMethods = [
    { id: "cash", name: "Tiền mặt" },
    { id: "bank", name: "Chuyển khoản" },
    { id: "momo", name: "MoMo" },
    { id: "zalo", name: "ZaloPay" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.payeeId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn người nhận thanh toán",
        variant: "destructive",
      });
      return;
    }

    if (!formData.amount.trim() || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số tiền hợp lệ",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const settlementData = {
        payeeId: formData.payeeId,
        amount: formData.amount,
        description: formData.description || undefined,
      };

      const response = await settlementsAPI.create(settlementData);
      
      // Invalidate settlements query to refresh data
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
      
      toast({
        title: "Thành công!",
        description: `Đã tạo thanh toán ${formatCurrency(parseFloat(response.settlement.amount))}`,
      });
      
      // Reset form
      setFormData({
        payeeId: "",
        amount: "",
        description: "",
        paymentMethod: "",
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: handleAPIError(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-auto">
      {/* Hidden accessibility elements */}
      <div className="sr-only">
        <h2 id="settlement-form-title">Thanh toán</h2>
        <p id="settlement-form-description">Form để tạo thanh toán cho các khoản chi tiêu chung</p>
      </div>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">💰</span>
          <h2 className="text-lg font-semibold">Thanh toán</h2>
        </div>
        <button 
          onClick={onSuccess}
          className="text-white hover:text-gray-200 transition-colors p-1"
        >
          ✕
        </button>
      </div>

      {/* Form Content */}
      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Người nhận */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm">👤</span>
              <label htmlFor="payeeId" className="text-sm font-medium text-gray-700">Người nhận</label>
            </div>
            <select
              id="payeeId"
              value={formData.payeeId}
              onChange={(e) => handleInputChange("payeeId", e.target.value)}
              disabled={isSubmitting}
              className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn người nhận</option>
              {mockUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Số tiền */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm">💵</span>
              <label htmlFor="amount" className="text-sm font-medium text-gray-700">Số tiền (VNĐ)</label>
            </div>
            <input
              id="amount"
              type="number"
              placeholder="0"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              disabled={isSubmitting}
              className="w-full h-12 px-3 border border-gray-300 rounded-lg text-right text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm">📝</span>
              <label htmlFor="description" className="text-sm font-medium text-gray-700">Mô tả</label>
            </div>
            <textarea
              id="description"
              placeholder="Ví dụ: Trả tiền mua đồ ăn"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isSubmitting}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phương thức thanh toán */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm">💳</span>
              <label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700">Phương thức thanh toán</label>
            </div>
            <select
              id="paymentMethod"
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
              disabled={isSubmitting}
              className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn phương thức</option>
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-2 pb-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? "⏳ Đang xử lý..." : "💰 Thực hiện thanh toán"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
