import { LayoutDashboard, Users, ArrowUpDown, History, LogOut, PiggyBank, Settings, Info, ChevronDown, CreditCard, X, FileBarChart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const adminMenu = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Data Siswa", path: "/students" },
  { icon: ArrowUpDown, label: "Transaksi", path: "/transactions" },
  { icon: CreditCard, label: "Pinjaman", path: "/loans" },
  { icon: History, label: "Riwayat", path: "/history" },
  { icon: FileBarChart, label: "Laporan", path: "/reports" },
];

const parentMenu = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
];

const settingsMenu = [
  { icon: Settings, label: "Profil Sekolah", path: "/settings" },
  { icon: Info, label: "Tentang Aplikasi", path: "/about" },
];

const AppSidebar = ({ onClose }: { onClose?: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, role } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(
    settingsMenu.some((m) => m.path === location.pathname)
  );

  const menu = role === "parent" ? parentMenu : adminMenu;

  const renderItem = (item: { icon: any; label: string; path: string }) => {
    const isActive = location.pathname === item.path;
    return (
      <button
        key={item.path}
        onClick={() => { navigate(item.path); onClose?.(); }}
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
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary/20 flex items-center justify-center">
            <PiggyBank className="w-6 h-6 text-sidebar-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">TabunganKu</h1>
            <p className="text-xs text-sidebar-foreground/60">Tabungan Siswa</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-sidebar-foreground/60 hover:text-sidebar-foreground">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 mt-4 space-y-1">
        {menu.map(renderItem)}

        {role === "admin" && (
          <div className="pt-4">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-colors"
            >
              Pengaturan
              <ChevronDown className={cn("w-4 h-4 transition-transform", settingsOpen && "rotate-180")} />
            </button>
            {settingsOpen && (
              <div className="space-y-1 mt-1">
                {settingsMenu.map(renderItem)}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="p-3 mt-auto">
        <button
          onClick={async () => { await signOut(); navigate("/"); }}
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
