import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ParentDashboard from "./pages/ParentDashboard";
import Students from "./pages/Students";
import Transactions from "./pages/Transactions";
import History from "./pages/History";
import Loans from "./pages/Loans";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import RoleSwitcher from "./components/RoleSwitcher";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><RoleSwitcher /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute allowedRoles={["admin"]}><Students /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute allowedRoles={["admin"]}><Transactions /></ProtectedRoute>} />
            <Route path="/loans" element={<ProtectedRoute allowedRoles={["admin"]}><Loans /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute allowedRoles={["admin"]}><History /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={["admin"]}><Reports /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={["admin"]}><Settings /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
