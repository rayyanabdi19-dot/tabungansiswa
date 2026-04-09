// Centralized app configuration — update this file on every release
export const APP_VERSION = "1.7.0";

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
  type: "release" | "maintenance" | "hotfix";
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.7.0",
    date: "2026-04-09",
    type: "release",
    changes: [
      "Isolasi data per akun admin — setiap admin mengelola data sendiri",
      "Perbaikan alur pendaftaran akun baru",
    ],
  },
  {
    version: "1.6.0",
    date: "2026-04-09",
    type: "release",
    changes: [
      "Halaman Tentang Aplikasi menampilkan changelog otomatis",
      "Notifikasi update & maintenance ditampilkan saat ada versi baru",
      "Desain gradasi ungu-biru-pink dengan glassmorphism",
    ],
  },
  {
    version: "1.5.0",
    date: "2026-04-07",
    type: "release",
    changes: [
      "Dashboard orang tua: ringkasan cicilan & notifikasi real-time",
      "Detail pinjaman aktif di dashboard orang tua",
      "Riwayat cicilan pembayaran",
    ],
  },
  {
    version: "1.4.0",
    date: "2026-04-06",
    type: "release",
    changes: [
      "Export laporan PDF & Excel dengan kop sekolah",
      "Filter per kelas di laporan",
      "Upload logo sekolah",
    ],
  },
  {
    version: "1.3.0",
    date: "2026-04-05",
    type: "release",
    changes: [
      "Grafik statistik tabungan per bulan",
      "Cetak bukti transaksi",
      "Import siswa dari Excel",
    ],
  },
  {
    version: "1.2.0",
    date: "2026-04-04",
    type: "release",
    changes: [
      "Fitur pinjaman siswa",
      "Dark mode toggle",
      "Pencarian siswa di transaksi",
    ],
  },
  {
    version: "1.1.0",
    date: "2026-04-03",
    type: "release",
    changes: [
      "Login orang tua dengan NIS siswa",
      "Aksi update & delete siswa",
      "PWA: bisa di-install di Android & Desktop",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-04-01",
    type: "release",
    changes: [
      "Rilis pertama TabunganKu",
      "Dashboard admin & orang tua",
      "Manajemen siswa & transaksi",
    ],
  },
];

// Maintenance mode config
export const MAINTENANCE = {
  active: false,
  message: "",
  estimatedEnd: "", // ISO date string
};
