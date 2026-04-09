import { PiggyBank, Heart, Shield, Smartphone, Info, Clock, Zap, Wrench, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/AppLayout";
import { APP_VERSION, CHANGELOG, type ChangelogEntry } from "@/lib/appConfig";
import { motion } from "framer-motion";

const typeBadge = (type: ChangelogEntry["type"]) => {
  const map = {
    release: { label: "Rilis", variant: "default" as const },
    hotfix: { label: "Hotfix", variant: "destructive" as const },
    maintenance: { label: "Maintenance", variant: "secondary" as const },
  };
  return map[type];
};

const About = () => {
  return (
    <AppLayout>
      <div className="animate-fade-in max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-heading">Tentang Aplikasi</h1>
          <p className="text-muted-foreground">Informasi tentang TabunganKu</p>
        </div>

        <div className="space-y-6">
          {/* App Info */}
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <PiggyBank className="w-9 h-9 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-heading">TabunganKu</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      v{APP_VERSION}
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                TabunganKu adalah aplikasi tabungan siswa digital yang dirancang untuk membantu sekolah dalam mengelola tabungan siswa secara modern, transparan, dan efisien. Dengan TabunganKu, orang tua dapat memantau saldo dan riwayat transaksi anak secara real-time.
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Shield, title: "Aman & Terpercaya", desc: "Data tabungan tersimpan aman di cloud dengan enkripsi tingkat tinggi." },
              { icon: Smartphone, title: "Bisa Install di HP", desc: "Akses dari browser atau install sebagai aplikasi di smartphone Anda." },
              { icon: Heart, title: "Mudah Digunakan", desc: "Antarmuka sederhana yang bisa digunakan oleh siapa saja." },
              { icon: Info, title: "Transparansi", desc: "Orang tua bisa memantau setiap transaksi setoran dan penarikan." },
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

          {/* Changelog */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Riwayat Pembaruan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {CHANGELOG.map((entry, i) => {
                const badge = typeBadge(entry.type);
                return (
                  <motion.div
                    key={entry.version}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative pl-6 border-l-2 border-border pb-4 last:pb-0"
                  >
                    <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-sm font-heading">v{entry.version}</span>
                      <Badge variant={badge.variant} className="text-[10px] px-1.5 py-0">
                        {badge.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{entry.date}</span>
                    </div>
                    <ul className="space-y-0.5">
                      {entry.changes.map((c, j) => (
                        <li key={j} className="text-sm text-muted-foreground flex items-start gap-1.5">
                          <Zap className="w-3 h-3 text-primary mt-1 shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base font-heading">Kontak & Dukungan</CardTitle>
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
