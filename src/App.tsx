// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import ApiKeyPage from "./pages/ApikeyPage";
import WebhookPage from "./pages/WebHookPage";
import BackupsPage from "./pages/BackupPage";
import SdkPage from "./pages/SdkPage";
import BillingPage from "./pages/BillingPage";
import AuditPage from "./pages/AuditPage";
import DatabaseDetailPage from "./pages/DatabaseDetailPage";
import DatabasePage from "./pages/DatabasePage";

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/database" element={<DatabasePage />} />
            <Route path="/database/:id" element={<DatabaseDetailPage />} />
            <Route path="/api-keys" element={<ApiKeyPage />} />
            <Route path="/webhook" element={<WebhookPage />} />
            <Route path="/backup" element={<BackupsPage />} />
            <Route path="/sdk" element={<SdkPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.78rem",
            borderRadius: "8px",
          },
          success: {
            iconTheme: {
              primary: "var(--green)",
              secondary: "var(--bg-elevated)",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--red)",
              secondary: "var(--bg-elevated)",
            },
          },
        }}
      />
    </QueryClientProvider>
  );
};

export default App;
