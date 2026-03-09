import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PiggyBank, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

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

    // First, check if the student exists (public lookup via service)
    // We need to verify NIS before attempting auth
    // Try login first
    const { error } = await supabase.auth.signInWithPassword({
      email: parentEmail,
      password: parentPassword,
    });

    if (!error) {
      // Login successful, link parent if needed
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

    // Login failed - check if student exists first using anon access won't work due to RLS
    // Sign up the parent account (auto-confirm is enabled)
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

    // Check if user was actually created (fake signup returns user without session when email exists)
    if (!signUpData.session) {
      toast({ title: "Login Gagal", description: "Akun tidak dapat dibuat. Hubungi admin.", variant: "destructive" });
      setLoading(false);
      return;
    }

    // User signed up and auto-confirmed - already logged in via signUpData.session
    if (signUpData.user) {
      // Link parent to student
      await supabase
        .from("students")
        .update({ parent_user_id: signUpData.user.id })
        .eq("nis", nis);

      // Verify student exists for this NIS
      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("nis", nis)
        .eq("parent_user_id", signUpData.user.id)
        .single();

      if (!student) {
        // NIS not found, clean up by signing out
        await supabase.auth.signOut();
        toast({ title: "NIS Tidak Ditemukan", description: "Pastikan NIS siswa sudah terdaftar oleh admin.", variant: "destructive" });
        setLoading(false);
        return;
      }

      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <PiggyBank className="w-9 h-9 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">TabunganKu</h1>
          <p className="text-muted-foreground mt-1">Aplikasi Tabungan Siswa</p>
        </div>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex gap-2 mb-6">
              <Button
                type="button"
                variant={loginRole === "admin" ? "default" : "outline"}
                className="flex-1"
                onClick={() => { setLoginRole("admin"); setIsSignup(false); }}
              >
                Admin / Petugas
              </Button>
              <Button
                type="button"
                variant={loginRole === "parent" ? "default" : "outline"}
                className="flex-1"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
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
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Masuk sebagai Orang Tua
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 TabunganKu — Sistem Tabungan Siswa
        </p>
      </div>
    </div>
  );
};

export default Login;
