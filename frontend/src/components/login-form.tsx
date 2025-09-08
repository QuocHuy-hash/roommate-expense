import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginForm({ isOpen, onClose, onSwitchToRegister }: LoginFormProps) {
  const { login } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập email",
        variant: "destructive",
      });
      return;
    }

    if (!formData.password.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mật khẩu",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = await login(formData.email, formData.password);
      console.log('Login form - received user data:', userData);
      
      toast({
        title: "✅ Thành công",
        description: "Đăng nhập thành công! Đang chuyển hướng...",
      });
      
      // Reset form
      setFormData({
        email: "",
        password: "",
      });
      
      // Close modal first
      onClose();
      
      // Force a small delay to ensure state updates are processed
      setTimeout(() => {
        console.log('Login completed - should redirect to home now');
      }, 100);
      
    } catch (error: any) {
      console.error('Login form error:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Đăng nhập thất bại. Vui lòng thử lại.",
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 w-[90vw] max-w-sm mx-auto" aria-describedby="login-description">
        {/* Hidden DialogTitle for accessibility */}
        <DialogTitle className="sr-only">Đăng nhập</DialogTitle>
        <DialogDescription id="login-description" className="sr-only">
          Nhập email và mật khẩu để đăng nhập vào tài khoản của bạn
        </DialogDescription>
        
        <div className="bg-white rounded-lg shadow-lg w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔐</span>
              <h2 className="text-lg font-semibold">Đăng nhập</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-1"
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>

          {/* Form Content */}
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">📧</span>
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">🔒</span>
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">Mật khẩu</label>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="current-password"
                />
              </div>

              {/* Demo Info */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-xs text-blue-700">
                  <strong>Demo:</strong> Có thể tạo tài khoản mới hoặc sử dụng tài khoản demo
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 pb-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 text-white font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? "⏳ Đang đăng nhập..." : "🔐 Đăng nhập"}
                </button>
              </div>

              {/* Switch to Register */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Chưa có tài khoản? Đăng ký ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
