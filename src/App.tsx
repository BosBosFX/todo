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
        </Layout>
      </PWAProvider>
    </BrowserRouter>
  );
}

export default App;
