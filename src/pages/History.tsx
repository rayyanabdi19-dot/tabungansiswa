import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/components/AppLayout";
import { transactions, formatRupiah } from "@/lib/mockData";

const History = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = transactions.filter((tx) => {
    const matchSearch = tx.studentName.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || tx.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
          <p className="text-muted-foreground">{transactions.length} transaksi tercatat</p>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
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
            <div className="space-y-1">
              {filtered.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.type === 'setoran' ? 'bg-success/10' : 'bg-warning/10'}`}>
                      {tx.type === 'setoran' ? (
                        <ArrowUpRight className="w-5 h-5 text-success" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tx.studentName}</p>
                      <p className="text-sm text-muted-foreground">{tx.note}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.type === 'setoran' ? 'text-success' : 'text-warning'}`}>
                      {tx.type === 'setoran' ? '+' : '-'}{formatRupiah(tx.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                    <p className="text-xs text-muted-foreground">Saldo: {formatRupiah(tx.balanceAfter)}</p>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Tidak ada transaksi ditemukan</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default History;
