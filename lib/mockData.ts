export type Citizen = {
  id: number;
  name: string;
  nik: string;
  address: string;
  status: string;
  phone: string;
};

export type Letter = {
  id: number;
  type: string;
  applicant: string;
  date: string;
  status: "Selesai" | "Proses";
};

export type Iuran = {
  id: number;
  month: string;
  amount: number;
  status: "Lunas" | "Pending";
  date: string;
  citizenId: number;
};

export type IuranType = {
  id: number;
  name: string;
  type: "monthly" | "weekly" | "custom";
  amount: number;
  createdAt: string;
  description?: string;
};

export type IuranPayment = {
  id: number;
  citizenId: number;
  iuranTypeId: number;
  amount: number;
  status: "Lunas" | "Belum";
  date: string;
  notes?: string;
};

export const INITIAL_CITIZENS: Citizen[] = [
  { id: 1, name: "Budi Santoso",  nik: "3201012345670001", address: "Blok A1/10", status: "Tetap",   phone: "628123456789" },
  { id: 2, name: "Siti Aminah",   nik: "3201012345670002", address: "Blok A1/12", status: "Kontrak", phone: "628987654321" },
  { id: 3, name: "Ahmad Fauzi",   nik: "3201012345670003", address: "Blok B2/5",  status: "Tetap",   phone: "628111222333" },
  { id: 4, name: "Dewi Lestari",  nik: "3201012345670004", address: "Blok B2/7",  status: "Tetap",   phone: "628444555666" },
  { id: 5, name: "Rudi Hartono",  nik: "3201012345670005", address: "Blok C3/2",  status: "Kontrak", phone: "628777888999" },
];


  { id: 10, citizenId: 1, iuranTypeId: 3, amount: 20000, status: "Lunas", date: "2025-08-10", notes: "Bayar penuh" },
  { id: 11, citizenId: 2, iuranTypeId: 3, amount: 20000, status: "Belum", date: "2025-08-10", notes: "Belum bayar" },
  { id: 12, citizenId: 3, iuranTypeId: 3, amount: 20000, status: "Lunas", date: "2025-08-12", notes: "Bayar penuh" },
];
