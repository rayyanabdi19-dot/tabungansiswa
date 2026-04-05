import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatRupiah } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const History = () => {
  const { user, role } = useAuth();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (role === "parent" && user) {
        // Parent: only show their children's transactions
        const { data: kids } = await supabase.from("students").select("id").eq("parent_user_id", user.id);
        if (kids && kids.length > 0) {
          const ids = kids.map(k => k.id);
          const { data } = await supabase
            .from("transactions")
            .select("*, students(name)")
            .in("student_id", ids)
            .order("created_at", { ascending: false });
          setTransactions(data || []);
        }
      } else {
        const { data } = await supabase
          .from("transactions")
          .select("*, students(name)")
          .order("created_at", { ascending: false });
        setTransactions(data || []);
      }
      setLoading(false);
    };
    load();
  }, [user, role]);

  const filtered = transactions.filter((tx) => {
    const name = (tx.students as any)?.name || "";
    const matchSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || tx.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold">Riwayat Transaksi</h1>
          <p className="text-muted-foreground text-sm">{transactions.length} transaksi tercatat</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Cari nama siswa..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="setoran">Setoran</SelectItem>
              <SelectItem value="penarikan">Penarikan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="glass-card">
          <CardContent className="pt-6">
            {loading ? (
              <p className="text-center text-muted-foreground py-8 animate-pulse">Memuat...</p>
            ) : (
              <div className="space-y-1">
                {filtered.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tx.type === "setoran" ? "bg-success/10" : "bg-warning/10"}`}>
                        {tx.type === "setoran" ? <ArrowUpRight className="w-5 h-5 text-success" /> : <ArrowDownRight className="w-5 h-5 text-warning" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{(tx.students as any)?.name || "Siswa"}</p>
                        <p className="text-sm text-muted-foreground truncate">{tx.note}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className={`font-semibold ${tx.type === "setoran" ? "text-success" : "text-warning"}`}>
                        {tx.type === "setoran" ? "+" : "-"}{formatRupiah(Number(tx.amount))}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString("id-ID")}</p>
                      <p className="text-xs text-muted-foreground">Saldo: {formatRupiah(Number(tx.balance_after))}</p>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Tidak ada transaksi ditemukan</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default History;
