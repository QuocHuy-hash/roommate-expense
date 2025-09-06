import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log('main.tsx loading...');

const rootElement = document.getElementById("root");
console.log('Root element:', rootElement);

if (!rootElement) {
  console.error('Root element not found!');
} else {
  console.log('Creating React root...');
  try {
    const root = createRoot(rootElement);
    console.log('Rendering App...');
    root.render(<App />);
    console.log('App rendered successfully!');
  } catch (error) {
    console.error('Error rendering app:', error);
  }
}
