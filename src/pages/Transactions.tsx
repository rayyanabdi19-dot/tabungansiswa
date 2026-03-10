import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, Printer } from "lucide-react";
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
import jsPDF from "jspdf";

const printReceipt = (studentData: any, txType: string, amt: number, newBalance: number, note: string) => {
  const doc = new jsPDF({ unit: "mm", format: [80, 150] });
  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const txLabel = txType === "setoran" ? "SETORAN" : "PENARIKAN";

  let y = 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TabunganKu", 40, y, { align: "center" });
  y += 5;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Sistem Tabungan Siswa", 40, y, { align: "center" });
  y += 3;
  doc.text("— Mickro Data 2R —", 40, y, { align: "center" });
  y += 5;
  doc.setFontSize(8);
  doc.text("--------------------------------", 40, y, { align: "center" });
  y += 5;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`BUKTI ${txLabel}`, 40, y, { align: "center" });
  y += 6;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("--------------------------------", 40, y, { align: "center" });
  y += 5;

  const lines = [
    ["Tanggal", `${dateStr}`],
    ["Waktu", timeStr],
    ["Nama", studentData.name],
    ["NIS", studentData.nis],
    ["Kelas", studentData.class],
    ["Jenis", txLabel],
    ["Jumlah", formatRupiah(amt)],
    ["Saldo Akhir", formatRupiah(newBalance)],
  ];
  if (note) lines.push(["Catatan", note]);

  lines.forEach(([label, val]) => {
    doc.setFont("helvetica", "normal");
    doc.text(`${label}`, 5, y);
    doc.text(`: ${val}`, 28, y);
    y += 5;
  });

  y += 2;
  doc.text("--------------------------------", 40, y, { align: "center" });
  y += 5;
  doc.setFontSize(7);
  doc.text("Terima kasih", 40, y, { align: "center" });
  y += 4;
  doc.text("Simpan bukti ini sebagai tanda terima", 40, y, { align: "center" });

  doc.save(`Bukti_${txLabel}_${studentData.nis}_${now.getTime()}.pdf`);
};

const Transactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [type, setType] = useState<"setoran" | "penarikan">("setoran");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [sendWA, setSendWA] = useState(true);

  useEffect(() => {
    supabase.from("students").select("*").order("name").then(({ data }) => setStudents(data || []));
  }, []);

  const student = students.find((s) => s.id === selectedStudent);

  const sendWhatsAppNotification = async (studentData: any, txType: string, amt: number, newBalance: number) => {
    const phone = studentData.parent_phone;
    if (!phone) return;

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

    // Print receipt
    printReceipt(student, type, amt, newBalance, note);

    // Send WhatsApp notification
    if (sendWA && student.parent_phone) {
      await sendWhatsAppNotification(student, type, amt, newBalance);
    }

    // Refresh
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

              {student?.parent_phone && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📱</span>
                    <div>
                      <p className="text-sm font-medium">Kirim Notifikasi WhatsApp</p>
                      <p className="text-xs text-muted-foreground">Ke {student.parent_phone}</p>
                    </div>
                  </div>
                  <Switch checked={sendWA} onCheckedChange={setSendWA} />
                </div>
              )}

              <Button type="submit" className="w-full gap-2" size="lg" disabled={!selectedStudent || !amount || sending}>
                <Printer className="w-4 h-4" />
                {type === "setoran" ? "Simpan & Cetak Bukti" : "Proses & Cetak Bukti"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Transactions;
