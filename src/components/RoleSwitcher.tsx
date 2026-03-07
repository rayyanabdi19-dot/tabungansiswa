import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/Dashboard";
import ParentDashboard from "@/pages/ParentDashboard";

const RoleSwitcher = () => {
  const { role } = useAuth();
  if (role === "parent") return <ParentDashboard />;
  return <Dashboard />;
};

export default RoleSwitcher;
