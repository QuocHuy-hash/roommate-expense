import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log('🚀 main.tsx loading...');

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('🚨 Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById("root");
console.log('📍 Root element:', rootElement);

if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial;">
      <div style="text-align: center; padding: 20px; border: 1px solid #ff6b6b; border-radius: 8px; background: #ffe0e0;">
        <h2 style="color: #d63031;">Lỗi khởi tạo ứng dụng</h2>
        <p>Không tìm thấy root element. Vui lòng kiểm tra file index.html</p>
      </div>
    </div>
  `;
} else {
  console.log('✅ Creating React root...');
  try {
    const root = createRoot(rootElement);
    console.log('🎨 Rendering App...');
    root.render(<App />);
    console.log('✅ App rendered successfully!');
  } catch (error) {
    console.error('❌ Error rendering app:', error);
    rootElement.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial;">
        <div style="text-align: center; padding: 20px; border: 1px solid #ff6b6b; border-radius: 8px; background: #ffe0e0;">
          <h2 style="color: #d63031;">Lỗi render ứng dụng</h2>
          <p>Chi tiết lỗi: ${error}</p>
          <button onclick="window.location.reload()" style="padding: 8px 16px; background: #0984e3; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Tải lại trang
          </button>
        </div>
      </div>
    `;
  }
}
