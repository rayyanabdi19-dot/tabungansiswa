import { useState, useEffect } from "react";
import { Search, Plus, Phone, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah } from "@/lib/utils";

const emptyForm = { name: "", nis: "", class: "", parentName: "", parentPhone: "" };

const Students = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      nis: form.nis,
      class: form.class,
      parent_name: form.parentName,
      parent_phone: form.parentPhone,
    };

    if (editingId) {
      const { error } = await supabase.from("students").update(payload).eq("id", editingId);
      if (error) {
        toast({ title: "Gagal", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Data Siswa Diperbarui ✅" });
      }
    } else {
      const { error } = await supabase.from("students").insert(payload);
      if (error) {
        toast({ title: "Gagal", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Siswa Ditambahkan ✅" });
      }
    }

    setForm(emptyForm);
    setEditingId(null);
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

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Data Siswa</h1>
            <p className="text-muted-foreground text-sm">{students.length} siswa terdaftar</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setForm(emptyForm); setEditingId(null); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Tambah Siswa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Siswa" : "Tambah Siswa Baru"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama siswa" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>NIS</Label>
                    <Input value={form.nis} onChange={(e) => setForm({ ...form, nis: e.target.value })} placeholder="2024007" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Kelas</Label>
                    <Input value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} placeholder="6A" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nama Orang Tua</Label>
                  <Input value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} placeholder="Nama orang tua" />
                </div>
                <div className="space-y-2">
                  <Label>No. HP Orang Tua</Label>
                  <Input value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} placeholder="081234567890" />
                </div>
                <Button type="submit" className="w-full">{editingId ? "Perbarui" : "Simpan"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari nama, NIS, atau kelas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-8 animate-pulse">Memuat data siswa...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((student) => (
              <Card key={student.id} className="glass-card hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {getInitials(student.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">NIS: {student.nis} · Kelas {student.class}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Phone className="w-3 h-3" />
                        {student.parent_phone || "-"}
                      </div>
                      <p className="text-lg font-bold text-primary mt-2">{formatRupiah(Number(student.balance))}</p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(student)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(student.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8 col-span-full">Tidak ada siswa ditemukan</p>
            )}
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Siswa?</AlertDialogTitle>
              <AlertDialogDescription>
                Data siswa akan dihapus secara permanen termasuk riwayat transaksi terkait. Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
