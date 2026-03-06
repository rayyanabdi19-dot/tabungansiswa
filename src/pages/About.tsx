import { PiggyBank, Heart, Shield, Smartphone, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";

const About = () => {
  return (
    <AppLayout>
      <div className="animate-fade-in max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Tentang Aplikasi</h1>
          <p className="text-muted-foreground">Informasi tentang TabunganKu</p>
        </div>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <PiggyBank className="w-9 h-9 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">TabunganKu</h2>
                  <p className="text-muted-foreground">Versi 1.0.0</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                TabunganKu adalah aplikasi tabungan siswa digital yang dirancang untuk membantu sekolah dalam mengelola tabungan siswa secara modern, transparan, dan efisien. Dengan TabunganKu, orang tua dapat memantau saldo dan riwayat transaksi anak secara real-time.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: Shield,
                title: "Aman & Terpercaya",
                desc: "Data tabungan tersimpan aman di cloud dengan enkripsi tingkat tinggi.",
              },
              {
                icon: Smartphone,
                title: "Bisa Install di HP",
                desc: "Akses dari browser atau install sebagai aplikasi di smartphone Anda.",
              },
              {
                icon: Heart,
                title: "Mudah Digunakan",
                desc: "Antarmuka sederhana yang bisa digunakan oleh siapa saja.",
              },
              {
                icon: Info,
                title: "Transparansi",
                desc: "Orang tua bisa memantau setiap transaksi setoran dan penarikan.",
              },
            ].map((item) => (
              <Card key={item.title} className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">Kontak & Dukungan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Jika Anda memiliki pertanyaan atau masukan, silakan hubungi kami melalui email di{" "}
                <span className="text-primary font-medium">support@tabunganku.id</span> atau melalui WhatsApp.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default About;
