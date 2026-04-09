import { useState, useEffect, useRef } from "react";
import { Search, Plus, Phone, Pencil, Trash2, Upload, FileSpreadsheet, Camera, User, GraduationCap, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AppLayout from "@/components/AppLayout";
import GlassSkeleton from "@/components/GlassSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { formatRupiah } from "@/lib/utils";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";

const emptyForm = { name: "", nis: "", class: "", parentName: "", parentPhone: "" };

const Students = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const fetchStudents = async () => {
    const { data } = await supabase.from("students").select("*").order("name");
    setStudents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, []);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.includes(search) ||
      s.class.toLowerCase().includes(search.toLowerCase())
  );

  const uploadPhoto = async (studentId: string, file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${studentId}.${ext}`;
    await supabase.storage.from("student-photos").upload(path, file, { upsert: true });
    const { data } = supabase.storage.from("student-photos").getPublicUrl(path);
    return data.publicUrl + "?t=" + Date.now();
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      name: form.name,
      nis: form.nis,
      class: form.class,
      parent_name: form.parentName,
      parent_phone: form.parentPhone,
    };
    if (!editingId) payload.owner_id = user?.id;

    let savedId = editingId;

    if (editingId) {
      const { error } = await supabase.from("students").update(payload).eq("id", editingId);
      if (error) { toast({ title: "Gagal", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Data Siswa Diperbarui ✅" });
    } else {
      const { data, error } = await supabase.from("students").insert(payload).select("id").single();
      if (error) { toast({ title: "Gagal", description: error.message, variant: "destructive" }); return; }
      savedId = data.id;
      toast({ title: "Siswa Ditambahkan ✅" });
    }

    if (photoFile && savedId) {
      setUploadingPhoto(true);
      const url = await uploadPhoto(savedId, photoFile);
      await supabase.from("students").update({ photo_url: url }).eq("id", savedId);
      setUploadingPhoto(false);
    }

    setForm(emptyForm);
    setEditingId(null);
    setPhotoFile(null);
    setPhotoPreview("");
    setDialogOpen(false);
    fetchStudents();
  };

  const handleEdit = (student: any) => {
    setForm({
      name: student.name,
      nis: student.nis,
      class: student.class,
      parentName: student.parent_name || "",
      parentPhone: student.parent_phone || "",
    });
    setPhotoPreview(student.photo_url || "");
    setPhotoFile(null);
    setEditingId(student.id);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("students").delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Gagal Menghapus", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Siswa Dihapus ✅" });
      fetchStudents();
    }
    setDeleteId(null);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);
      if (rows.length === 0) { toast({ title: "File Kosong", variant: "destructive" }); setImporting(false); return; }
      const mapped = rows.map((row) => ({
        name: row["Nama"] || row["nama"] || row["Name"] || row["name"] || "",
        nis: String(row["NIS"] || row["nis"] || row["Nis"] || ""),
        class: String(row["Kelas"] || row["kelas"] || row["Class"] || row["class"] || ""),
        parent_name: row["Nama Orang Tua"] || row["Orang Tua"] || row["parent_name"] || "",
        parent_phone: String(row["No HP"] || row["HP"] || row["Phone"] || row["parent_phone"] || row["No. HP Orang Tua"] || ""),
        owner_id: user?.id,
      })).filter((r) => r.name && r.nis);
      if (mapped.length === 0) { toast({ title: "Format Salah", variant: "destructive" }); setImporting(false); return; }
      const { error } = await supabase.from("students").insert(mapped);
      if (error) { toast({ title: "Gagal Import", description: error.message, variant: "destructive" }); }
      else { toast({ title: `${mapped.length} Siswa Berhasil Diimport ✅` }); fetchStudents(); }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Nama", "NIS", "Kelas", "Nama Orang Tua", "No HP"],
      ["Contoh Siswa", "20240001", "6A", "Nama Orang Tua", "081234567890"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Siswa");
    XLSX.writeFile(wb, "Template_Import_Siswa.xlsx");
  };

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const uniqueClasses = [...new Set(students.map(s => s.class))].sort();
  const totalBalance = students.reduce((sum, s) => sum + Number(s.balance), 0);

  return (
    <AppLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-heading">Data Siswa</h1>
            <p className="text-muted-foreground text-sm">{students.length} siswa terdaftar</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={downloadTemplate}>
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Template</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={() => fileInputRef.current?.click()} disabled={importing}>
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">{importing ? "Mengimport..." : "Import"}</span>
            </Button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportExcel} />
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setForm(emptyForm); setEditingId(null); setPhotoFile(null); setPhotoPreview(""); } }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 rounded-xl gradient-bg border-0 text-white shadow-lg shadow-primary/25">
                  <Plus className="w-4 h-4" />
                  Tambah
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-heading">{editingId ? "Edit Siswa" : "Tambah Siswa Baru"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                  {/* Photo upload */}
                  <div className="flex justify-center">
                    <div className="relative group cursor-pointer" onClick={() => photoInputRef.current?.click()}>
                      <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-lg">
                        <AvatarImage src={photoPreview} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                          {form.name ? getInitials(form.name) : <User className="w-8 h-8" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nama Lengkap</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama siswa" required className="rounded-xl h-11" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>NIS</Label>
                      <Input value={form.nis} onChange={(e) => setForm({ ...form, nis: e.target.value })} placeholder="2024007" required className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label>Kelas</Label>
                      <Input value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} placeholder="6A" required className="rounded-xl h-11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Nama Orang Tua</Label>
                    <Input value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} placeholder="Nama orang tua" className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>No. HP Orang Tua</Label>
                    <Input value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} placeholder="081234567890" className="rounded-xl h-11" />
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl gradient-bg border-0 text-white font-semibold shadow-lg shadow-primary/25" disabled={uploadingPhoto}>
                    {uploadingPhoto ? "Mengupload foto..." : editingId ? "Perbarui" : "Simpan"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Siswa", value: students.length, icon: User, color: "text-primary" },
            { label: "Total Kelas", value: uniqueClasses.length, icon: GraduationCap, color: "text-accent" },
            { label: "Total Saldo", value: formatRupiah(totalBalance), icon: Wallet, color: "text-primary" },
            { label: "Rata-rata", value: students.length ? formatRupiah(Math.round(totalBalance / students.length)) : "Rp 0", icon: Wallet, color: "text-accent" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-primary/10`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                      <p className="font-bold text-sm truncate">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari nama, NIS, atau kelas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-xl h-11 glass-card border-border/40" />
        </div>

        {/* Student grid */}
        {loading ? (
          <GlassSkeleton type="card" count={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((student, i) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                <Card className="glass-card hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-14 h-14 border-2 border-primary/15 shadow-md shrink-0">
                        <AvatarImage src={student.photo_url || undefined} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold text-base">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate text-sm">{student.name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" className="text-[10px] px-2 py-0 rounded-full">
                            NIS: {student.nis}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-2 py-0 rounded-full">
                            {student.class}
                          </Badge>
                        </div>
                        {student.parent_phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                            <Phone className="w-3 h-3" />
                            <span className="truncate">{student.parent_phone}</span>
                          </div>
                        )}
                        <p className="text-base font-bold text-primary mt-2">{formatRupiah(Number(student.balance))}</p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10" onClick={() => handleEdit(student)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(student.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-primary/50" />
                </div>
                <p className="text-muted-foreground font-medium">Tidak ada siswa ditemukan</p>
                <p className="text-xs text-muted-foreground mt-1">Coba ubah kata kunci pencarian</p>
              </div>
            )}
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent className="glass-card">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-heading">Hapus Siswa?</AlertDialogTitle>
              <AlertDialogDescription>
                Data siswa akan dihapus secara permanen termasuk riwayat transaksi terkait. Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default Students;
