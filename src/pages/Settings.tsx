import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { School, Save, Moon, Sun } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggleDarkMode = (checked: boolean) => {
    setIsDark(checked);
    document.documentElement.classList.toggle("dark", checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);
  const [schoolData, setSchoolData] = useState({
    id: "",
    name: "",
    npsn: "",
    address: "",
    city: "",
    province: "",
    phone: "",
    email: "",
    principal: "",
  });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("school_settings").select("*").limit(1).single();
      if (data) {
        setSchoolData({
          id: data.id,
          name: data.name || "",
          npsn: data.npsn || "",
          address: data.address || "",
          city: data.city || "",
          province: data.province || "",
          phone: data.phone || "",
          email: data.email || "",
          principal: data.principal || "",
        });
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: schoolData.name,
      npsn: schoolData.npsn,
      address: schoolData.address,
      city: schoolData.city,
      province: schoolData.province,
      phone: schoolData.phone,
      email: schoolData.email,
      principal: schoolData.principal,
      updated_at: new Date().toISOString(),
    };

    if (schoolData.id) {
      await supabase.from("school_settings").update(payload).eq("id", schoolData.id);
    } else {
      const { data } = await supabase.from("school_settings").insert(payload).select().single();
      if (data) setSchoolData(prev => ({ ...prev, id: data.id }));
    }

    toast({ title: "Profil Sekolah Disimpan ✅" });
  };

  const handleChange = (field: string, value: string) => {
    setSchoolData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-3xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold">Pengaturan</h1>
          <p className="text-muted-foreground text-sm">Profil sekolah dan konfigurasi aplikasi</p>
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
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <School className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{schoolData.name || "Nama Sekolah"}</p>
                  <p className="text-sm text-muted-foreground">NPSN: {schoolData.npsn || "-"}</p>
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

        <Card className="glass-card mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isDark ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
              Tampilan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mode Gelap</p>
                <p className="text-sm text-muted-foreground">Aktifkan tampilan gelap untuk kenyamanan mata</p>
              </div>
              <Switch checked={isDark} onCheckedChange={toggleDarkMode} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Settings;
