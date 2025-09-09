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
