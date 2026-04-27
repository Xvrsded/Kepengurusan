import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  type Citizen,
  INITIAL_CITIZENS,
  INITIAL_IURAN,
  INITIAL_LETTERS,
  type Iuran,
  type Letter,
} from "../lib/mockData";

export type AppRole = "admin" | "warga";

export type NotificationType = "iuran" | "surat" | "info" | "warning";

export type ToastVariant = "info" | "success" | "warning";

export type AppToast = {
  title?: string;
  message: string;
  variant?: ToastVariant;
  role?: AppRole | null;
};

export type AppNotification = {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
};

export type UserProfile = {
  name: string;
  nik: string;
  address: string;
  phone: string;
  role: AppRole;
};

export type RegisteredAccount = UserProfile & {
  id: number;
  pin: string;
};

export type SecuritySettings = {
  pin: string;
  biometricEnabled: boolean;
  appLockEnabled: boolean;
  loginAlertsEnabled: boolean;
  twoFactorEnabled: boolean;
  trustedDeviceName: string;
  lastPinChangedAt: string;
  activeSessions: number;
};

const createNotification = (
  id: number,
  title: string,
  message: string,
  type: NotificationType,
  createdAt: string
): AppNotification => ({
  id,
  title,
  message,
  type,
  isRead: false,
  createdAt,
});

const createPendingIuranNotifications = (items: Iuran[]): AppNotification[] =>
  items
    .filter((item) => item.status === "Pending")
    .map((item) =>
      createNotification(
        1000 + item.id,
        "Iuran Belum Dibayar",
        `Anda belum membayar iuran ${item.month}.`,
        "iuran",
        item.date === "-" ? new Date().toISOString() : item.date
      )
    );

const initialCitizen = INITIAL_CITIZENS[0];
const INITIAL_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 1,
    name: initialCitizen?.name ?? "Budi Santoso",
    nik: initialCitizen?.nik ?? "3201012345670001",
    address: initialCitizen?.address ?? "Blok A1/10",
    phone: initialCitizen?.phone ?? "628123456789",
    role: "warga",
    pin: "123456",
  },
  {
    id: 2,
    name: "Admin RW",
    nik: "3175090909090001",
    address: "Kantor RW 05",
    phone: "628111111111",
    role: "admin",
    pin: "654321",
  },
];

