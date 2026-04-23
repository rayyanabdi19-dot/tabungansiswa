import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PiggyBank, Eye, EyeOff, Loader2, Shield, TrendingUp, Sparkles, BookOpen, ChevronRight, ChevronLeft, Users, BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { APP_VERSION, CHANGELOG } from "@/lib/appConfig";
import { useSchoolInfo } from "@/hooks/useSchoolInfo";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role } = useAuth();
  const { school } = useSchoolInfo();
  const [showPassword, setShowPassword] = useState(false);
  const [loginRole, setLoginRole] = useState<"admin" | "parent">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nis, setNis] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (user && role) navigate("/dashboard", { replace: true });
  }, [user, role, navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, role: "admin" } } });
      if (error) { toast({ title: "Gagal Daftar", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Berhasil Daftar ✅", description: "Silakan login." }); setIsSignup(false); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toast({ title: "Login Gagal", description: error.message, variant: "destructive" }); }
      else { navigate("/dashboard"); }
    }
    setLoading(false);
  };

  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const trimmedNis = nis.trim();
    const parentEmail = `parent-${trimmedNis}@tabunganku.app`;
    const parentPassword = `nis-${trimmedNis}-parent`;

    const { data: loginData, error } = await supabase.auth.signInWithPassword({ email: parentEmail, password: parentPassword });
    if (!error && loginData.user) {
      await supabase.rpc("link_parent_to_student", { _nis: trimmedNis, _parent_user_id: loginData.user.id });
      navigate("/dashboard");
      setLoading(false);
      return;
    }

    const { data: nisExists } = await supabase.rpc("check_nis_exists", { _nis: trimmedNis });
    if (!nisExists) {
      toast({ title: "NIS Tidak Ditemukan", description: "Pastikan NIS siswa sudah terdaftar oleh admin.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: parentEmail,
      password: parentPassword,
      options: { data: { full_name: `Orang Tua (NIS: ${trimmedNis})`, role: "parent" } },
    });
    if (signUpError || !signUpData.session) {
      toast({ title: "Login Gagal", description: signUpError?.message || "Akun tidak dapat dibuat. Hubungi admin.", variant: "destructive" });
      setLoading(false);
      return;
    }

    if (signUpData.user) {
      await supabase.rpc("link_parent_to_student", { _nis: trimmedNis, _parent_user_id: signUpData.user.id });
    }
    navigate("/dashboard");
    setLoading(false);
  };

  const features = [
    { icon: Shield, title: "Aman & Terpercaya", desc: "Data terenkripsi dengan standar keamanan tinggi" },
    { icon: TrendingUp, title: "Pantau Tabungan", desc: "Riwayat transaksi real-time untuk admin & orang tua" },
    { icon: Sparkles, title: "Mudah Digunakan", desc: "Antarmuka modern, intuitif, dan responsif" },
    { icon: BookOpen, title: "Laporan Lengkap", desc: "Export PDF & Excel kapan saja" },
    { icon: Users, title: "Multi Peran", desc: "Portal terpisah untuk admin dan orang tua" },
    { icon: BarChart3, title: "Analitik Dashboard", desc: "Grafik statistik tabungan per bulan" },
  ];

  const recentChanges = CHANGELOG.slice(0, 3);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Book Container */}
      <div className="relative z-10 w-full max-w-5xl" style={{ perspective: "2000px" }}>
        {/* School header - mobile */}
        <motion.div
          className="text-center mb-6 lg:hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-3 shadow-xl shadow-primary/30 overflow-hidden">
            {school?.logo_url ? (
              <img src={school.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <PiggyBank className="w-8 h-8 text-primary-foreground" />
            )}
          </div>
          <h1 className="text-xl font-bold text-foreground font-heading">{school?.name || "TabunganKu"}</h1>
          <p className="text-muted-foreground text-xs mt-1">Sistem Tabungan Siswa Digital</p>
        </motion.div>

        <div className="relative w-full min-h-[560px] lg:min-h-[520px]">
          {/* Book spine shadow */}
          <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-2 -translate-x-1/2 bg-gradient-to-b from-transparent via-border/60 to-transparent z-20 rounded-full" />

          <div className="relative w-full h-full flex flex-col lg:flex-row">
            {/* LEFT PAGE - Login Form (always visible on desktop, toggles on mobile) */}
            <AnimatePresence mode="wait">
              {!flipped && (
                <motion.div
                  key="login-page"
                  className="w-full lg:w-1/2 lg:block"
                  initial={{ rotateY: -90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: 90, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ transformOrigin: "right center" }}
                >
                  <div className="h-full rounded-2xl lg:rounded-r-none lg:rounded-l-2xl border border-border/40 bg-card/80 backdrop-blur-xl shadow-2xl p-6 md:p-8">
                    {/* Desktop school logo */}
                    <div className="hidden lg:flex items-center gap-3 mb-6">
                      <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/25 overflow-hidden">
                        {school?.logo_url ? (
                          <img src={school.logo_url} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <PiggyBank className="w-6 h-6 text-primary-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm font-heading">{school?.name || "TabunganKu"}</p>
                        <p className="text-xs text-muted-foreground">Sistem Tabungan Digital</p>
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold text-foreground mb-1 font-heading">Selamat Datang 👋</h2>
                    <p className="text-sm text-muted-foreground mb-6">Masuk untuk mengelola tabungan</p>

                    {/* Role toggle */}
                    <div className="flex gap-2 mb-6 p-1 bg-secondary/60 rounded-xl">
                      <Button type="button" variant={loginRole === "admin" ? "default" : "ghost"} className={`flex-1 rounded-lg text-sm transition-all duration-300 ${loginRole === "admin" ? "shadow-md" : ""}`} onClick={() => { setLoginRole("admin"); setIsSignup(false); }}>
                        Admin
                      </Button>
                      <Button type="button" variant={loginRole === "parent" ? "default" : "ghost"} className={`flex-1 rounded-lg text-sm transition-all duration-300 ${loginRole === "parent" ? "shadow-md" : ""}`} onClick={() => { setLoginRole("parent"); setIsSignup(false); }}>
                        Orang Tua
                      </Button>
                    </div>

                    {loginRole === "admin" ? (
                      <form onSubmit={handleAdminLogin} className="space-y-4">
                        {isSignup && (
                          <div className="space-y-1.5">
                            <Label htmlFor="fullName" className="text-xs">Nama Lengkap</Label>
                            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nama lengkap" required className="h-11" />
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <Label htmlFor="email" className="text-xs">Email</Label>
                          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@sekolah.id" required className="h-11" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="password" className="text-xs">Password</Label>
                          <div className="relative">
                            <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="h-11 pr-11" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <Button type="submit" className="w-full h-11 text-sm font-semibold gradient-bg border-0 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-300" disabled={loading}>
                          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          {isSignup ? "Daftar Akun" : "Masuk"}
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                          {isSignup ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
                          <button type="button" onClick={() => setIsSignup(!isSignup)} className="text-primary font-semibold hover:underline">
                            {isSignup ? "Masuk" : "Daftar"}
                          </button>
                        </p>
                      </form>
                    ) : (
                      <form onSubmit={handleParentLogin} className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="nis" className="text-xs">NIS Siswa</Label>
                          <Input id="nis" value={nis} onChange={(e) => setNis(e.target.value)} placeholder="Masukkan NIS siswa" required className="h-11" />
                        </div>
                        <p className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                          💡 Masuk menggunakan NIS siswa. Akun otomatis dibuat jika NIS terdaftar.
                        </p>
                        <Button type="submit" className="w-full h-11 text-sm font-semibold gradient-bg border-0 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-300" disabled={loading}>
                          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Masuk sebagai Orang Tua
                        </Button>
                      </form>
                    )}

                    {/* Flip button - mobile only */}
                    <button
                      onClick={() => setFlipped(true)}
                      className="lg:hidden flex items-center justify-center gap-2 w-full mt-5 py-2.5 text-sm text-primary font-medium hover:bg-secondary/50 rounded-xl transition-colors"
                    >
                      Tentang Aplikasi <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* RIGHT PAGE - App Info (always visible on desktop, toggles on mobile) */}
            <div className="hidden lg:block w-1/2">
              <InfoPage school={school} features={features} recentChanges={recentChanges} />
            </div>

            {/* Mobile: Info page when flipped */}
            <AnimatePresence mode="wait">
              {flipped && (
                <motion.div
                  key="info-page"
                  className="w-full lg:hidden"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ transformOrigin: "left center" }}
                >
                  <InfoPage school={school} features={features} recentChanges={recentChanges} onBack={() => setFlipped(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-0.5">
          <p className="text-xs text-muted-foreground">© 2026 {school?.name || "TabunganKu"} — Sistem Tabungan Siswa</p>
          <p className="text-xs text-muted-foreground font-medium">Versi {APP_VERSION}</p>
        </div>
      </div>
    </div>
  );
};

interface InfoPageProps {
  school: any;
  features: { icon: any; title: string; desc: string }[];
  recentChanges: any[];
  onBack?: () => void;
}

const InfoPage = ({ school, features, recentChanges, onBack }: InfoPageProps) => (
  <div className="h-full rounded-2xl lg:rounded-l-none lg:rounded-r-2xl border border-border/40 lg:border-l-0 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden relative">
    {/* Gradient header */}
    <div className="gradient-bg p-6 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
      <motion.div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {onBack && (
        <button onClick={onBack} className="relative z-10 flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-sm mb-3 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Kembali ke Login
        </button>
      )}

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center overflow-hidden">
            {school?.logo_url ? (
              <img src={school.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <PiggyBank className="w-5 h-5 text-primary-foreground" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary-foreground font-heading">{school?.name || "TabunganKu"}</h2>
            {school?.address && <p className="text-xs text-primary-foreground/70">{school.address}</p>}
          </div>
        </div>
        {school?.npsn && <p className="text-xs text-primary-foreground/50 mt-1">NPSN: {school.npsn}</p>}
      </div>
    </div>

    <div className="p-6 space-y-5 max-h-[360px] lg:max-h-none overflow-y-auto">
      {/* Features grid */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 font-heading">Fitur Unggulan</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
              className="p-3 rounded-xl bg-secondary/40 border border-border/30 hover:bg-secondary/60 hover:scale-[1.02] transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-4 h-4 text-primary" />
              </div>
              <p className="font-semibold text-foreground text-xs">{f.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent updates */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2.5 font-heading">Pembaruan Terbaru</h3>
        <div className="space-y-2">
          {recentChanges.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="p-3 rounded-xl bg-secondary/30 border border-border/20"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-primary">v{entry.version}</span>
                <span className="text-[10px] text-muted-foreground">{entry.date}</span>
              </div>
              <ul className="space-y-0.5">
                {entry.changes.slice(0, 2).map((c: string, j: number) => (
                  <li key={j} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span> {c}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2.5 font-heading">FAQ — Pertanyaan Umum</h3>
        <div className="space-y-2">
          {[
            { q: "Bagaimana cara login sebagai Admin?", a: "Pilih tab \"Admin\", masukkan email dan password yang sudah didaftarkan. Jika belum punya akun, klik \"Daftar\" untuk membuat akun baru." },
            { q: "Bagaimana cara login sebagai Orang Tua?", a: "Pilih tab \"Orang Tua\", lalu masukkan NIS siswa. Akun akan otomatis dibuat jika NIS sudah terdaftar oleh admin." },
            { q: "Apa itu NIS?", a: "NIS (Nomor Induk Siswa) adalah nomor unik yang diberikan oleh sekolah. Hubungi admin jika belum mengetahui NIS anak Anda." },
            { q: "Lupa password admin?", a: "Hubungi administrator sekolah untuk mereset password akun Anda." },
          ].map((item, i) => (
            <motion.details
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              className="group p-3 rounded-xl bg-secondary/30 border border-border/20 cursor-pointer"
            >
              <summary className="text-xs font-semibold text-foreground list-none flex items-center justify-between">
                {item.q}
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-open:rotate-90 transition-transform duration-200" />
              </summary>
              <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{item.a}</p>
            </motion.details>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default Login;
