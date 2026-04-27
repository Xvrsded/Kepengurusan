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

export const INITIAL_CITIZENS: Citizen[] = [
  { id: 1, name: "Budi Santoso",  nik: "3201012345670001", address: "Blok A1/10", status: "Tetap",   phone: "628123456789" },
  { id: 2, name: "Siti Aminah",   nik: "3201012345670002", address: "Blok A1/12", status: "Kontrak", phone: "628987654321" },
  { id: 3, name: "Ahmad Fauzi",   nik: "3201012345670003", address: "Blok B2/5",  status: "Tetap",   phone: "628111222333" },
  { id: 4, name: "Dewi Lestari",  nik: "3201012345670004", address: "Blok B2/7",  status: "Tetap",   phone: "628444555666" },
  { id: 5, name: "Rudi Hartono",  nik: "3201012345670005", address: "Blok C3/2",  status: "Kontrak", phone: "628777888999" },
];

export const INITIAL_LETTERS: Letter[] = [
  { id: 1, type: "Domisili",          applicant: "Budi Santoso", date: "2025-04-10", status: "Selesai" },
  { id: 2, type: "Pengantar KTP",     applicant: "Siti Aminah",  date: "2025-04-20", status: "Proses"  },
  { id: 3, type: "Keterangan Usaha",  applicant: "Ahmad Fauzi",  date: "2025-04-15", status: "Proses"  },
  { id: 4, type: "Domisili",          applicant: "Dewi Lestari", date: "2025-04-22", status: "Proses"  },
];

export const INITIAL_IURAN: Iuran[] = [
  { id: 1, month: "Oktober 2025",   amount: 50000, status: "Lunas",   date: "2025-10-05", citizenId: 1 },
  { id: 2, month: "Oktober 2025",   amount: 50000, status: "Pending", date: "-",          citizenId: 2 },
  { id: 3, month: "Oktober 2025",   amount: 50000, status: "Lunas",   date: "2025-10-07", citizenId: 3 },
  { id: 4, month: "Oktober 2025",   amount: 50000, status: "Pending", date: "-",          citizenId: 4 },
  { id: 5, month: "September 2025", amount: 50000, status: "Lunas",   date: "2025-09-05", citizenId: 1 },
  { id: 6, month: "September 2025", amount: 50000, status: "Lunas",   date: "2025-09-08", citizenId: 2 },
];
