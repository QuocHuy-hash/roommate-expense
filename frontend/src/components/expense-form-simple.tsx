import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { expensesAPI, handleAPIError } from "@/lib/api";

interface ExpenseFormProps {
  onSuccess: () => void;
}

export default function ExpenseFormSimple({ onSuccess }: ExpenseFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    description: "",
    isShared: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn danh mục chi tiêu",
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
      const expenseData = {
        title: formData.title,
        amount: formData.amount,
        description: formData.description || undefined,
        isShared: formData.isShared,
      };

   await expensesAPI.create(expenseData);
      
      // Invalidate expenses query to refresh data
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      
      // Reset form
      setFormData({
        title: "",
        amount: "",
        description: "",
        isShared: true,
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-auto">
      {/* Hidden accessibility elements */}
      <div className="sr-only">
        <h2 id="expense-form-title">Thêm chi tiêu</h2>
        <p id="expense-form-description">Form để thêm khoản chi tiêu mới vào hệ thống</p>
      </div>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">💰</span>
          <h2 className="text-lg font-semibold">Thêm chi tiêu</h2>
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
              placeholder="Mô tả chi tiết (tùy chọn)"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isSubmitting}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Danh mục */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm">🏷️</span>
              <label htmlFor="category" className="text-sm font-medium text-gray-700">Danh mục</label>
            </div>
            <select
              id="category"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              disabled={isSubmitting}
              className="w-full h-12 px-3 border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn danh mục</option>
              <option value="Tiền điện">Tiền điện</option>
              <option value="Tiền nước">Tiền nước</option>
              <option value="Tiền internet">Tiền internet</option>
              <option value="Đồ ăn">Đồ ăn</option>
              <option value="Đi chợ">Đi chợ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          {/* Checkbox chia sẻ */}
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isShared"
                checked={formData.isShared}
                onChange={(e) => handleInputChange("isShared", e.target.checked)}
                disabled={isSubmitting}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isShared" className="text-sm font-medium text-gray-700">
                Chia sẻ với bạn cùng phòng
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 pb-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? "⏳ Đang thêm..." : "💰 Thêm chi tiêu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
