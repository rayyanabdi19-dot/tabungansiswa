import { useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/components/AppLayout";
import { students, formatRupiah } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

const Transactions = () => {
  const { toast } = useToast();
  const [type, setType] = useState<'setoran' | 'penarikan'>('setoran');
  const [selectedStudent, setSelectedStudent] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudent);
    if (!student) return;

    toast({
      title: type === 'setoran' ? "Setoran Berhasil ✅" : "Penarikan Berhasil ✅",
      description: `${formatRupiah(Number(amount))} untuk ${student.name}`,
    });

    setSelectedStudent("");
    setAmount("");
    setNote("");
  };

  const student = students.find((s) => s.id === selectedStudent);

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Transaksi Baru</h1>
          <p className="text-muted-foreground">Catat setoran atau penarikan tabungan</p>
        </div>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex gap-2 mb-6">
              <Button
                type="button"
                variant={type === 'setoran' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setType('setoran')}
              >
                <ArrowUpRight className="w-4 h-4" />
                Setoran
              </Button>
              <Button
                type="button"
                variant={type === 'penarikan' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setType('penarikan')}
              >
                <ArrowDownRight className="w-4 h-4" />
                Penarikan
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Pilih Siswa</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih siswa..." />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} — {s.class}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {student && (
                <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                  <p className="text-sm text-muted-foreground">Saldo saat ini</p>
                  <p className="text-xl font-bold text-primary">{formatRupiah(student.balance)}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Jumlah (Rp)</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Catatan</Label>
                <Textarea
                  placeholder="Setoran mingguan..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!selectedStudent || !amount}
              >
                {type === 'setoran' ? 'Simpan Setoran' : 'Proses Penarikan'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Transactions;
