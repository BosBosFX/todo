import { BrowserRouter } from "react-router-dom";
import { PWAProvider } from "./context/PWAContext";
import { Layout } from "./components/Layout";
import { AppRoutes } from "./routes";
import { PWATestPanel } from "./components/PWATestPanel";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <PWAProvider>
        <Layout>
          <AppRoutes />

          {/* PWA Test Elements - Remove after testing */}
          <div className="fixed top-4 left-4 bg-green-500 text-white p-3 rounded-lg shadow-lg z-50 max-w-xs">
            <div className="font-bold text-sm">🚀 PWA TEST v2.2</div>
            <div className="text-xs opacity-90 mt-1">
              Enhanced update detection + Auto-check
            </div>
            <div className="text-xs opacity-75 mt-1">
              {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Network Status Indicator */}
          <div className="fixed top-4 right-4 bg-blue-500 text-white p-2 rounded-lg shadow-lg z-50">
            <div className="text-xs font-medium">
              {navigator.onLine ? "🟢 Online" : "🔴 Offline"}
            </div>
          </div>

          {/* PWA Status Indicator */}
          <div className="fixed bottom-20 left-4 bg-purple-500 text-white p-2 rounded-lg shadow-lg z-50 text-xs">
            <div>
              PWA: {navigator.serviceWorker ? "✅ SW Ready" : "❌ No SW"}
            </div>
            <div>
              Storage: {navigator.storage ? "✅ Available" : "❌ Limited"}
            </div>
          </div>

          {/* PWA Test Panel */}
          <PWATestPanel />
        </Layout>
      </PWAProvider>
    </BrowserRouter>
  );
}

export default App;
