import { useEffect, useState } from "react";
import { Wallet, ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatRupiah } from "@/lib/utils";

const ParentDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: studs } = await supabase
        .from("students")
        .select("*")
        .eq("parent_user_id", user.id);

      setStudents(studs || []);

      if (studs && studs.length > 0) {
        const ids = studs.map((s) => s.id);
        const { data: txs } = await supabase
          .from("transactions")
          .select("*")
          .in("student_id", ids)
          .order("created_at", { ascending: false })
          .limit(20);
        setTransactions(txs || []);

        const { data: lns } = await supabase
          .from("loans")
          .select("*")
          .in("student_id", ids)
          .eq("status", "active");
        setLoans(lns || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground animate-pulse">Memuat data...</p>
        </div>
      </AppLayout>
    );
  }

  const totalBalance = students.reduce((s, st) => s + Number(st.balance), 0);
  const totalLoans = loans.reduce((s, l) => s + Number(l.remaining), 0);

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold">Dashboard Orang Tua</h1>
          <p className="text-muted-foreground text-sm">Pantau tabungan anak Anda</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Saldo</p>
                  <p className="text-2xl font-bold mt-1">{formatRupiah(totalBalance)}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pinjaman Aktif</p>
                  <p className="text-2xl font-bold mt-1">{formatRupiah(totalLoans)}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-warning/10">
                  <CreditCard className="w-5 h-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {students.map((student) => (
          <Card key={student.id} className="glass-card mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {student.name} — Kelas {student.class}
              </CardTitle>
              <p className="text-sm text-muted-foreground">NIS: {student.nis}</p>
              <p className="text-lg font-bold text-primary">{formatRupiah(Number(student.balance))}</p>
            </CardHeader>
          </Card>
        ))}

        {loans.length > 0 && (
          <Card className="glass-card mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Pinjaman Aktif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loans.map((loan) => {
                  const student = students.find((s) => s.id === loan.student_id);
                  return (
                    <div key={loan.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-warning/10">
                          <CreditCard className="w-4 h-4 text-warning" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{student?.name || "Siswa"}</p>
                          <p className="text-xs text-muted-foreground">
                            Pinjaman: {formatRupiah(Number(loan.amount))}
                          </p>
                          {loan.due_date && (
                            <p className="text-xs text-muted-foreground">
                              Jatuh tempo: {new Date(loan.due_date).toLocaleDateString("id-ID")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-warning">{formatRupiah(Number(loan.remaining))}</p>
                        <p className="text-xs text-muted-foreground">sisa</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Riwayat Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Belum ada transaksi</p>
              )}
              {transactions.map((tx) => {
                const student = students.find((s) => s.id === tx.student_id);
                return (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tx.type === "setoran" ? "bg-success/10" : "bg-warning/10"}`}>
                        {tx.type === "setoran" ? <ArrowUpRight className="w-4 h-4 text-success" /> : <ArrowDownRight className="w-4 h-4 text-warning" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{student?.name || "Siswa"}</p>
                        <p className="text-xs text-muted-foreground">{tx.note || tx.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${tx.type === "setoran" ? "text-success" : "text-warning"}`}>
                        {tx.type === "setoran" ? "+" : "-"}{formatRupiah(Number(tx.amount))}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString("id-ID")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ParentDashboard;
