import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface SettlementFormProps {
  onSuccess: () => void;
}

export default function SettlementFormSimple({ onSuccess }: SettlementFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    payeeId: "",
    amount: "",
    description: "",
    paymentMethod: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock users data
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
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const selectedUser = mockUsers.find(u => u.id === formData.payeeId);
      
      toast({
        title: "✅ Thành công",
        description: `Đã tạo thanh toán ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(formData.amount))} cho ${selectedUser?.firstName} ${selectedUser?.lastName}`,
      });
      
      // Reset form
      setFormData({
        payeeId: "",
        amount: "",
        description: "",
        paymentMethod: "",
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo thanh toán. Vui lòng thử lại.",
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
    <div className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">💰</span>
          <h2 className="text-lg font-semibold">Thanh toán</h2>
        </div>
        <button 
          onClick={onSuccess}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Content */}
      <div className="p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Người nhận */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm">👤</span>
              <Label htmlFor="payeeId" className="text-sm font-medium text-gray-700">Người nhận</Label>
            </div>
            <Select 
              value={formData.payeeId} 
              onValueChange={(value) => handleInputChange("payeeId", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-12 border-gray-300">
                <SelectValue placeholder="Chọn người nhận" />
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

          {/* Số tiền */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm">💵</span>
              <Label htmlFor="amount" className="text-sm font-medium text-gray-700">Số tiền (VNĐ)</Label>
            </div>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              disabled={isSubmitting}
              className="h-12 border-gray-300 text-right text-lg"
            />
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm">📝</span>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">Mô tả</Label>
            </div>
            <Textarea
              id="description"
              placeholder="Ví dụ: Trả tiền mua đồ ăn"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isSubmitting}
              rows={3}
              className="resize-none border-gray-300"
            />
          </div>

          {/* Phương thức thanh toán */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm">�</span>
              <Label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700">Phương thức thanh toán</Label>
            </div>
            <Select 
              value={formData.paymentMethod} 
              onValueChange={(value) => handleInputChange("paymentMethod", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-12 border-gray-300">
                <SelectValue placeholder="Chọn phương thức" />
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

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 text-white font-medium rounded-lg"
            >
              {isSubmitting ? "⏳ Đang xử lý..." : "💰 Thực hiện thanh toán"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
