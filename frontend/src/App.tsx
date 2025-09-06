import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "./pages/home-new";

function App() {
  console.log('App component rendering...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div id="app-root" style={{ minHeight: '100vh' }}>
          <Toaster />
          <Home />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
