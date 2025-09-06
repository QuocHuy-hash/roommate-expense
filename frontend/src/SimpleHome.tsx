export default function SimpleHome() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Chi Tiêu Dùng</h1>
            <button 
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              onClick={() => {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                window.location.reload();
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Tổng chi tiêu</h3>
            <p className="text-3xl font-bold text-blue-600">1,250,000 ₫</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Chi tiêu của tôi</h3>
            <p className="text-3xl font-bold text-green-600">650,000 ₫</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Cần thanh toán</h3>
            <p className="text-3xl font-bold text-orange-600">75,000 ₫</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Giao dịch gần đây</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Tiền điện tháng 9</p>
                <p className="text-sm text-gray-600">Hôm qua</p>
              </div>
              <p className="font-semibold text-red-600">-150,000 ₫</p>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Mua đồ ăn</p>
                <p className="text-sm text-gray-600">2 ngày trước</p>
              </div>
              <p className="font-semibold text-red-600">-45,000 ₫</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
