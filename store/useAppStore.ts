import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { type User } from "@supabase/supabase-js";

import { supabase } from "../lib/supabaseClient";


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
  role: AppRole | null;
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
        lastSelectedAccountId: null,
        accounts: [],
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
  iuranTypes: IuranType[];
  iuranPayments: IuranPayment[];
  notifications: AppNotification[];
  loadingCitizens: boolean;
  loadingLetters: boolean;
  loadingIuran: boolean;
  loadingIuranTypes: boolean;
  loadingIuranPayments: boolean;
  loadingNotifications: boolean;
  userProfile: UserProfile;
  securitySettings: SecuritySettings;
  notifMessage: AppToast | null;
  showNotification: boolean;
  aiResult: string;
  isAiLoading: boolean;
  isTtsLoading: boolean;
  supabaseUser: User | null;
  login: (accountId: number, pin: string) => { success: boolean; message: string; role?: AppRole | null };
  registerAccount: (account: Omit<RegisteredAccount, "id">) => { success: boolean; message: string };
  logout: () => Promise<void>;
  setSupabaseUser: (user: User | null) => void;
  syncSupabaseUser: () => Promise<void>;
  setHasHydrated: (value: boolean) => void;
  setLastSelectedAccountId: (accountId: number | null) => void;
  fetchCitizens: () => Promise<void>;
  fetchLetters: () => Promise<void>;
  fetchIuran: () => Promise<void>;
  fetchIuranTypes: () => Promise<void>;
  fetchIuranPayments: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  refreshData: () => Promise<void>;
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
  requestLetter: (type: string) => Promise<{ success: boolean; message: string }>;
  payIuran: (id: number) => Promise<{ success: boolean; message: string }>;
  updateIuranStatus: (id: number, status: Iuran["status"]) => Promise<{ success: boolean; message: string }>;
  updateLetters: (letters: Letter[]) => void;
  updateIuran: (iuran: Iuran[]) => void;
  updateLetterStatus: (id: number, status: Letter["status"]) => Promise<void>;
  addIuranType: (type: Omit<IuranType, "id" | "createdAt">) => Promise<{ success: boolean; message: string }>;
  updateIuranType: (id: number, data: Partial<Omit<IuranType, "id" | "createdAt">>) => Promise<{ success: boolean; message: string }>;
  deleteIuranType: (id: number) => Promise<{ success: boolean; message: string }>;
  addIuranPayment: (payment: Omit<IuranPayment, "id">) => Promise<{ success: boolean; message: string }>;
  updateIuranPayment: (id: number, data: Partial<IuranPayment>) => Promise<{ success: boolean; message: string }>;
  deleteIuranPayment: (id: number) => Promise<{ success: boolean; message: string }>;
  payIuranPayment: (id: number) => Promise<{ success: boolean; message: string }>;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
    role: null,
    isLoggedIn: false,
    hasHydrated: false,
    currentAccountId: null,
    lastSelectedAccountId: null,
    accounts: [],
    citizens: [],
    letters: [],
    iuran: [],
    iuranTypes: [],
    iuranPayments: [],
    notifications: [],
    loadingCitizens: false,
    loadingLetters: false,
    loadingIuran: false,
    loadingIuranTypes: false,
    loadingIuranPayments: false,
    loadingNotifications: false,
    userProfile: {
      name: "",
      nik: "",
      address: "",
      phone: "",
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
    supabaseUser: null,
    setHasHydrated: (value: boolean) => set({ hasHydrated: value }),
    setLastSelectedAccountId: (accountId: number | null) => set({ lastSelectedAccountId: accountId }),

    fetchCitizens: async () => {
      set({ loadingCitizens: true });
      try {
        const { data, error } = await supabase.from("citizens").select("*").order("id", { ascending: true });
        if (error) throw error;
        set({ citizens: (data as Citizen[]) ?? [], loadingCitizens: false });
      } catch {
        set({ loadingCitizens: false });
      }
    },

    fetchLetters: async () => {
      set({ loadingLetters: true });
      try {
        const { data, error } = await supabase.from("letters").select("*").order("date", { ascending: false });
        if (error) throw error;
        set({ letters: (data as Letter[]) ?? [], loadingLetters: false });
      } catch {
        set({ loadingLetters: false });
      }
    },

    fetchIuran: async () => {
      set({ loadingIuran: true });
      try {
        const { data, error } = await supabase.from("iuran").select("*").order("id", { ascending: true });
        if (error) throw error;
        set({ iuran: (data as Iuran[]) ?? [], loadingIuran: false });
      } catch {
        set({ loadingIuran: false });
      }
    },

    fetchIuranTypes: async () => {
      set({ loadingIuranTypes: true });
      try {
        const { data, error } = await supabase.from("iuran_types").select("*").order("created_at", { ascending: true });
        if (error) throw error;
        set({ iuranTypes: (data as IuranType[]) ?? [], loadingIuranTypes: false });
      } catch {
        set({ loadingIuranTypes: false });
      }
    },

    fetchIuranPayments: async () => {
      set({ loadingIuranPayments: true });
      try {
        const { data, error } = await supabase.from("iuran_payments").select("*").order("id", { ascending: true });
        if (error) throw error;
        set({ iuranPayments: (data as IuranPayment[]) ?? [], loadingIuranPayments: false });
      } catch {
        set({ loadingIuranPayments: false });
      }
    },

    fetchNotifications: async () => {
      set({ loadingNotifications: true });
      try {
        const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        set({ notifications: (data as AppNotification[]) ?? [], loadingNotifications: false });
      } catch {
        set({ loadingNotifications: false });
      }
    },

    refreshData: async () => {
      // Individual fetches are exposed as store actions; pages can call them directly
      // This placeholder avoids circular ref at init time
    },

    clearNotif: () => set({ notifMessage: null, showNotification: false }),
    login: (accountId: number, pin: string) => {
      let result: { success: boolean; message: string; role?: AppRole | null } = {
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
    logout: async () => {
      await supabase.auth.signOut().catch(() => {});
      set({
        role: null,
        isLoggedIn: false,
        currentAccountId: null,
        notifMessage: null,
        showNotification: false,
        aiResult: "",
        supabaseUser: null,
        userProfile: { name: "", nik: "", address: "", phone: "", role: null },
      });
    },
    setSupabaseUser: (user: User | null) => {
      if (!user) {
        set({ supabaseUser: null, isLoggedIn: false, role: null });
        return;
      }
      const metadata = user.user_metadata ?? {};
      set({
        supabaseUser: user,
        isLoggedIn: true,
        role: (metadata.role as AppRole) ?? "warga",
        userProfile: {
          name: metadata.name ?? user.email ?? "",
          nik: metadata.nik ?? "",
          address: metadata.address ?? "",
          phone: metadata.phone ?? "",
          role: (metadata.role as AppRole) ?? "warga",
        },
      });
    },
    syncSupabaseUser: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ supabaseUser: null, isLoggedIn: false, role: null });
        return;
      }

      const { data: citizen, error } = await supabase
        .from("citizens")
        .select("name, phone, role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Gagal fetch citizens:", error.message);
      }

      const role = (citizen?.role as AppRole) ?? "warga";

      set({
        supabaseUser: user,
        isLoggedIn: true,
        role,
        userProfile: {
          name: citizen?.name ?? user.email ?? "",
          nik: "",
          address: "",
          phone: citizen?.phone ?? "",
          role,
        },
      });
    },
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
    requestLetter: async (type: string) => {
      let result = { success: false, message: "Pengajuan surat gagal." };

      const normalizedType = type.trim();
      if (!normalizedType) {
        return { success: false, message: "Jenis surat wajib dipilih." };
      }

      const { userProfile, letters } = get();
      if (!userProfile.name) {
        return { success: false, message: "Data akun belum lengkap untuk mengajukan surat." };
      }

      const nextLetter: Omit<Letter, "id"> = {
        type: normalizedType,
        applicant: userProfile.name,
        date: new Date().toISOString().slice(0, 10),
        status: "Proses",
      };

      try {
        const { data, error } = await supabase.from("letters").insert(nextLetter).select().single();
        if (error) throw error;

        const inserted = data as Letter;
        set({
          letters: [inserted, ...letters],
          notifications: [
            createNotification(
              Date.now() + 1,
              "Pengajuan Surat Diterima",
              `${normalizedType} sedang diproses oleh pengurus.`,
              "surat",
              new Date().toISOString()
            ),
            ...get().notifications,
          ],
        });
        result = { success: true, message: `${normalizedType} berhasil diajukan.` };
      } catch {
        result = { success: false, message: "Gagal menyimpan pengajuan surat ke server." };
      }

      return result;
    },
    payIuran: async (id: number) => {
      let result = { success: false, message: "Pembayaran iuran gagal." };

      const state = get();
      const currentCitizen = state.citizens.find((citizen) => citizen.nik === state.userProfile.nik);
      const target = state.iuran.find((item) => item.id === id);

      if (!currentCitizen || !target || target.citizenId !== currentCitizen.id) {
        return { success: false, message: "Tagihan iuran tidak ditemukan untuk akun ini." };
      }

      if (target.status === "Lunas") {
        return { success: false, message: "Iuran ini sudah tercatat lunas." };
      }

      const paidDate = new Date().toISOString().slice(0, 10);
      try {
        const { error } = await supabase.from("iuran").update({ status: "Lunas", date: paidDate }).eq("id", id);
        if (error) throw error;

        const nextIuran = state.iuran.map((item) =>
          item.id === id ? { ...item, status: "Lunas" as const, date: paidDate } : item
        );

        const pendingNotifications = createPendingIuranNotifications(nextIuran);
        const otherNotifications = state.notifications.filter(
          (notification) => !(notification.type === "iuran" && notification.message.includes(target.month))
        );

        set({
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
        });
        result = { success: true, message: `Iuran ${target.month} berhasil dibayar.` };
      } catch {
        result = { success: false, message: "Gagal memperbarui status iuran di server." };
      }

      return result;
    },
    updateIuranStatus: async (id: number, status: Iuran["status"]) => {
      let result = { success: false, message: "Status iuran gagal diperbarui." };

      const state = get();
      const target = state.iuran.find((item) => item.id === id);

      if (!target) {
        return { success: false, message: "Data iuran tidak ditemukan." };
      }

      const nextDate = status === "Lunas" ? new Date().toISOString().slice(0, 10) : "-";
      try {
        const { error } = await supabase.from("iuran").update({ status, date: nextDate }).eq("id", id);
        if (error) throw error;

        const nextIuran = state.iuran.map((item) =>
          item.id === id ? { ...item, status, date: nextDate } : item
        );

        const pendingNotifications = createPendingIuranNotifications(nextIuran);
        const otherNotifications = state.notifications.filter(
          (notification) => !(notification.type === "iuran" && notification.message.includes(target.month))
        );

        set({
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
        });
        result = {
          success: true,
          message: status === "Lunas" ? `Iuran ${target.month} ditandai lunas.` : `Iuran ${target.month} ditandai pending.`,
        };
      } catch {
        result = { success: false, message: "Gagal memperbarui status iuran di server." };
      }

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
    updateLetterStatus: async (id: number, status: Letter["status"]) => {
      const state = get();
      const currentLetter = state.letters.find((letter) => letter.id === id);
      if (!currentLetter) return;

      try {
        const { error } = await supabase.from("letters").update({ status }).eq("id", id);
        if (error) throw error;

        const updatedLetters = state.letters.map((letter) =>
          letter.id === id ? { ...letter, status } : letter
        );

        const nextNotifications =
          status === "Selesai" && currentLetter.status !== "Selesai"
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

        set({
          letters: updatedLetters,
          notifications: nextNotifications,
        });
      } catch {
        // silently fail - UI can show generic error
      }
    },
    addIuranType: async (type) => {
      let result = { success: false, message: "Gagal menambah jenis iuran." };

      if (!type.name.trim()) {
        return { success: false, message: "Nama jenis iuran wajib diisi." };
      }
      if (type.amount <= 0) {
        return { success: false, message: "Nominal harus lebih dari 0." };
      }

      const state = get();
      const newType: Omit<IuranType, "id"> = {
        name: type.name.trim(),
        type: type.type,
        amount: type.amount,
        createdAt: new Date().toISOString().slice(0, 10),
        description: type.description,
      };

      try {
        const { data, error } = await supabase.from("iuran_types").insert(newType).select().single();
        if (error) throw error;

        const inserted = data as IuranType;
        result = { success: true, message: `Jenis iuran ${inserted.name} berhasil ditambahkan.` };
        set({ iuranTypes: [...state.iuranTypes, inserted] });
      } catch {
        result = { success: false, message: "Gagal menyimpan jenis iuran ke server." };
      }

      return result;
    },
    updateIuranType: async (id, data) => {
      let result = { success: false, message: "Gagal memperbarui jenis iuran." };

      const state = get();
      const target = state.iuranTypes.find((t) => t.id === id);
      if (!target) {
        return { success: false, message: "Jenis iuran tidak ditemukan." };
      }

      const payload = {
        name: data.name?.trim() ?? target.name,
        type: data.type ?? target.type,
        amount: data.amount ?? target.amount,
        description: data.description ?? target.description,
      };

      try {
        const { error } = await supabase.from("iuran_types").update(payload).eq("id", id);
        if (error) throw error;

        const updated = state.iuranTypes.map((t) =>
          t.id === id
            ? { ...t, ...payload }
            : t
        );
        set({ iuranTypes: updated });
        result = { success: true, message: `Jenis iuran ${target.name} berhasil diperbarui.` };
      } catch {
        result = { success: false, message: "Gagal memperbarui jenis iuran di server." };
      }

      return result;
    },
    deleteIuranType: async (id) => {
      let result = { success: false, message: "Gagal menghapus jenis iuran." };

      const state = get();
      const target = state.iuranTypes.find((t) => t.id === id);
      if (!target) {
        return { success: false, message: "Jenis iuran tidak ditemukan." };
      }

      const hasPayments = state.iuranPayments.some((p) => p.iuranTypeId === id);
      if (hasPayments) {
        return { success: false, message: "Tidak dapat menghapus jenis iuran yang sudah memiliki pembayaran." };
      }

      try {
        const { error } = await supabase.from("iuran_types").delete().eq("id", id);
        if (error) throw error;

        set({ iuranTypes: state.iuranTypes.filter((t) => t.id !== id) });
        result = { success: true, message: `Jenis iuran ${target.name} berhasil dihapus.` };
      } catch {
        result = { success: false, message: "Gagal menghapus jenis iuran di server." };
      }

      return result;
    },
    addIuranPayment: async (payment) => {
      let result = { success: false, message: "Gagal menambah pembayaran iuran." };

      const state = get();
      const newPayment: Omit<IuranPayment, "id"> = {
        ...payment,
      };

      try {
        const { data, error } = await supabase.from("iuran_payments").insert(newPayment).select().single();
        if (error) throw error;

        const inserted = data as IuranPayment;
        result = { success: true, message: "Pembayaran iuran berhasil ditambahkan." };
        set({ iuranPayments: [...state.iuranPayments, inserted] });
      } catch {
        result = { success: false, message: "Gagal menyimpan pembayaran ke server." };
      }

      return result;
    },
    updateIuranPayment: async (id, data) => {
      let result = { success: false, message: "Gagal memperbarui pembayaran." };

      const state = get();
      const target = state.iuranPayments.find((p) => p.id === id);
      if (!target) {
        return { success: false, message: "Data pembayaran tidak ditemukan." };
      }

      try {
        const { error } = await supabase.from("iuran_payments").update(data).eq("id", id);
        if (error) throw error;

        const updated = state.iuranPayments.map((p) => (p.id === id ? { ...p, ...data } : p));
        set({ iuranPayments: updated });
        result = { success: true, message: "Pembayaran iuran berhasil diperbarui." };
      } catch {
        result = { success: false, message: "Gagal memperbarui pembayaran di server." };
      }

      return result;
    },
    deleteIuranPayment: async (id) => {
      let result = { success: false, message: "Gagal menghapus pembayaran." };

      const state = get();
      const target = state.iuranPayments.find((p) => p.id === id);
      if (!target) {
        return { success: false, message: "Data pembayaran tidak ditemukan." };
      }

      try {
        const { error } = await supabase.from("iuran_payments").delete().eq("id", id);
        if (error) throw error;

        set({ iuranPayments: state.iuranPayments.filter((p) => p.id !== id) });
        result = { success: true, message: "Pembayaran iuran berhasil dihapus." };
      } catch {
        result = { success: false, message: "Gagal menghapus pembayaran di server." };
      }

      return result;
    },
    payIuranPayment: async (id) => {
      let result = { success: false, message: "Pembayaran gagal." };

      const state = get();
      const currentCitizen = state.citizens.find((c) => c.nik === state.userProfile.nik);
      const target = state.iuranPayments.find((p) => p.id === id);

      if (!currentCitizen || !target || target.citizenId !== currentCitizen.id) {
        return { success: false, message: "Tagihan iuran tidak ditemukan untuk akun ini." };
      }

      if (target.status === "Lunas") {
        return { success: false, message: "Iuran ini sudah tercatat lunas." };
      }

      const paidDate = new Date().toISOString().slice(0, 10);
      try {
        const { error } = await supabase.from("iuran_payments").update({ status: "Lunas", date: paidDate }).eq("id", id);
        if (error) throw error;

        const nextPayments = state.iuranPayments.map((p) =>
          p.id === id ? { ...p, status: "Lunas" as const, date: paidDate } : p
        );

        const typeName = state.iuranTypes.find((t) => t.id === target.iuranTypeId)?.name ?? "Iuran";
        set({
          iuranPayments: nextPayments,
          notifications: [
            createNotification(
              Date.now(),
              "Pembayaran Iuran Berhasil",
              `${typeName} berhasil dibayar.`,
              "iuran",
              new Date().toISOString()
            ),
            ...state.notifications,
          ],
        });
        result = { success: true, message: `${typeName} berhasil dibayar.` };
      } catch {
        result = { success: false, message: "Gagal memperbarui pembayaran di server." };
      }

      return result;
    },
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
        userProfile: state.userProfile,
        securitySettings: state.securitySettings,
      }),
    }
  )
);
