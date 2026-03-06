export interface Student {
  id: string;
  name: string;
  class: string;
  nis: string;
  parentName: string;
  parentPhone: string;
  balance: number;
  avatarInitial: string;
}

export interface Transaction {
  id: string;
  studentId: string;
  studentName: string;
  type: 'setoran' | 'penarikan';
  amount: number;
  date: string;
  note: string;
  balanceAfter: number;
}

export const students: Student[] = [
  { id: '1', name: 'Ahmad Fauzi', class: '6A', nis: '2024001', parentName: 'Budi Fauzi', parentPhone: '081234567890', balance: 350000, avatarInitial: 'AF' },
  { id: '2', name: 'Siti Nurhaliza', class: '6A', nis: '2024002', parentName: 'Hasan Basri', parentPhone: '081234567891', balance: 520000, avatarInitial: 'SN' },
  { id: '3', name: 'Rizki Pratama', class: '5B', nis: '2024003', parentName: 'Joko Pratama', parentPhone: '081234567892', balance: 175000, avatarInitial: 'RP' },
  { id: '4', name: 'Dewi Anggraeni', class: '5A', nis: '2024004', parentName: 'Slamet Riyadi', parentPhone: '081234567893', balance: 890000, avatarInitial: 'DA' },
  { id: '5', name: 'Muhammad Ilham', class: '4B', nis: '2024005', parentName: 'Andi Wijaya', parentPhone: '081234567894', balance: 230000, avatarInitial: 'MI' },
  { id: '6', name: 'Putri Rahayu', class: '4A', nis: '2024006', parentName: 'Wahyu Rahayu', parentPhone: '081234567895', balance: 415000, avatarInitial: 'PR' },
];

export const transactions: Transaction[] = [
  { id: '1', studentId: '1', studentName: 'Ahmad Fauzi', type: 'setoran', amount: 50000, date: '2026-03-06', note: 'Setoran mingguan', balanceAfter: 350000 },
  { id: '2', studentId: '2', studentName: 'Siti Nurhaliza', type: 'setoran', amount: 100000, date: '2026-03-06', note: 'Setoran bulanan', balanceAfter: 520000 },
  { id: '3', studentId: '3', studentName: 'Rizki Pratama', type: 'penarikan', amount: 25000, date: '2026-03-05', note: 'Kebutuhan sekolah', balanceAfter: 175000 },
  { id: '4', studentId: '4', studentName: 'Dewi Anggraeni', type: 'setoran', amount: 200000, date: '2026-03-05', note: 'Setoran dari orang tua', balanceAfter: 890000 },
  { id: '5', studentId: '1', studentName: 'Ahmad Fauzi', type: 'setoran', amount: 30000, date: '2026-03-04', note: 'Setoran harian', balanceAfter: 300000 },
  { id: '6', studentId: '5', studentName: 'Muhammad Ilham', type: 'penarikan', amount: 50000, date: '2026-03-04', note: 'Penarikan', balanceAfter: 230000 },
  { id: '7', studentId: '6', studentName: 'Putri Rahayu', type: 'setoran', amount: 75000, date: '2026-03-03', note: 'Setoran mingguan', balanceAfter: 415000 },
  { id: '8', studentId: '2', studentName: 'Siti Nurhaliza', type: 'setoran', amount: 50000, date: '2026-03-03', note: 'Setoran tambahan', balanceAfter: 420000 },
];

export const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};
