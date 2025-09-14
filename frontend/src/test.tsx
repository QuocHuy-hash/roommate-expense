import { createRoot } from "react-dom/client";
import "./index.css";

console.log('🧪 Test script loading...');

// Test basic React rendering
const TestComponent = () => {
  console.log('🧪 TestComponent rendering...');
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          🧪 Test Mode
        </h1>
        <p>React đang hoạt động bình thường!</p>
        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          Kiểm tra console để xem log chi tiết
        </p>
      </div>
    </div>
  );
};

const rootElement = document.getElementById("root");
console.log('📍 Root element found:', !!rootElement);

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<TestComponent />);
  console.log('✅ Test component rendered!');
} else {
  console.error('❌ Root element not found!');
}