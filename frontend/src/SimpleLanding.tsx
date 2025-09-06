export default function SimpleLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Chi Tiêu Dùng
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Ứng dụng quản lý chi tiêu cho roommate
        </p>
        <div className="space-y-4">
          <button 
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              localStorage.setItem('auth_token', 'test-token');
              localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Test User' }));
              window.location.reload();
            }}
          >
            Đăng nhập (Test)
          </button>
          <button 
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => alert('Chức năng đăng ký')}
          >
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  );
}
