import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PiggyBank, Eye, EyeOff, Loader2, Shield, TrendingUp, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { APP_VERSION } from "@/lib/appConfig";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginRole, setLoginRole] = useState<"admin" | "parent">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nis, setNis] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");

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

    const { data: studentCheck } = await supabase.from("students").select("id").eq("nis", trimmedNis).maybeSingle();
    if (!studentCheck) {
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
    { icon: Shield, title: "Aman & Terpercaya", desc: "Data terenkripsi & terlindungi" },
    { icon: TrendingUp, title: "Pantau Tabungan", desc: "Riwayat transaksi real-time" },
    { icon: Sparkles, title: "Mudah Digunakan", desc: "Antarmuka modern & intuitif" },
    { icon: BookOpen, title: "Laporan Lengkap", desc: "Export dan cetak kapan saja" },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
      {/* Gradient Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center gradient-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/20" />
        {/* Floating orbs */}
        <motion.div
          className="absolute top-20 left-20 w-40 h-40 rounded-full bg-white/10 blur-2xl"
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 right-16 w-56 h-56 rounded-full bg-white/5 blur-3xl"
          animate={{ y: [15, -15, 15], x: [10, -10, 10] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="relative z-10 max-w-lg p-12"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div
            className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mb-8 shadow-2xl"
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <PiggyBank className="w-11 h-11 text-white" />
          </motion.div>
          <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight font-heading">
            TabunganKu
          </h1>
          <p className="text-lg text-white/80 mb-10 leading-relaxed">
            Sistem tabungan siswa digital yang modern, aman, dan mudah digunakan untuk sekolah Anda.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/20 hover:scale-105 transition-all duration-300 group cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3 group-hover:bg-white/25 transition-colors">
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-semibold text-white text-sm">{f.title}</p>
                <p className="text-xs text-white/60 mt-0.5">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Login Section */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-background relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/8 rounded-full blur-3xl" />

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Mobile header */}
          <div className="text-center mb-8 lg:hidden">
            <motion.div
              className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/30"
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <PiggyBank className="w-9 h-9 text-white" />
            </motion.div>
            <h1 className="text-2xl font-extrabold text-foreground font-heading">TabunganKu</h1>
            <p className="text-muted-foreground mt-1 text-sm">Sistem Tabungan Siswa Digital</p>
          </div>

          <Card className="glass-card border-border/40">
            <CardContent className="pt-8 pb-8 px-6 md:px-8">
              <h2 className="text-2xl font-bold text-foreground mb-1 text-center font-heading">Selamat Datang 👋</h2>
              <p className="text-sm text-muted-foreground mb-8 text-center">Masuk untuk mengelola tabungan</p>

              <div className="flex gap-2 mb-8 p-1 bg-secondary/60 rounded-xl">
                <Button type="button" variant={loginRole === "admin" ? "default" : "ghost"} className={`flex-1 rounded-lg transition-all duration-300 ${loginRole === "admin" ? "shadow-md" : ""}`} onClick={() => { setLoginRole("admin"); setIsSignup(false); }}>
                  Admin / Petugas
                </Button>
                <Button type="button" variant={loginRole === "parent" ? "default" : "ghost"} className={`flex-1 rounded-lg transition-all duration-300 ${loginRole === "parent" ? "shadow-md" : ""}`} onClick={() => { setLoginRole("parent"); setIsSignup(false); }}>
                  Orang Tua
                </Button>
              </div>

              {loginRole === "admin" ? (
                <motion.form key="admin" onSubmit={handleAdminLogin} className="space-y-5" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                  {isSignup && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nama Lengkap</Label>
                      <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nama lengkap" required className="h-12" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@sekolah.id" required className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="h-12 pr-12" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 text-base font-semibold gradient-bg border-0 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-300" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isSignup ? "Daftar Akun" : "Masuk"}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    {isSignup ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
                    <button type="button" onClick={() => setIsSignup(!isSignup)} className="text-primary font-semibold hover:underline">
                      {isSignup ? "Masuk" : "Daftar"}
                    </button>
                  </p>
                </motion.form>
              ) : (
                <motion.form key="parent" onSubmit={handleParentLogin} className="space-y-5" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                  <div className="space-y-2">
                    <Label htmlFor="nis">NIS Siswa</Label>
                    <Input id="nis" value={nis} onChange={(e) => setNis(e.target.value)} placeholder="Masukkan NIS siswa" required className="h-12" />
                  </div>
                  <p className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                    💡 Masuk menggunakan NIS siswa. Akun akan otomatis dibuat jika NIS terdaftar.
                  </p>
                  <Button type="submit" className="w-full h-12 text-base font-semibold gradient-bg border-0 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-300" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Masuk sebagai Orang Tua
                  </Button>
                </motion.form>
              )}
            </CardContent>
          </Card>

          <div className="text-center mt-8 space-y-1">
            <p className="text-xs text-muted-foreground">© 2026 TabunganKu — Sistem Tabungan Siswa</p>
            <p className="text-xs text-muted-foreground font-medium">Versi {APP_VERSION}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
