import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { School, Save, Upload } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [schoolData, setSchoolData] = useState({
    name: "SD Negeri 1 Sukamaju",
    npsn: "20123456",
    address: "Jl. Pendidikan No. 1, Sukamaju",
    city: "Jakarta",
    province: "DKI Jakarta",
    phone: "021-12345678",
    email: "info@sdn1sukamaju.sch.id",
    principal: "Drs. Ahmad Suryadi, M.Pd",
    logo: "",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profil Sekolah Disimpan ✅",
      description: "Data profil sekolah berhasil diperbarui.",
    });
  };

  const handleChange = (field: string, value: string) => {
    setSchoolData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Pengaturan</h1>
          <p className="text-muted-foreground">Profil sekolah dan konfigurasi aplikasi</p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="w-5 h-5 text-primary" />
              Profil Sekolah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border/50">
                <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
                  <School className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{schoolData.name}</p>
                  <p className="text-sm text-muted-foreground">NPSN: {schoolData.npsn}</p>
                  <Button type="button" variant="outline" size="sm" className="mt-2 gap-1">
                    <Upload className="w-3 h-3" />
                    Upload Logo
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Nama Sekolah</Label>
                  <Input value={schoolData.name} onChange={(e) => handleChange("name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>NPSN</Label>
                  <Input value={schoolData.npsn} onChange={(e) => handleChange("npsn", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Kepala Sekolah</Label>
                  <Input value={schoolData.principal} onChange={(e) => handleChange("principal", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>No. Telepon</Label>
                  <Input value={schoolData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={schoolData.email} onChange={(e) => handleChange("email", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Kota</Label>
                  <Input value={schoolData.city} onChange={(e) => handleChange("city", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Provinsi</Label>
                  <Input value={schoolData.province} onChange={(e) => handleChange("province", e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Alamat Lengkap</Label>
                  <Textarea value={schoolData.address} onChange={(e) => handleChange("address", e.target.value)} rows={2} />
                </div>
              </div>

              <Button type="submit" className="gap-2">
                <Save className="w-4 h-4" />
                Simpan Profil
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Settings;
