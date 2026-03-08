import { useEffect, useState, useCallback, useMemo } from "react";
import { Wallet, Users, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatRupiah } from "@/lib/utils";

const carouselSlides = [
  {
    title: "Menabung Sejak Dini 🐷",
    description: "Biasakan anak menabung sejak kecil untuk masa depan yang lebih cerah.",
    bg: "from-primary/20 to-primary/5",
  },
  {
    title: "Pantau Tabungan Anak 📱",
    description: "Orang tua dapat memantau saldo dan riwayat transaksi anak secara real-time.",
    bg: "from-info/20 to-info/5",
  },
  {
    title: "Aman & Transparan 🔒",
    description: "Setiap transaksi tercatat otomatis. Tidak ada setoran yang terlewat.",
    bg: "from-warning/20 to-warning/5",
  },
  {
    title: "Pinjaman Terintegrasi 💳",
    description: "Kelola pinjaman siswa yang terintegrasi dengan data tabungan.",
    bg: "from-success/20 to-success/5",
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({ totalBalance: 0, totalStudents: 0, todayDeposit: 0, todayWithdraw: 0 });
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  useEffect(() => {
    const load = async () => {
      const { data: students } = await supabase.from("students").select("balance");
      const totalBalance = (students || []).reduce((s, st) => s + Number(st.balance), 0);
      const totalStudents = students?.length || 0;

      const today = new Date().toISOString().split("T")[0];
      const { data: todayTxs } = await supabase
        .from("transactions")
        .select("type, amount")
        .gte("created_at", today + "T00:00:00")
        .lte("created_at", today + "T23:59:59");

      const todayDeposit = (todayTxs || []).filter(t => t.type === "setoran").reduce((s, t) => s + Number(t.amount), 0);
      const todayWithdraw = (todayTxs || []).filter(t => t.type === "penarikan").reduce((s, t) => s + Number(t.amount), 0);

      setStats({ totalBalance, totalStudents, todayDeposit, todayWithdraw });

      const { data: txs } = await supabase
        .from("transactions")
        .select("*, students(name)")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentTx(txs || []);

      // Monthly chart data (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      const { data: monthlyTxs } = await supabase
        .from("transactions")
        .select("type, amount, created_at")
        .gte("created_at", sixMonthsAgo.toISOString());

      const months: Record<string, { setoran: number; penarikan: number }> = {};
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        months[key] = { setoran: 0, penarikan: 0 };
      }
      (monthlyTxs || []).forEach((tx) => {
        const d = new Date(tx.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (months[key]) {
          if (tx.type === "setoran") months[key].setoran += Number(tx.amount);
          else months[key].penarikan += Number(tx.amount);
        }
      });
      setMonthlyData(
        Object.entries(months).map(([key, val]) => ({
          name: monthNames[parseInt(key.split("-")[1]) - 1],
          Setoran: val.setoran,
          Penarikan: val.penarikan,
        }))
      );
    };
    load();
  }, []);

  const statCards = [
    { title: "Total Saldo", value: formatRupiah(stats.totalBalance), icon: Wallet, color: "text-primary", bg: "bg-primary/10" },
    { title: "Jumlah Siswa", value: stats.totalStudents.toString(), icon: Users, color: "text-info", bg: "bg-info/10" },
    { title: "Setoran Hari Ini", value: formatRupiah(stats.todayDeposit), icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
    { title: "Penarikan Hari Ini", value: formatRupiah(stats.todayWithdraw), icon: TrendingDown, color: "text-warning", bg: "bg-warning/10" },
  ];

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Selamat datang, Admin 👋</p>
        </div>

        {/* Carousel */}
        <Card className="glass-card mb-6 md:mb-8 overflow-hidden">
          <CardContent className="p-0">
            <div className={`relative p-5 md:p-8 bg-gradient-to-r ${carouselSlides[currentSlide].bg} transition-all duration-500`}>
              <div className="max-w-lg">
                <h2 className="text-lg md:text-2xl font-bold mb-2">{carouselSlides[currentSlide].title}</h2>
                <p className="text-muted-foreground text-sm md:text-base">{carouselSlides[currentSlide].description}</p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevSlide}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex gap-1.5">
                  {carouselSlides.map((_, i) => (
                    <button key={i} onClick={() => setCurrentSlide(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? "bg-primary w-6" : "bg-primary/30"}`} />
                  ))}
                </div>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextSlide}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          {statCards.map((card) => (
            <Card key={card.title} className="glass-card">
              <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{card.title}</p>
                    <p className="text-lg md:text-2xl font-bold mt-1 truncate">{card.value}</p>
                  </div>
                  <div className={`p-2 md:p-2.5 rounded-xl ${card.bg} shrink-0`}>
                    <card.icon className={`w-4 h-4 md:w-5 md:h-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Monthly Chart */}
        <Card className="glass-card mb-6 md:mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Statistik Tabungan Per Bulan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    formatter={(value: number) => formatRupiah(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Setoran" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Penarikan" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Transaksi Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTx.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Belum ada transaksi</p>
              )}
              {recentTx.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tx.type === "setoran" ? "bg-success/10" : "bg-warning/10"}`}>
                      {tx.type === "setoran" ? <ArrowUpRight className="w-4 h-4 text-success" /> : <ArrowDownRight className="w-4 h-4 text-warning" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{(tx.students as any)?.name || "Siswa"}</p>
                      <p className="text-xs text-muted-foreground truncate">{tx.note}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className={`text-sm font-semibold ${tx.type === "setoran" ? "text-success" : "text-warning"}`}>
                      {tx.type === "setoran" ? "+" : "-"}{formatRupiah(Number(tx.amount))}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString("id-ID")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
