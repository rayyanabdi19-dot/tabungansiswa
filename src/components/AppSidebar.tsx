import { LayoutDashboard, Users, ArrowUpDown, History, LogOut, PiggyBank, Settings, Info, ChevronDown, CreditCard, X, FileBarChart, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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
  { icon: History, label: "Riwayat Transaksi", path: "/history" },
];

const settingsMenu = [
  { icon: Settings, label: "Profil Sekolah", path: "/settings" },
  { icon: User, label: "Profil Admin", path: "/profile" },
  { icon: Info, label: "Tentang Aplikasi", path: "/about" },
];

const AppSidebar = ({ onClose }: { onClose?: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, role } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(
    settingsMenu.some((m) => m.path === location.pathname)
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("school_settings").select("logo_url").limit(1).single().then(({ data }) => {
      if (data && (data as any).logo_url) setLogoUrl((data as any).logo_url);
    });
  }, []);

  const menu = role === "parent" ? parentMenu : adminMenu;

  const renderItem = (item: { icon: any; label: string; path: string }) => {
    const isActive = location.pathname === item.path;
    return (
      <button
        key={item.path}
        onClick={() => { navigate(item.path); onClose?.(); }}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-sidebar-primary/20 text-sidebar-primary shadow-sm"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
      >
        <item.icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
        {item.label}
        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />}
      </button>
    );
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sidebar-primary to-accent flex items-center justify-center shadow-lg shadow-sidebar-primary/20 overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <PiggyBank className="w-6 h-6 text-sidebar-primary-foreground" />
            )}
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">TabunganKu</h1>
            <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">Mickro Data 2R</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-sidebar-foreground/60 hover:text-sidebar-foreground p-1">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 mt-2 space-y-1">
        <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">Menu Utama</p>
        {menu.map(renderItem)}

        {role === "admin" && (
          <div className="pt-4">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30 hover:text-sidebar-foreground/50 transition-colors"
            >
              Pengaturan
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", settingsOpen && "rotate-180")} />
            </button>
            {settingsOpen && (
              <div className="space-y-1 mt-1 animate-fade-in">
                {settingsMenu.map(renderItem)}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="p-3 mt-auto border-t border-sidebar-border">
        <button
          onClick={async () => { await signOut(); navigate("/"); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-sidebar-foreground/50 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
