import { LayoutDashboard, Users, ArrowUpDown, History, LogOut, PiggyBank } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Data Siswa", path: "/students" },
  { icon: ArrowUpDown, label: "Transaksi", path: "/transactions" },
  { icon: History, label: "Riwayat", path: "/history" },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sidebar-primary/20 flex items-center justify-center">
          <PiggyBank className="w-6 h-6 text-sidebar-primary" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">TabunganKu</h1>
          <p className="text-xs text-sidebar-foreground/60">Tabungan Siswa</p>
        </div>
      </div>

      <nav className="flex-1 px-3 mt-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 mt-auto">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all"
        >
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
