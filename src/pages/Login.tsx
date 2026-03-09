import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PiggyBank, Eye, EyeOff, Loader2, Sparkles, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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
    if (user && role) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, role, navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignup) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role: "admin" },
        },
      });
      if (error) {
        toast({ title: "Gagal Daftar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Berhasil Daftar ✅", description: "Silakan login." });
        setIsSignup(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Login Gagal", description: error.message, variant: "destructive" });
      } else {
        navigate("/dashboard");
      }
    }
    setLoading(false);
  };

  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const parentEmail = `parent-${nis}@tabunganku.app`;
    const parentPassword = `nis-${nis}-parent`;

    const { error } = await supabase.auth.signInWithPassword({
      email: parentEmail,
      password: parentPassword,
    });

    if (!error) {
      const { data: { user: loggedUser } } = await supabase.auth.getUser();
      if (loggedUser) {
        await supabase
          .from("students")
          .update({ parent_user_id: loggedUser.id })
          .eq("nis", nis);
      }
      navigate("/dashboard");
      setLoading(false);
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: parentEmail,
      password: parentPassword,
      options: {
        data: { full_name: `Orang Tua (NIS: ${nis})`, role: "parent" },
      },
    });

    if (signUpError) {
      toast({ title: "NIS Tidak Ditemukan", description: "Pastikan NIS siswa sudah terdaftar oleh admin.", variant: "destructive" });
      setLoading(false);
      return;
    }

    if (!signUpData.session) {
      toast({ title: "Login Gagal", description: "Akun tidak dapat dibuat. Hubungi admin.", variant: "destructive" });
      setLoading(false);
      return;
    }

    if (signUpData.user) {
      await supabase
        .from("students")
        .update({ parent_user_id: signUpData.user.id })
        .eq("nis", nis);

      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("nis", nis)
        .eq("parent_user_id", signUpData.user.id)
        .single();

      if (!student) {
        await supabase.auth.signOut();
        toast({ title: "NIS Tidak Ditemukan", description: "Pastikan NIS siswa sudah terdaftar oleh admin.", variant: "destructive" });
        setLoading(false);
        return;
      }

      navigate("/dashboard");
    }
    setLoading(false);
  };

  const features = [
    { icon: Shield, title: "Aman & Terpercaya", desc: "Data terenkripsi & terlindungi" },
    { icon: TrendingUp, title: "Pantau Tabungan", desc: "Riwayat transaksi real-time" },
    { icon: Sparkles, title: "Mudah Digunakan", desc: "Antarmuka modern & intuitif" },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-[pulse_5s_ease-in-out_infinite_1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite_2s]" />
      </div>

      {/* Left Hero Section - hidden on mobile, shown on lg */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
        <div className="max-w-md animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-8 shadow-lg shadow-primary/30 animate-[bounce_3s_ease-in-out_infinite]">
            <PiggyBank className="w-11 h-11 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-extrabold text-foreground mb-3 leading-tight">
            TabunganKu
          </h1>
          <p className="text-lg text-muted-foreground mb-10">
            Sistem tabungan siswa digital yang modern, aman, dan mudah digunakan.
          </p>
          <div className="space-y-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{f.title}</p>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile-only header */}
          <div className="text-center mb-8 lg:hidden">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30 animate-[bounce_3s_ease-in-out_infinite]">
              <PiggyBank className="w-9 h-9 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">TabunganKu</h1>
            <p className="text-muted-foreground mt-1">Sistem Tabungan Siswa</p>
          </div>

          <Card className="bg-card/80 backdrop-blur-md border border-border/50 shadow-xl shadow-primary/5">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold text-foreground mb-1 text-center">Selamat Datang 👋</h2>
              <p className="text-sm text-muted-foreground mb-6 text-center">Masuk untuk mengelola tabungan</p>

              <div className="flex gap-2 mb-6">
                <Button
                  type="button"
                  variant={loginRole === "admin" ? "default" : "outline"}
                  className="flex-1 transition-all duration-200"
                  onClick={() => { setLoginRole("admin"); setIsSignup(false); }}
                >
                  Admin / Petugas
                </Button>
                <Button
                  type="button"
                  variant={loginRole === "parent" ? "default" : "outline"}
                  className="flex-1 transition-all duration-200"
                  onClick={() => { setLoginRole("parent"); setIsSignup(false); }}
                >
                  Orang Tua
                </Button>
              </div>

              {loginRole === "admin" ? (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {isSignup && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nama Lengkap</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nama lengkap"
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@sekolah.id"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200" size="lg" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isSignup ? "Daftar" : "Masuk"}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    {isSignup ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
                    <button type="button" onClick={() => setIsSignup(!isSignup)} className="text-primary font-medium hover:underline">
                      {isSignup ? "Masuk" : "Daftar"}
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleParentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nis">NIS Siswa</Label>
                    <Input
                      id="nis"
                      value={nis}
                      onChange={(e) => setNis(e.target.value)}
                      placeholder="Masukkan NIS siswa"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Masuk menggunakan NIS siswa. Akun akan otomatis dibuat jika NIS terdaftar.
                  </p>
                  <Button type="submit" className="w-full shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200" size="lg" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Masuk sebagai Orang Tua
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="text-center mt-6 space-y-1">
            <p className="text-xs text-muted-foreground">© 2026 TabunganKu — Sistem Tabungan Siswa</p>
            <p className="text-xs text-muted-foreground">— Mickro Data 2R —</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
