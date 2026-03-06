import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PiggyBank, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'admin' | 'parent'>('admin');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
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
                variant={role === 'admin' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setRole('admin')}
              >
                Admin / Petugas
              </Button>
              <Button
                type="button"
                variant={role === 'parent' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setRole('parent')}
              >
                Orang Tua
              </Button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  {role === 'admin' ? 'Username / Email' : 'No. HP / Email'}
                </Label>
                <Input id="email" placeholder={role === 'admin' ? 'admin@sekolah.id' : '081234567890'} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
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

              <Button type="submit" className="w-full" size="lg">
                Masuk
              </Button>
            </form>
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
