import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface RegisterFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ isOpen, onClose, onSwitchToLogin }: RegisterFormProps) {
  const { register } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập họ",
        variant: "destructive",
      });
      return;
    }

    if (!formData.lastName.trim()) {
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

    if (!formData.password.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mật khẩu",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await register(formData.email, formData.password, formData.firstName, formData.lastName);
      
      toast({
        title: "✅ Thành công",
        description: "Đăng ký thành công!",
      });
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Đăng ký thất bại. Vui lòng thử lại.",
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
      <DialogContent className="p-0 w-[90vw] max-w-sm mx-auto" aria-describedby="register-description">
        {/* Hidden DialogTitle for accessibility */}
        <DialogTitle className="sr-only">Đăng ký</DialogTitle>
        <DialogDescription id="register-description" className="sr-only">
          Tạo tài khoản mới để bắt đầu sử dụng ứng dụng
        </DialogDescription>
        
        <div className="bg-white rounded-lg shadow-lg w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📝</span>
              <h2 className="text-lg font-semibold">Đăng ký</h2>
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
              {/* First Name */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">👤</span>
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-700">Họ</label>
                </div>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Nhập họ"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="given-name"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">👥</span>
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-700">Tên</label>
                </div>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Nhập tên"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="family-name"
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
                  placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="new-password"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">🔐</span>
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="new-password"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 pb-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-12 text-white font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? "⏳ Đang đăng ký..." : "📝 Đăng ký"}
                </button>
              </div>

              {/* Switch to Login */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Đã có tài khoản? Đăng nhập ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
