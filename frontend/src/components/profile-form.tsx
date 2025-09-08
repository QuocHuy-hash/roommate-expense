import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProfileFormProps {
  onSuccess: () => void;
}

export default function ProfileForm({ onSuccess }: ProfileFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john@example.com",
    currency: "VND",
    notifications: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Currency options
  const currencies = [
    { id: "VND", name: "🇻🇳 Việt Nam Đồng (VNĐ)", flag: "🇻🇳" },
    { id: "USD", name: "🇺🇸 US Dollar (USD)", flag: "🇺🇸" },
    { id: "EUR", name: "🇪🇺 Euro (EUR)", flag: "🇪🇺" },
    { id: "JPY", name: "🇯🇵 Japanese Yen (JPY)", flag: "🇯🇵" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập email",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "✅ Thành công",
        description: "Đã cập nhật thông tin cá nhân",
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin. Vui lòng thử lại.",
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
        <h2 id="profile-form-title">Cài đặt</h2>
        <p id="profile-form-description">Form cài đặt thông tin cá nhân và tùy chọn ứng dụng</p>
      </div>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">⚙️</span>
          <h2 className="text-lg font-semibold">Cài đặt</h2>
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
          {/* Thông tin cá nhân */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm">👤</span>
              <label htmlFor="name" className="text-sm font-medium text-gray-700">Thông tin cá nhân</label>
            </div>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={isSubmitting}
              className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm">📧</span>
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
            </div>
            <input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={isSubmitting}
              className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Đơn vị tiền tệ */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm">💰</span>
              <label htmlFor="currency" className="text-sm font-medium text-gray-700">Đơn vị tiền tệ</label>
            </div>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => handleInputChange("currency", e.target.value)}
              disabled={isSubmitting}
              className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currencies.map((currency) => (
                <option key={currency.id} value={currency.id}>
                  {currency.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nhận thông báo */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="notifications"
                checked={formData.notifications}
                onChange={(e) => handleInputChange("notifications", e.target.checked)}
                disabled={isSubmitting}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex items-center space-x-2">
                <span className="text-sm">🔔</span>
                <label htmlFor="notifications" className="text-sm font-medium">
                  Nhận thông báo
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 pb-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? "⏳ Đang cập nhật..." : "💾 Lưu thay đổi"}
            </button>
          </div>

          {/* Link bổ sung */}
          <div className="pt-2">
            <button
              type="button"
              className="text-blue-600 text-sm hover:underline"
              onClick={() => {
                // Handle additional actions
                console.log("Additional settings clicked");
              }}
            >
              🔗 Đăng xuất
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