export type AppStore = {
  role: AppRole | null;
  isLoggedIn: boolean;
  hasHydrated: boolean;
  currentAccountId: number | null;
  lastSelectedAccountId: number | null;
  accounts: RegisteredAccount[];
  citizens: Citizen[];
  letters: Letter[];
  iuran: Iuran[];
  notifications: AppNotification[];
  userProfile: UserProfile;
  securitySettings: SecuritySettings;
  notifMessage: AppToast | null;
  showNotification: boolean;
  aiResult: string;
  isAiLoading: boolean;
  isTtsLoading: boolean;
  login: (accountId: number, pin: string) => { success: boolean; message: string; role?: AppRole };
  registerAccount: (account: Omit<RegisteredAccount, "id">) => { success: boolean; message: string };
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
  setLastSelectedAccountId: (accountId: number | null) => void;
  setNotif: (payload: string | AppToast) => void;
  clearNotif: () => void;
  addNotification: (notification: Omit<AppNotification, "id" | "isRead" | "createdAt"> & Partial<Pick<AppNotification, "id" | "isRead" | "createdAt">>) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  updateSecuritySettings: (data: Partial<Omit<SecuritySettings, "pin" | "lastPinChangedAt" | "activeSessions">>) => void;
  changePin: (currentPin: string, newPin: string) => { success: boolean; message: string };
  logoutOtherSessions: () => void;
  setAiResult: (result: string) => void;
  setIsAiLoading: (v: boolean) => void;
  setIsTtsLoading: (v: boolean) => void;
  requestLetter: (type: string) => { success: boolean; message: string };
  payIuran: (id: number) => { success: boolean; message: string };
  updateIuranStatus: (id: number, status: Iuran["status"]) => { success: boolean; message: string };
  updateLetters: (letters: Letter[]) => void;
  updateIuran: (iuran: Iuran[]) => void;
  updateLetterStatus: (id: number, status: Letter["status"]) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set: (partial: Partial<AppStore> | ((state: AppStore) => Partial<AppStore>)) => void) => ({
    role: null,
    isLoggedIn: false,
    hasHydrated: false,
    currentAccountId: null,
    lastSelectedAccountId: INITIAL_ACCOUNTS[0]?.id ?? null,
    accounts: [...INITIAL_ACCOUNTS],
    citizens: [...INITIAL_CITIZENS],
    letters: [...INITIAL_LETTERS],
    iuran: [...INITIAL_IURAN],
    notifications: createPendingIuranNotifications(INITIAL_IURAN),
    userProfile: {
      name: initialCitizen?.name ?? "",
      nik: initialCitizen?.nik ?? "",
      address: initialCitizen?.address ?? "",
      phone: initialCitizen?.phone ?? "",
      role: "warga",
    },
    securitySettings: {
      pin: "123456",
      biometricEnabled: false,
      appLockEnabled: true,
      loginAlertsEnabled: true,
      twoFactorEnabled: false,
      trustedDeviceName: "OPPO Reno Warga",
      lastPinChangedAt: "2026-04-01 09:00",
      activeSessions: 2,
    },
    notifMessage: null,
    showNotification: false,
    aiResult: "",
    isAiLoading: false,
    isTtsLoading: false,
    setHasHydrated: (value: boolean) => set({ hasHydrated: value }),
    setLastSelectedAccountId: (accountId: number | null) => set({ lastSelectedAccountId: accountId }),
    clearNotif: () => set({ notifMessage: null, showNotification: false }),
    login: (accountId: number, pin: string) => {
      let result: { success: boolean; message: string; role?: AppRole } = {
        success: false,
        message: "Akun tidak ditemukan.",
      };

      set((state: AppStore) => {
        const account = state.accounts.find(
          (item) => item.id === accountId && item.pin === pin
        );

        if (!account) {
          result = {
            success: false,
            message: "Akun terpilih atau PIN tidak sesuai.",
          };
          return {};
        }

        result = {
          success: true,
          message: "Login berhasil.",
          role: account.role,
        };

        return {
          role: account.role,
          isLoggedIn: true,
          currentAccountId: account.id,
          lastSelectedAccountId: account.id,
          userProfile: {
            name: account.name,
            nik: account.nik,
            address: account.address,
            phone: account.phone,
            role: account.role,
          },
          securitySettings: {
            ...state.securitySettings,
            pin: account.pin,
            activeSessions: Math.max(state.securitySettings.activeSessions, 1),
          },
        };
      });

      return result;
    },
    registerAccount: (account) => {
      let result = { success: false, message: "Registrasi gagal." };

      set((state: AppStore) => {
        const normalizedNik = account.nik.trim();
        const normalizedPhone = account.phone.trim();

        if (account.role !== "warga") {
          result = { success: false, message: "Registrasi mandiri hanya tersedia untuk akun warga." };
          return {};
        }

        if (!/^\d{6}$/.test(account.pin)) {
          result = { success: false, message: "PIN harus terdiri dari 6 digit angka." };
          return {};
        }

        if (state.accounts.some((item) => item.nik === normalizedNik)) {
          result = { success: false, message: "NIK sudah terdaftar." };
          return {};
        }

        if (state.accounts.some((item) => item.phone === normalizedPhone)) {
          result = { success: false, message: "Nomor HP sudah terdaftar." };
          return {};
        }

        const nextAccount: RegisteredAccount = {
          id: Date.now(),
          ...account,
          nik: normalizedNik,
          phone: normalizedPhone,
        };

        const nextCitizens =
          nextAccount.role === "warga"
            ? [
                ...state.citizens,
                {
                  id: state.citizens.length + 1,
                  name: nextAccount.name,
                  nik: nextAccount.nik,
                  address: nextAccount.address,
                  status: "Tetap",
                  phone: nextAccount.phone,
                },
              ]
            : state.citizens;

        result = { success: true, message: "Akun berhasil didaftarkan. Silakan masuk." };

        return {
          accounts: [...state.accounts, nextAccount],
          lastSelectedAccountId: nextAccount.id,
          citizens: nextCitizens,
        };
      });

      return result;
    },
    logout: () =>
      set({
        role: null,
        isLoggedIn: false,
        currentAccountId: null,
        notifMessage: null,
        showNotification: false,
        aiResult: "",
      }),
    setNotif: (payload: string | AppToast) =>
      set({
        notifMessage: typeof payload === "string" ? { message: payload } : payload,
        showNotification: Boolean(typeof payload === "string" ? payload : payload.message),
      }),
    addNotification: (notification) =>
      set((state: AppStore) => ({
        notifications: [
          {
            id: notification.id ?? Date.now(),
            title: notification.title,
            message: notification.message,
            type: notification.type,
            isRead: notification.isRead ?? false,
            createdAt: notification.createdAt ?? new Date().toISOString(),
          },
          ...state.notifications,
        ],
      })),
    markAsRead: (id: number) =>
      set((state: AppStore) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification
        ),
      })),
    markAllAsRead: () =>
      set((state: AppStore) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      })),
    clearNotifications: () => set({ notifications: [] }),
    updateProfile: (data: Partial<UserProfile>) =>
      set((state: AppStore) => ({
        accounts: state.accounts.map((account) =>
          account.id === state.currentAccountId
            ? {
                ...account,
                name: data.name ?? account.name,
                address: data.address ?? account.address,
                phone: data.phone ?? account.phone,
              }
            : account
        ),
        citizens: state.citizens.map((citizen) =>
          citizen.nik === state.userProfile.nik
            ? {
                ...citizen,
                name: data.name ?? citizen.name,
                address: data.address ?? citizen.address,
                phone: data.phone ?? citizen.phone,
              }
            : citizen
        ),
        userProfile: {
          ...state.userProfile,
          ...data,
        },
      })),
    updateSecuritySettings: (data) =>
      set((state: AppStore) => ({
        securitySettings: {
          ...state.securitySettings,
          ...data,
        },
        notifications: [
          createNotification(
            Date.now(),
            "Keamanan Akun Diperbarui",
            "Pengaturan keamanan akun Anda berhasil diperbarui.",
            "warning",
            new Date().toISOString()
          ),
          ...state.notifications,
        ],
      })),
    changePin: (currentPin: string, newPin: string) => {
      let result = { success: false, message: "PIN lama tidak sesuai." };

      set((state: AppStore) => {
        if (state.securitySettings.pin !== currentPin) {
          result = { success: false, message: "PIN lama tidak sesuai." };
          return {};
        }

        if (!/^\d{6}$/.test(newPin)) {
          result = { success: false, message: "PIN baru harus 6 digit angka." };
          return {};
        }

        if (newPin === currentPin) {
          result = { success: false, message: "PIN baru harus berbeda dari PIN lama." };
          return {};
        }

        result = { success: true, message: "PIN berhasil diperbarui." };

        return {
          securitySettings: {
            ...state.securitySettings,
            pin: newPin,
            lastPinChangedAt: new Date().toLocaleString("id-ID"),
          },
          accounts: state.accounts.map((account) =>
            account.id === state.currentAccountId ? { ...account, pin: newPin } : account
          ),
          notifications: [
            createNotification(
              Date.now(),
              "PIN Berhasil Diubah",
              "PIN keamanan akun Anda baru saja diperbarui.",
              "warning",
              new Date().toISOString()
            ),
            ...state.notifications,
          ],
        };
      });

      return result;
    },
    logoutOtherSessions: () =>
      set((state: AppStore) => ({
        securitySettings: {
          ...state.securitySettings,
          activeSessions: 1,
        },
        notifications: [
          createNotification(
            Date.now(),
            "Sesi Lain Dikeluarkan",
            "Semua sesi lain berhasil dikeluarkan dari akun Anda.",
            "warning",
            new Date().toISOString()
          ),
          ...state.notifications,
        ],
      })),
    setAiResult: (result: string) => set({ aiResult: result }),
    setIsAiLoading: (v: boolean) => set({ isAiLoading: v }),
    setIsTtsLoading: (v: boolean) => set({ isTtsLoading: v }),
    requestLetter: (type: string) => {
      let result = { success: false, message: "Pengajuan surat gagal." };

      set((state: AppStore) => {
        const normalizedType = type.trim();

        if (!normalizedType) {
          result = { success: false, message: "Jenis surat wajib dipilih." };
          return {};
        }

        if (!state.userProfile.name) {
          result = { success: false, message: "Data akun belum lengkap untuk mengajukan surat." };
          return {};
        }

        const nextLetter: Letter = {
          id: Date.now(),
          type: normalizedType,
          applicant: state.userProfile.name,
          date: new Date().toISOString().slice(0, 10),
          status: "Proses",
        };

        result = { success: true, message: `${normalizedType} berhasil diajukan.` };

        return {
          letters: [nextLetter, ...state.letters],
          notifications: [
            createNotification(
              Date.now() + 1,
              "Pengajuan Surat Diterima",
              `${normalizedType} sedang diproses oleh pengurus.`,
              "surat",
              new Date().toISOString()
            ),
            ...state.notifications,
          ],
        };
      });

      return result;
    },
    payIuran: (id: number) => {
      let result = { success: false, message: "Pembayaran iuran gagal." };

      set((state: AppStore) => {
        const currentCitizen = state.citizens.find((citizen) => citizen.nik === state.userProfile.nik);
        const target = state.iuran.find((item) => item.id === id);

        if (!currentCitizen || !target || target.citizenId !== currentCitizen.id) {
          result = { success: false, message: "Tagihan iuran tidak ditemukan untuk akun ini." };
          return {};
        }

        if (target.status === "Lunas") {
          result = { success: false, message: "Iuran ini sudah tercatat lunas." };
          return {};
        }

        const paidDate = new Date().toISOString().slice(0, 10);
        const nextIuran = state.iuran.map((item) =>
          item.id === id ? { ...item, status: "Lunas" as const, date: paidDate } : item
        );

        result = { success: true, message: `Iuran ${target.month} berhasil dibayar.` };

        const pendingNotifications = createPendingIuranNotifications(nextIuran);
        const otherNotifications = state.notifications.filter(
          (notification) => !(notification.type === "iuran" && notification.message.includes(target.month))
        );

        return {
          iuran: nextIuran,
          notifications: [
            createNotification(
              Date.now(),
              "Pembayaran Iuran Berhasil",
              `Pembayaran iuran ${target.month} sudah diterima.`,
              "iuran",
              new Date().toISOString()
            ),
            ...pendingNotifications,
            ...otherNotifications,
          ],
        };
      });

      return result;
    },
    updateIuranStatus: (id: number, status: Iuran["status"]) => {
      let result = { success: false, message: "Status iuran gagal diperbarui." };

      set((state: AppStore) => {
        const target = state.iuran.find((item) => item.id === id);

        if (!target) {
          result = { success: false, message: "Data iuran tidak ditemukan." };
          return {};
        }

        const nextDate = status === "Lunas" ? new Date().toISOString().slice(0, 10) : "-";
        const nextIuran = state.iuran.map((item) =>
          item.id === id ? { ...item, status, date: nextDate } : item
        );

        result = {
          success: true,
          message: status === "Lunas" ? `Iuran ${target.month} ditandai lunas.` : `Iuran ${target.month} ditandai pending.`,
        };

        const pendingNotifications = createPendingIuranNotifications(nextIuran);
        const otherNotifications = state.notifications.filter(
          (notification) => !(notification.type === "iuran" && notification.message.includes(target.month))
        );

        return {
          iuran: nextIuran,
          notifications:
            status === "Lunas"
              ? [
                  createNotification(
                    Date.now(),
                    "Iuran Terkonfirmasi",
                    `Pembayaran iuran ${target.month} telah dikonfirmasi pengurus.`,
                    "iuran",
                    new Date().toISOString()
                  ),
                  ...pendingNotifications,
                  ...otherNotifications,
                ]
              : [...pendingNotifications, ...otherNotifications],
        };
      });

      return result;
    },
    updateLetters: (letters: Letter[]) => set({ letters }),
    updateIuran: (iuran: Iuran[]) =>
      set((state: AppStore) => {
        const pendingNotifications = createPendingIuranNotifications(iuran);
        const existingNonIuranNotifications = state.notifications.filter(
          (notification) => notification.type !== "iuran"
        );

        return {
          iuran,
          notifications: [...pendingNotifications, ...existingNonIuranNotifications],
        };
      }),
    updateLetterStatus: (id: number, status: Letter["status"]) =>
      set((state: AppStore) => {
        const currentLetter = state.letters.find((letter) => letter.id === id);
        const updatedLetters = state.letters.map((letter) =>
          letter.id === id ? { ...letter, status } : letter
        );

        const nextNotifications =
          status === "Selesai" && currentLetter?.status !== "Selesai"
            ? [
                createNotification(
                  Date.now(),
                  "Surat Selesai",
                  "Surat Anda sudah selesai.",
                  "surat",
                  new Date().toISOString()
                ),
                ...state.notifications,
              ]
            : state.notifications;

        return {
          letters: updatedLetters,
          notifications: nextNotifications,
        };
      }),
    }),
    {
      name: "rt-rw-digital-store",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state: AppStore) => ({
        role: state.role,
        isLoggedIn: state.isLoggedIn,
        currentAccountId: state.currentAccountId,
        lastSelectedAccountId: state.lastSelectedAccountId,
        accounts: state.accounts,
        citizens: state.citizens,
        letters: state.letters,
        iuran: state.iuran,
        notifications: state.notifications,
        userProfile: state.userProfile,
        securitySettings: state.securitySettings,
      }),
    }
  )
);
