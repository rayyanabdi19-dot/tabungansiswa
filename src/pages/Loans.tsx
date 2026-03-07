import { useState, useEffect } from "react";
import { CreditCard, Plus, DollarSign, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah } from "@/lib/utils";

const Loans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);

  // Form state
  const [selectedStudent, setSelectedStudent] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [payAmount, setPayAmount] = useState("");

  const fetchData = async () => {
    const [{ data: studs }, { data: lns }] = await Promise.all([
      supabase.from("students").select("*").order("name"),
      supabase.from("loans").select("*, students(name, nis, class, balance)").order("created_at", { ascending: false }),
    ]);
    setStudents(studs || []);
    setLoans(lns || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!selectedStudent || amt <= 0) return;

    const { error } = await supabase.from("loans").insert({
      student_id: selectedStudent,
      amount: amt,
      remaining: amt,
      note,
      due_date: dueDate || null,
      created_by: user?.id,
    });

    if (error) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Pinjaman Dibuat ✅" });
      setDialogOpen(false);
      setSelectedStudent("");
      setAmount("");
      setNote("");
      setDueDate("");
      fetchData();
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;
    const amt = Number(payAmount);
    if (amt <= 0 || amt > Number(selectedLoan.remaining)) {
      toast({ title: "Jumlah tidak valid", variant: "destructive" });
      return;
    }

    const newRemaining = Number(selectedLoan.remaining) - amt;
    const newStatus = newRemaining <= 0 ? "paid" : "active";

    const { error: payErr } = await supabase.from("loan_payments").insert({
      loan_id: selectedLoan.id,
      amount: amt,
      created_by: user?.id,
    });

    if (payErr) {
      toast({ title: "Gagal", description: payErr.message, variant: "destructive" });
      return;
    }

    await supabase
      .from("loans")
      .update({ remaining: newRemaining, status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", selectedLoan.id);

    toast({ title: "Pembayaran Berhasil ✅" });
    setPayDialogOpen(false);
    setPayAmount("");
    setSelectedLoan(null);
    fetchData();
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge variant="outline" className="border-warning text-warning">Aktif</Badge>;
      case "paid": return <Badge variant="outline" className="border-success text-success">Lunas</Badge>;
      case "cancelled": return <Badge variant="outline" className="border-destructive text-destructive">Batal</Badge>;
      default: return null;
    }
  };

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Pinjaman</h1>
            <p className="text-muted-foreground text-sm">Kelola pinjaman siswa</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Buat Pinjaman
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pinjaman Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateLoan} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Pilih Siswa</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger><SelectValue placeholder="Pilih siswa..." /></SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name} — {s.class}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedStudent && (() => {
                  const st = students.find(s => s.id === selectedStudent);
                  return st ? (
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                      <p className="text-sm text-muted-foreground">Saldo tabungan</p>
                      <p className="text-lg font-bold text-primary">{formatRupiah(Number(st.balance))}</p>
                    </div>
                  ) : null;
                })()}
                <div className="space-y-2">
                  <Label>Jumlah Pinjaman (Rp)</Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min={1} placeholder="100000" required />
                </div>
                <div className="space-y-2">
                  <Label>Jatuh Tempo (Opsional)</Label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Catatan</Label>
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Keterangan pinjaman..." rows={2} />
                </div>
                <Button type="submit" className="w-full" disabled={!selectedStudent || !amount}>Simpan Pinjaman</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Pinjaman Aktif</p>
              <p className="text-2xl font-bold mt-1">
                {formatRupiah(loans.filter(l => l.status === "active").reduce((s, l) => s + Number(l.remaining), 0))}
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Jumlah Pinjaman Aktif</p>
              <p className="text-2xl font-bold mt-1">{loans.filter(l => l.status === "active").length}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Lunas</p>
              <p className="text-2xl font-bold mt-1 text-success">{loans.filter(l => l.status === "paid").length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Loan list */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Daftar Pinjaman</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8 animate-pulse">Memuat...</p>
            ) : loans.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Belum ada pinjaman</p>
            ) : (
              <div className="space-y-3">
                {loans.map((loan) => (
                  <div key={loan.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-border/50 last:border-0 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">{(loan.students as any)?.name || "Siswa"}</p>
                        <p className="text-sm text-muted-foreground">
                          Pinjaman: {formatRupiah(Number(loan.amount))} · Sisa: {formatRupiah(Number(loan.remaining))}
                        </p>
                        {loan.due_date && (
                          <p className="text-xs text-muted-foreground">Jatuh tempo: {new Date(loan.due_date).toLocaleDateString("id-ID")}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusBadge(loan.status)}
                      {loan.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => { setSelectedLoan(loan); setPayDialogOpen(true); }}
                        >
                          <DollarSign className="w-3 h-3" />
                          Bayar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment dialog */}
        <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pembayaran Pinjaman</DialogTitle>
            </DialogHeader>
            {selectedLoan && (
              <form onSubmit={handlePayment} className="space-y-4 mt-2">
                <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                  <p className="text-sm text-muted-foreground">Sisa pinjaman</p>
                  <p className="text-lg font-bold text-warning">{formatRupiah(Number(selectedLoan.remaining))}</p>
                </div>
                <div className="space-y-2">
                  <Label>Jumlah Bayar (Rp)</Label>
                  <Input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    min={1}
                    max={Number(selectedLoan.remaining)}
                    placeholder="50000"
                    required
                  />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={!payAmount}>
                  <CheckCircle className="w-4 h-4" />
                  Bayar
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Loans;
