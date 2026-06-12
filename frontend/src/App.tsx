import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { Layout } from "@/components/layout/Layout";
import { apiClient } from "@/api/client";
import DashboardPage from "@/pages/Dashboard";
import ProductsPage from "@/pages/Products/index";
import CustomersPage from "@/pages/Customers/index";
import OrdersPage from "@/pages/Orders/index";
import InventoryPage from "@/pages/Inventory";
import NotFound from "@/pages/NotFound";
import LoginPage from "@/pages/Login";


// Intercept 401s globally and clear auth
function AxiosInterceptor() {
  const { logout } = useAuth();
  useEffect(() => {
    const id = apiClient.interceptors.response.use(
      (r) => r,
      (err) => {
        if (err?.response?.status === 401) logout();
        return Promise.reject(err);
      },
    );
    return () => apiClient.interceptors.response.eject(id);
  }, [logout]);
  return null;
}

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AxiosInterceptor />
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route path="/*" element={<ProtectedRoutes />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Redirect logged-in users away from /login
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
}
