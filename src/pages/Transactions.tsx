import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah } from "@/lib/utils";

const Transactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [type, setType] = useState<"setoran" | "penarikan">("setoran");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.from("students").select("*").order("name").then(({ data }) => setStudents(data || []));
  }, []);

  const student = students.find((s) => s.id === selectedStudent);

  const sendWhatsAppNotification = async (studentData: any, txType: string, amt: number, newBalance: number) => {
    const phone = studentData.parent_phone;
    if (!phone) return;

    // Format phone number for WhatsApp (remove leading 0, add 62)
    let waNumber = phone.replace(/\D/g, "");
    if (waNumber.startsWith("0")) waNumber = "62" + waNumber.slice(1);
    if (!waNumber.startsWith("62")) waNumber = "62" + waNumber;

    const txLabel = txType === "setoran" ? "Setoran" : "Penarikan";
    const message = encodeURIComponent(
      `📢 *Notifikasi Tabungan Siswa*\n\n` +
      `Nama: *${studentData.name}*\n` +
      `NIS: ${studentData.nis}\n` +
      `Kelas: ${studentData.class}\n\n` +
      `Jenis: *${txLabel}*\n` +
      `Jumlah: *${formatRupiah(amt)}*\n` +
      `Saldo Sekarang: *${formatRupiah(newBalance)}*\n\n` +
      `Tanggal: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}\n\n` +
      `_Pesan otomatis dari TabunganKu_`
    );

    // Open WhatsApp with pre-filled message
    window.open(`https://wa.me/${waNumber}?text=${message}`, "_blank");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    const amt = Number(amount);
    if (amt <= 0) return;

    if (type === "penarikan" && amt > Number(student.balance)) {
      toast({ title: "Saldo Tidak Cukup", variant: "destructive" });
      return;
    }

    setSending(true);
    const newBalance = type === "setoran" ? Number(student.balance) + amt : Number(student.balance) - amt;

    const { error: txErr } = await supabase.from("transactions").insert({
      student_id: student.id,
      type,
      amount: amt,
      note,
      balance_after: newBalance,
      created_by: user?.id,
    });

    if (txErr) {
      toast({ title: "Gagal", description: txErr.message, variant: "destructive" });
      setSending(false);
      return;
    }

    await supabase.from("students").update({ balance: newBalance, updated_at: new Date().toISOString() }).eq("id", student.id);

    toast({
      title: type === "setoran" ? "Setoran Berhasil ✅" : "Penarikan Berhasil ✅",
      description: `${formatRupiah(amt)} untuk ${student.name}`,
    });

    // Send WhatsApp notification
    await sendWhatsAppNotification(student, type, amt, newBalance);

    // Refresh student balance
    const { data: refreshed } = await supabase.from("students").select("*").order("name");
    setStudents(refreshed || []);
    setSelectedStudent("");
    setAmount("");
    setNote("");
    setSending(false);
  };

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-2xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold">Transaksi Baru</h1>
          <p className="text-muted-foreground text-sm">Catat setoran atau penarikan tabungan</p>
        </div>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex gap-2 mb-6">
              <Button type="button" variant={type === "setoran" ? "default" : "outline"} className="flex-1 gap-2" onClick={() => setType("setoran")}>
                <ArrowUpRight className="w-4 h-4" />
                Setoran
              </Button>
              <Button type="button" variant={type === "penarikan" ? "default" : "outline"} className="flex-1 gap-2" onClick={() => setType("penarikan")}>
                <ArrowDownRight className="w-4 h-4" />
                Penarikan
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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

              {student && (
                <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                  <p className="text-sm text-muted-foreground">Saldo saat ini</p>
                  <p className="text-xl font-bold text-primary">{formatRupiah(Number(student.balance))}</p>
                  {student.parent_phone && (
                    <p className="text-xs text-muted-foreground mt-1">📱 Notifikasi WA akan dikirim ke {student.parent_phone}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Jumlah (Rp)</Label>
                <Input type="number" placeholder="50000" value={amount} onChange={(e) => setAmount(e.target.value)} min={1} />
              </div>

              <div className="space-y-2">
                <Label>Catatan</Label>
                <Textarea placeholder="Setoran mingguan..." value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={!selectedStudent || !amount || sending}>
                {type === "setoran" ? "Simpan Setoran" : "Proses Penarikan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Transactions;
