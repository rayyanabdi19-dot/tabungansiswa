import { useState, useEffect, useMemo } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatRupiah } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Reports = () => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("transactions");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [txRes, stRes, lnRes, schRes] = await Promise.all([
      supabase.from("transactions").select("*, students(name, nis, class, photo_url)").order("created_at", { ascending: false }),
      supabase.from("students").select("*").order("name"),
      supabase.from("loans").select("*, students(name, nis, class, photo_url)").order("created_at", { ascending: false }),
      supabase.from("school_settings").select("*").limit(1).single(),
    ]);
    setTransactions(txRes.data || []);
    setStudents(stRes.data || []);
    setLoans(lnRes.data || []);
    if (schRes.data) setSchool(schRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const classList = useMemo(() => {
    const classes = new Set(students.map(s => s.class));
    return Array.from(classes).sort();
  }, [students]);

  const getFilteredTransactions = () => {
    return transactions.filter((tx) => {
      if (dateFrom && tx.created_at < dateFrom) return false;
      if (dateTo && tx.created_at > dateTo + "T23:59:59") return false;
      if (selectedClass !== "all" && (tx.students as any)?.class !== selectedClass) return false;
      return true;
    });
  };

  const addSchoolHeader = async (doc: any) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    let logoXEnd = 14;

    // Try to add logo
    const logoUrl = (school as any)?.logo_url;
    if (logoUrl) {
      try {
        const response = await fetch(logoUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        const dataUrl: string = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        doc.addImage(dataUrl, "JPEG", 14, 8, 18, 18);
        logoXEnd = 35;
      } catch (e) {
        console.warn("Failed to load logo for PDF", e);
      }
    }

    const textCenter = (pageWidth + logoXEnd - 14) / 2 + 14;
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(school?.name || "Sekolah", textCenter, 16, { align: "center" });
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    const addr = [school?.address, school?.city, school?.province].filter(Boolean).join(", ");
    if (addr) doc.text(addr, textCenter, 22, { align: "center" });
    const contact = [school?.phone ? `Telp: ${school.phone}` : null, school?.email].filter(Boolean).join(" | ");
    if (contact) doc.text(contact, textCenter, 27, { align: "center" });
    if (school?.npsn) doc.text(`NPSN: ${school.npsn}`, textCenter, 32, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(14, 35, pageWidth - 14, 35);
    return 42;
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    const startY = await addSchoolHeader(doc);

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Laporan TabunganKu", 14, startY);
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.text(`Tanggal cetak: ${new Date().toLocaleDateString("id-ID")}`, 14, startY + 6);

    if (reportType === "transactions") {
      const data = getFilteredTransactions();
      const classLabel = selectedClass === "all" ? "Semua Kelas" : `Kelas ${selectedClass}`;
      doc.text(`Laporan Transaksi — ${classLabel} (${data.length} data)`, 14, startY + 12);
      autoTable(doc, {
        startY: startY + 16,
        head: [["No", "Tanggal", "Nama Siswa", "NIS", "Kelas", "Jenis", "Jumlah", "Saldo Setelah"]],
        body: data.map((tx, i) => [
          i + 1,
          new Date(tx.created_at).toLocaleDateString("id-ID"),
          (tx.students as any)?.name || "-",
          (tx.students as any)?.nis || "-",
          (tx.students as any)?.class || "-",
          tx.type === "setoran" ? "Setoran" : "Penarikan",
          formatRupiah(Number(tx.amount)),
          formatRupiah(Number(tx.balance_after)),
        ]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [229, 110, 23] },
      });
    } else if (reportType === "students") {
      doc.text(`Laporan Data Siswa (${students.length} siswa)`, 14, startY + 12);
      autoTable(doc, {
        startY: startY + 16,
        head: [["No", "Nama", "NIS", "Kelas", "Saldo", "Orang Tua", "No. HP"]],
        body: students.map((s, i) => [
          i + 1, s.name, s.nis, s.class,
          formatRupiah(Number(s.balance)),
          s.parent_name || "-", s.parent_phone || "-",
        ]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [229, 110, 23] },
      });
    } else if (reportType === "loans") {
      doc.text(`Laporan Pinjaman (${loans.length} data)`, 14, startY + 12);
      autoTable(doc, {
        startY: startY + 16,
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
        styles: { fontSize: 7 },
        headStyles: { fillColor: [229, 110, 23] },
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
        ["No", "Tanggal", "Nama Siswa", "NIS", "Kelas", "Jenis", "Jumlah", "Saldo Setelah"],
        ...data.map((tx, i) => [
          i + 1,
          new Date(tx.created_at).toLocaleDateString("id-ID"),
          (tx.students as any)?.name || "-",
          (tx.students as any)?.nis || "-",
          (tx.students as any)?.class || "-",
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <Label>Kelas</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kelas</SelectItem>
                        {classList.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                        <th className="text-left px-4 py-2">Kelas</th>
                        <th className="text-left px-4 py-2">Jenis</th>
                        <th className="text-right px-4 py-2">Jumlah</th>
                      </tr>
                    )}
                    {reportType === "students" && (
                      <tr>
                        <th className="text-left px-4 py-2">Siswa</th>
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
                    {reportType === "transactions" && getFilteredTransactions().slice(0, 10).map((tx) => {
                      const st = tx.students as any;
                      return (
                        <tr key={tx.id} className="border-t border-border/50">
                          <td className="px-4 py-2 whitespace-nowrap">{new Date(tx.created_at).toLocaleDateString("id-ID")}</td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                {st?.photo_url ? <AvatarImage src={st.photo_url} alt={st?.name} /> : null}
                                <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary/20 to-accent/20">
                                  {st?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span>{st?.name || "-"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2">{st?.class || "-"}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${tx.type === "setoran" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                              {tx.type === "setoran" ? "Setoran" : "Penarikan"}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right font-medium">{formatRupiah(Number(tx.amount))}</td>
                        </tr>
                      );
                    })}
                    {reportType === "students" && students.slice(0, 10).map((s) => (
                      <tr key={s.id} className="border-t border-border/50">
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              {s.photo_url ? <AvatarImage src={s.photo_url} alt={s.name} /> : null}
                              <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary/20 to-accent/20">
                                {s.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2">{s.nis}</td>
                        <td className="px-4 py-2">{s.class}</td>
                        <td className="px-4 py-2 text-right font-medium">{formatRupiah(Number(s.balance))}</td>
                      </tr>
                    ))}
                    {reportType === "loans" && loans.slice(0, 10).map((l) => {
                      const st = l.students as any;
                      return (
                        <tr key={l.id} className="border-t border-border/50">
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                {st?.photo_url ? <AvatarImage src={st.photo_url} alt={st?.name} /> : null}
                                <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary/20 to-accent/20">
                                  {st?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span>{st?.name || "-"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-right">{formatRupiah(Number(l.amount))}</td>
                          <td className="px-4 py-2 text-right">{formatRupiah(Number(l.remaining))}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${l.status === "active" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
                              {l.status === "active" ? "Aktif" : "Lunas"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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
