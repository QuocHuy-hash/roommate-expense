import { useState } from "react";
import LoginForm from "@/components/login-form";
import RegisterForm from "@/components/register-form";

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const switchToRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const switchToLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-blue-700">
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            RoomMate Expense
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-md mx-auto">
            Quản lý chi tiêu chung với bạn cùng phòng một cách dễ dàng và minh bạch
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="text-lg font-semibold text-white mb-2">Theo dõi chi tiêu</h3>
            <p className="text-blue-100 text-sm">
              Ghi chép mọi khoản chi tiêu chung một cách chi tiết và chính xác
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-white mb-2">Báo cáo rõ ràng</h3>
            <p className="text-blue-100 text-sm">
              Xem báo cáo chi tiết về chi tiêu và thanh toán của từng người
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button
            onClick={() => setIsLoginOpen(true)}
            className="flex-1 bg-white text-purple-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
          >
            🔐 Đăng nhập
          </button>
          
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex-1 bg-transparent border-2 border-white text-white font-semibold py-3 px-6 rounded-lg hover:bg-white/10 transition-colors"
          >
            📝 Đăng ký
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-blue-200 text-sm">
            Bắt đầu quản lý chi tiêu thông minh ngay hôm nay
          </p>
        </div>
      </div>

      {/* Login Modal */}
      <LoginForm
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={switchToRegister}
      />

      {/* Register Modal */}
      <RegisterForm
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={switchToLogin}
      />
    </div>
  );
}
