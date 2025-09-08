import { BrowserRouter } from "react-router-dom";
import { PWAProvider } from "./context/PWAContext";
import { Layout } from "./components/Layout";
import { AppRoutes } from "./routes";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <PWAProvider>
        <Layout>
          <AppRoutes />
          {/* Add this line to test */}
          <div className="fixed top-4 left-4 bg-green-500 text-white p-2 rounded">
            VERSION 2.0 - UPDATE TEST
          </div>
        </Layout>
      </PWAProvider>
    </BrowserRouter>
  );
}

export default App;
