import { Wallet, Users, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { students, transactions, formatRupiah } from "@/lib/mockData";

const statCards = [
  {
    title: "Total Saldo",
    value: formatRupiah(students.reduce((sum, s) => sum + s.balance, 0)),
    icon: Wallet,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Jumlah Siswa",
    value: students.length.toString(),
    icon: Users,
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    title: "Setoran Hari Ini",
    value: formatRupiah(
      transactions.filter((t) => t.date === "2026-03-06" && t.type === "setoran").reduce((s, t) => s + t.amount, 0)
    ),
    icon: TrendingUp,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    title: "Penarikan Hari Ini",
    value: formatRupiah(
      transactions.filter((t) => t.date === "2026-03-06" && t.type === "penarikan").reduce((s, t) => s + t.amount, 0)
    ),
    icon: TrendingDown,
    color: "text-warning",
    bg: "bg-warning/10",
  },
];

const Dashboard = () => {
  const recentTx = transactions.slice(0, 5);

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang, Admin 👋</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <Card key={card.title} className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${card.bg}`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Transaksi Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTx.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tx.type === 'setoran' ? 'bg-success/10' : 'bg-warning/10'}`}>
                      {tx.type === 'setoran' ? (
                        <ArrowUpRight className="w-4 h-4 text-success" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.studentName}</p>
                      <p className="text-xs text-muted-foreground">{tx.note}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tx.type === 'setoran' ? 'text-success' : 'text-warning'}`}>
                      {tx.type === 'setoran' ? '+' : '-'}{formatRupiah(tx.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
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
