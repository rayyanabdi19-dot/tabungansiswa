import { useState, useEffect } from "react";
import { FileSpreadsheet, FileText, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatRupiah } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("transactions");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [txRes, stRes, lnRes] = await Promise.all([
      supabase.from("transactions").select("*, students(name, nis, class)").order("created_at", { ascending: false }),
      supabase.from("students").select("*").order("name"),
      supabase.from("loans").select("*, students(name, nis, class)").order("created_at", { ascending: false }),
    ]);
    setTransactions(txRes.data || []);
    setStudents(stRes.data || []);
    setLoans(lnRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getFilteredTransactions = () => {
    return transactions.filter((tx) => {
      if (dateFrom && tx.created_at < dateFrom) return false;
      if (dateTo && tx.created_at > dateTo + "T23:59:59") return false;
      return true;
    });
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Laporan TabunganKu", 14, 20);
    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, 14, 28);

    if (reportType === "transactions") {
      const data = getFilteredTransactions();
      doc.text(`Laporan Transaksi (${data.length} data)`, 14, 36);
      autoTable(doc, {
        startY: 42,
        head: [["No", "Tanggal", "Nama Siswa", "NIS", "Jenis", "Jumlah", "Saldo Setelah"]],
        body: data.map((tx, i) => [
          i + 1,
          new Date(tx.created_at).toLocaleDateString("id-ID"),
          (tx.students as any)?.name || "-",
          (tx.students as any)?.nis || "-",
          tx.type === "setoran" ? "Setoran" : "Penarikan",
          formatRupiah(Number(tx.amount)),
          formatRupiah(Number(tx.balance_after)),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [26, 122, 76] },
      });
    } else if (reportType === "students") {
      doc.text(`Laporan Data Siswa (${students.length} siswa)`, 14, 36);
      autoTable(doc, {
        startY: 42,
        head: [["No", "Nama", "NIS", "Kelas", "Saldo", "Orang Tua", "No. HP"]],
        body: students.map((s, i) => [
          i + 1, s.name, s.nis, s.class,
          formatRupiah(Number(s.balance)),
          s.parent_name || "-", s.parent_phone || "-",
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [26, 122, 76] },
      });
    } else if (reportType === "loans") {
      doc.text(`Laporan Pinjaman (${loans.length} data)`, 14, 36);
      autoTable(doc, {
        startY: 42,
        head: [["No", "Nama Siswa", "Jumlah", "Sisa", "Status", "Jatuh Tempo", "Catatan"]],
        body: loans.map((l, i) => [
          i + 1,
          (l.students as any)?.name || "-",
          formatRupiah(Number(l.amount)),
          formatRupiah(Number(l.remaining)),
          l.status === "active" ? "Aktif" : "Lunas",
          l.due_date ? new Date(l.due_date).toLocaleDateString("id-ID") : "-",
          l.note || "-",
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [26, 122, 76] },
      });
    }

    doc.save(`laporan-${reportType}-${Date.now()}.pdf`);
    toast({ title: "PDF Berhasil Diunduh ✅" });
  };

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    let wsData: any[][] = [];

    if (reportType === "transactions") {
      const data = getFilteredTransactions();
      wsData = [
        ["No", "Tanggal", "Nama Siswa", "NIS", "Jenis", "Jumlah", "Saldo Setelah"],
        ...data.map((tx, i) => [
          i + 1,
          new Date(tx.created_at).toLocaleDateString("id-ID"),
          (tx.students as any)?.name || "-",
          (tx.students as any)?.nis || "-",
          tx.type === "setoran" ? "Setoran" : "Penarikan",
          Number(tx.amount),
          Number(tx.balance_after),
        ]),
      ];
    } else if (reportType === "students") {
      wsData = [
        ["No", "Nama", "NIS", "Kelas", "Saldo", "Orang Tua", "No. HP"],
        ...students.map((s, i) => [
          i + 1, s.name, s.nis, s.class, Number(s.balance), s.parent_name || "-", s.parent_phone || "-",
        ]),
      ];
    } else if (reportType === "loans") {
      wsData = [
        ["No", "Nama Siswa", "Jumlah", "Sisa", "Status", "Jatuh Tempo", "Catatan"],
        ...loans.map((l, i) => [
          i + 1,
          (l.students as any)?.name || "-",
          Number(l.amount), Number(l.remaining),
          l.status === "active" ? "Aktif" : "Lunas",
          l.due_date ? new Date(l.due_date).toLocaleDateString("id-ID") : "-",
          l.note || "-",
        ]),
      ];
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, `laporan-${reportType}-${Date.now()}.xlsx`);
    toast({ title: "Excel Berhasil Diunduh ✅" });
  };

  const reportLabels: Record<string, string> = {
    transactions: "Transaksi",
    students: "Data Siswa",
    loans: "Pinjaman",
  };

  const totalSaldo = students.reduce((s, st) => s + Number(st.balance), 0);
  const totalSetoran = transactions.filter(t => t.type === "setoran").reduce((s, t) => s + Number(t.amount), 0);
  const totalPenarikan = transactions.filter(t => t.type === "penarikan").reduce((s, t) => s + Number(t.amount), 0);

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold">Laporan</h1>
          <p className="text-muted-foreground text-sm">Unduh laporan dalam format PDF atau Excel</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">Total Saldo Seluruh Siswa</p>
              <p className="text-xl font-bold text-primary">{formatRupiah(totalSaldo)}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">Total Setoran</p>
              <p className="text-xl font-bold text-success">{formatRupiah(totalSetoran)}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">Total Penarikan</p>
              <p className="text-xl font-bold text-warning">{formatRupiah(totalPenarikan)}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Pilih Laporan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Jenis Laporan</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transactions">Transaksi</SelectItem>
                    <SelectItem value="students">Data Siswa</SelectItem>
                    <SelectItem value="loans">Pinjaman</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {reportType === "transactions" && (
                <>
                  <div className="space-y-2">
                    <Label>Dari Tanggal</Label>
                    <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sampai Tanggal</Label>
                    <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={exportPDF} className="gap-2 flex-1" disabled={loading}>
                <FileText className="w-4 h-4" />
                Unduh PDF
              </Button>
              <Button onClick={exportExcel} variant="outline" className="gap-2 flex-1" disabled={loading}>
                <FileSpreadsheet className="w-4 h-4" />
                Unduh Excel
              </Button>
            </div>

            {/* Preview */}
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Preview: {reportLabels[reportType]} ({
                  reportType === "transactions" ? getFilteredTransactions().length :
                  reportType === "students" ? students.length : loans.length
                } data)
              </h3>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    {reportType === "transactions" && (
                      <tr>
                        <th className="text-left px-4 py-2">Tanggal</th>
                        <th className="text-left px-4 py-2">Siswa</th>
                        <th className="text-left px-4 py-2">Jenis</th>
                        <th className="text-right px-4 py-2">Jumlah</th>
                      </tr>
                    )}
                    {reportType === "students" && (
                      <tr>
                        <th className="text-left px-4 py-2">Nama</th>
                        <th className="text-left px-4 py-2">NIS</th>
                        <th className="text-left px-4 py-2">Kelas</th>
                        <th className="text-right px-4 py-2">Saldo</th>
                      </tr>
                    )}
                    {reportType === "loans" && (
                      <tr>
                        <th className="text-left px-4 py-2">Siswa</th>
                        <th className="text-right px-4 py-2">Jumlah</th>
                        <th className="text-right px-4 py-2">Sisa</th>
                        <th className="text-left px-4 py-2">Status</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {reportType === "transactions" && getFilteredTransactions().slice(0, 10).map((tx) => (
                      <tr key={tx.id} className="border-t border-border/50">
                        <td className="px-4 py-2 whitespace-nowrap">{new Date(tx.created_at).toLocaleDateString("id-ID")}</td>
                        <td className="px-4 py-2">{(tx.students as any)?.name || "-"}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${tx.type === "setoran" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                            {tx.type === "setoran" ? "Setoran" : "Penarikan"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right font-medium">{formatRupiah(Number(tx.amount))}</td>
                      </tr>
                    ))}
                    {reportType === "students" && students.slice(0, 10).map((s) => (
                      <tr key={s.id} className="border-t border-border/50">
                        <td className="px-4 py-2">{s.name}</td>
                        <td className="px-4 py-2">{s.nis}</td>
                        <td className="px-4 py-2">{s.class}</td>
                        <td className="px-4 py-2 text-right font-medium">{formatRupiah(Number(s.balance))}</td>
                      </tr>
                    ))}
                    {reportType === "loans" && loans.slice(0, 10).map((l) => (
                      <tr key={l.id} className="border-t border-border/50">
                        <td className="px-4 py-2">{(l.students as any)?.name || "-"}</td>
                        <td className="px-4 py-2 text-right">{formatRupiah(Number(l.amount))}</td>
                        <td className="px-4 py-2 text-right">{formatRupiah(Number(l.remaining))}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${l.status === "active" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
                            {l.status === "active" ? "Aktif" : "Lunas"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Reports;
