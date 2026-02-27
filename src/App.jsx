import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Farmers from './pages/Farmers';
import FarmerDetails from './pages/FarmerDetails';
import Restaurants from './pages/Restaurants';
import RestaurantDetails from './pages/RestaurantDetails';
import Riders from './pages/Riders';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Analytics from './pages/Analytics';
import Users from './pages/Users';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PrivateRoute({ children, permission }) {
  const { user, loading, hasPermission, getDefaultPage } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has permission for this route
  if (permission && !hasPermission(permission)) {
    const defaultPage = getDefaultPage();
    return <Navigate to={defaultPage} replace />;
  }

  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const { getDefaultPage } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={getDefaultPage() || '/'} replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <PrivateRoute permission="dashboard">
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/farmers"
        element={
          <PrivateRoute permission="farmers">
            <Farmers />
          </PrivateRoute>
        }
      />
      <Route
        path="/farmers/:farmerId"
        element={
          <PrivateRoute permission="farmers">
            <FarmerDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/restaurants"
        element={
          <PrivateRoute permission="restaurants">
            <Restaurants />
          </PrivateRoute>
        }
      />
      <Route
        path="/restaurants/:restaurantId"
        element={
          <PrivateRoute permission="restaurants">
            <RestaurantDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/riders"
        element={
          <PrivateRoute permission="riders">
            <Riders />
          </PrivateRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <PrivateRoute permission="customers">
            <Customers />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <PrivateRoute permission="orders">
            <Orders />
          </PrivateRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <PrivateRoute permission="payments">
            <Payments />
          </PrivateRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <PrivateRoute permission="analytics">
            <Analytics />
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute permission="users">
            <Users />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to={user ? getDefaultPage() : '/login'} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
