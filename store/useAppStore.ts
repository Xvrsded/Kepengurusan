import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { type User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import { logPayment, logLetterRequest, logStatusChange, logAuthEvent, logError } from "../lib/logger";

const supabase = createClient();

export type Profile = {
  id: string;
  name: string;
  nik: string;
  address: string;
  status: string;
  phone: string;
  role: string;
};

export type Letter = {
  id: string;
  user_id: string;
  jenis_surat: string;
  keperluan: string;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export type Iuran = {
  id: number;
  citizenId: number;
  month: string;
  amount: number;
  status: "Pending" | "Lunas";
  date: string;
};

export type IuranType = {
  id: number;
  name: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
};

export type IuranPayment = {
  id: number;
  citizenId: number;
  iuranId: number;
  iuranTypeId: number;
  amount: number;
  date: string;
  status: "Pending" | "Lunas";
  notes?: string;
};

export type IuranMaster = {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  due_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

export type IuranUser = {
  id: string;
  iuran_master_id: string;
  user_id: string;
  status: "unpaid" | "paid" | "overdue";
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  notes: string | null;
  iuran_master?: IuranMaster;
};


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



export type AppStore = {
  role: AppRole | null;
  isAuthReady: boolean;
  isLoggedIn: boolean;
  hasHydrated: boolean;
  loading: boolean;
  currentAccountId: number | null;
  lastSelectedAccountId: number | null;
  accounts: RegisteredAccount[];
  profiles: Profile[];
  citizens: Profile[];
  letters: Letter[];
  iuran: Iuran[];
  iuranTypes: IuranType[];
  iuranPayments: IuranPayment[];
  iuranMaster: IuranMaster[];
  iuranUser: IuranUser[];
  notifications: AppNotification[];
  loadingProfiles: boolean;
  loadingCitizens: boolean;
  loadingLetters: boolean;
  loadingIuran: boolean;
  loadingIuranTypes: boolean;
  loadingIuranPayments: boolean;
  loadingIuranMaster: boolean;
  loadingIuranUser: boolean;
  loadingNotifications: boolean;
  error: string | null;
  userProfile: UserProfile;
  securitySettings: SecuritySettings;
  notifMessage: AppToast | null;
  showNotification: boolean;
  aiResult: string;
  isAiLoading: boolean;
  isTtsLoading: boolean;
  supabaseUser: User | null;
  // New state for RT/RW features
  locationConfig: any | null;
  candidates: any[];
  panicAlerts: any[];
  loadingLocationConfig: boolean;
  loadingCandidates: boolean;
  loadingPanicAlerts: boolean;
  // === GLOBAL DATA CACHE ===
  iuranList: any[];
  setIuranList: (data: any[]) => void;
  hasVoted: boolean;
  setHasVoted: (val: boolean) => void;
  votingActive: boolean;
  setVotingActive: (val: boolean) => void;
  login: (accountId: number, pin: string) => { success: boolean; message: string; role?: AppRole | null };
  registerAccount: (account: Omit<RegisteredAccount, "id">) => { success: boolean; message: string };
  logout: () => Promise<void>;
  setSupabaseUser: (user: User | null) => void;
  syncSupabaseUser: () => Promise<void>;
  setHasHydrated: (value: boolean) => void;
  setLoading: (loading: boolean) => void;
  setLastSelectedAccountId: (accountId: number | null) => void;
  setupRealtime: () => () => void;
  fetchProfiles: () => Promise<void>;
  fetchCitizens: () => Promise<void>;
  fetchLetters: () => Promise<void>;
  fetchUserLetters: (userId: string) => Promise<void>;
  fetchIuran: () => Promise<void>;
  fetchIuranTypes: () => Promise<void>;
  fetchIuranPayments: () => Promise<void>;
  fetchIuranMaster: () => Promise<void>;
  fetchUserIuran: (userId: string) => Promise<void>;
  fetchAllIuranUser: () => Promise<void>;
  createIuranMaster: (iuran: Omit<IuranMaster, "id" | "created_at" | "updated_at">) => Promise<{ success: boolean; message: string }>;
  updateIuranUserPayment: (iuranId: string) => Promise<{ success: boolean; message: string }>;
  fetchNotifications: () => Promise<void>;
  refreshData: () => Promise<void>;
  setNotif: (payload: string | AppToast) => void;
  clearNotif: () => void;
  clearError: () => void;
  addNotification: (notification: Omit<AppNotification, "id" | "isRead" | "createdAt"> & Partial<Pick<AppNotification, "id" | "isRead" | "createdAt">>) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  updateSecuritySettings: (data: Partial<Omit<SecuritySettings, "pin" | "lastPinChangedAt" | "activeSessions">>) => Promise<void>;
  changePin: (currentPin: string, newPin: string) => Promise<{ success: boolean; message: string }>;
  logoutOtherSessions: () => Promise<void>;
  setAiResult: (result: string) => void;
  setIsAiLoading: (v: boolean) => void;
  setIsTtsLoading: (v: boolean) => void;
  requestLetter: (type: string) => Promise<{ success: boolean; message: string }>;
  payIuran: (id: number) => Promise<{ success: boolean; message: string }>;
  updateIuranStatus: (id: number, status: Iuran["status"]) => Promise<{ success: boolean; message: string }>;
  updateLetters: (letters: Letter[]) => void;
  updateIuran: (iuran: Iuran[]) => void;
  updateLetterStatus: (id: string, status: Letter["status"]) => Promise<void>;
  approveLetter: (id: string, adminNote: string) => Promise<{ success: boolean; message: string }>;
  rejectLetter: (id: string, adminNote: string) => Promise<{ success: boolean; message: string }>;
  addIuranType: (type: Omit<IuranType, "id" | "createdAt">) => Promise<{ success: boolean; message: string }>;
  updateIuranType: (id: number, data: Partial<Omit<IuranType, "id" | "createdAt">>) => Promise<{ success: boolean; message: string }>;
  deleteIuranType: (id: number) => Promise<{ success: boolean; message: string }>;
  addIuranPayment: (payment: Omit<IuranPayment, "id">) => Promise<{ success: boolean; message: string }>;
  updateIuranPayment: (id: number, data: Partial<IuranPayment>) => Promise<{ success: boolean; message: string }>;
  deleteIuranPayment: (id: number) => Promise<{ success: boolean; message: string }>;
  payIuranPayment: (id: number) => Promise<{ success: boolean; message: string }>;
  // New methods for RT/RW features
  fetchLocationConfig: () => Promise<void>;
  fetchCandidates: () => Promise<void>;
  fetchPanicAlerts: () => Promise<void>;
  setLocationConfig: (config: any) => void;
  setCandidates: (candidates: any[]) => void;
  setPanicAlerts: (alerts: any[]) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
    role: null,
    isAuthReady: false,
    isLoggedIn: false,
    hasHydrated: false,
    loading: true,
    currentAccountId: null,
    lastSelectedAccountId: null,
    accounts: [],
    profiles: [],
    citizens: [],
    letters: [],
    iuran: [],
    iuranTypes: [],
    iuranPayments: [],
    iuranMaster: [],
    iuranUser: [],
    notifications: [],
    loadingProfiles: false,
    loadingCitizens: false,
    loadingLetters: false,
    loadingIuran: false,
    loadingIuranTypes: false,
    loadingIuranPayments: false,
    loadingIuranMaster: false,
    loadingIuranUser: false,
    loadingNotifications: false,
    error: null,
    userProfile: {
      name: "",
      nik: "",
      address: "",
      phone: "",
      role: null,
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
    // New state for RT/RW features
    locationConfig: null,
    candidates: [],
    panicAlerts: [],
    loadingLocationConfig: false,
    loadingCandidates: false,
    loadingPanicAlerts: false,
    // === GLOBAL DATA CACHE ===
    iuranList: [],
    hasVoted: false,
    votingActive: false,
    setIuranList: (data) => set({ iuranList: data }),
    setHasVoted: (val) => set({ hasVoted: val }),
    setVotingActive: (val) => set({ votingActive: val }),
    setHasHydrated: (value: boolean) => set({ hasHydrated: value }),
    setLoading: (loading: boolean) => set({ loading }),
    setLastSelectedAccountId: (accountId: number | null) => set({ lastSelectedAccountId: accountId }),

    fetchProfiles: async () => {
      set({ loadingProfiles: true, error: null });
      try {
        const { data, error } = await supabase.from("profiles").select("*").order("id", { ascending: true });
        if (error) throw error;
        set({ profiles: (data as Profile[]) ?? [], loadingProfiles: false });
      } catch (err) {
        set({ loadingProfiles: false, error: "Gagal memuat data warga. Silakan coba lagi." });
      }
    },

    fetchCitizens: async () => {
      set({ loadingCitizens: true, error: null });
      try {
        const { data, error } = await supabase.from("profiles").select("*").order("id", { ascending: true });
        if (error) throw error;
        set({ citizens: (data as Profile[]) ?? [], loadingCitizens: false });
      } catch (err) {
        set({ loadingCitizens: false, error: "Gagal memuat data warga. Silakan coba lagi." });
      }
    },

    fetchLetters: async () => {
      set({ loadingLetters: true });

      try {
        const state = get();
        const { supabaseUser, role } = state;

        console.log("📨 FETCH LETTERS START");

        // Validasi user
        if (!supabaseUser?.id) {
          console.warn("⚠️ USER BELUM READY");
          set({ letters: [], loadingLetters: false });
          return;
        }

        // Query dinamis berdasarkan role
        let query = supabase
          .from("letters")
          .select("*");

        if (role === "warga") {
          query = query.eq("user_id", supabaseUser.id);
        }

        const { data, error } = await query;

        console.log("📨 FILTERED LETTERS:", data, error);

        if (error) {
          console.error("❌ FETCH LETTERS ERROR:", JSON.stringify(error, null, 2));

          set({
            letters: [],
            loadingLetters: false,
          });
          return;
        }

        set({
          letters: data ?? [],
          loadingLetters: false,
        });

        console.log("✅ LETTERS LOADED:", data?.length);

      } catch (err) {
        console.error("💥 FETCH LETTERS CATCH:", err);

        set({
          loadingLetters: false,
          letters: [], // 🔥 WAJIB fallback
          error: "Gagal memuat data surat",
        });
      }
    },
    fetchUserLetters: async (userId: string) => {
      set({ loadingLetters: true, error: null });
      try {
        console.log('[FETCH USER LETTERS] Starting fetch for user:', userId);

        const { data, error } = await supabase
          .from("letters")
          .select("*")
          .eq("user_id", userId);

        console.log('[FETCH USER LETTERS] Raw Supabase response:', { data, error });
        console.log('[FETCH USER LETTERS] Data length:', data?.length ?? 0);

        if (error) {
          console.error('[FETCH USER LETTERS ERROR]', error.message || error.details || JSON.stringify(error));
          throw error;
        }

        console.log('[FETCH USER LETTERS] Success, setting letters:', data);
        set({ letters: (data as Letter[]) ?? [], loadingLetters: false });
      } catch (err) {
        console.error('[FETCH USER LETTERS CATCH ERROR]', err);
        set({ loadingLetters: false, error: "Gagal memuat data surat Anda. Silakan coba lagi." });
      }
    },

    fetchIuran: async () => {
      set({ loadingIuran: true, error: null });
      try {
        const { data, error } = await supabase.from("iuran").select("*").order("id", { ascending: true });
        if (error) throw error;
        set({ iuran: (data as Iuran[]) ?? [], loadingIuran: false });
      } catch (err) {
        set({ loadingIuran: false, error: "Gagal memuat data iuran. Silakan coba lagi." });
      }
    },

    fetchIuranTypes: async () => {
      set({ loadingIuranTypes: true, error: null });
      try {
        const { data, error } = await supabase.from("iuran_types").select("*").order("created_at", { ascending: true });
        if (error) throw error;
        set({ iuranTypes: (data as IuranType[]) ?? [], loadingIuranTypes: false });
      } catch (err) {
        set({ loadingIuranTypes: false, error: "Gagal memuat jenis iuran. Silakan coba lagi." });
      }
    },

    fetchIuranPayments: async () => {
      set({ loadingIuranPayments: true, error: null });
      try {
        const { data, error } = await supabase.from("iuran_payments").select("*").order("id", { ascending: true });
        if (error) throw error;
        set({ iuranPayments: (data as IuranPayment[]) ?? [], loadingIuranPayments: false });
      } catch (err) {
        set({ loadingIuranPayments: false, error: "Gagal memuat data pembayaran iuran. Silakan coba lagi." });
      }
    },

    fetchIuranMaster: async () => {
      set({ loadingIuranMaster: true, error: null });
      try {
        console.log('[FETCH IURAN MASTER] Starting fetch from iuran_master table...');
        console.log('[FETCH IURAN MASTER] User ID:', get().supabaseUser?.id);
        console.log('[FETCH IURAN MASTER] User Role:', get().role);

        const { data, error } = await supabase
          .from("iuran_master")
          .select("*");

        console.log('[FETCH IURAN MASTER] Raw Supabase response:', { data, error });
        console.log('[FETCH IURAN MASTER] Data length:', data?.length ?? 0);

        if (error) {
          console.error('[FETCH IURAN MASTER ERROR]', error.message || error.details || JSON.stringify(error));
          throw error;
        }

        console.log('[FETCH IURAN MASTER] Success, setting iuranMaster:', data);
        set({ iuranMaster: (data as IuranMaster[]) ?? [], loadingIuranMaster: false });
      } catch (err) {
        console.error('[FETCH IURAN MASTER CATCH ERROR]', err);
        set({ loadingIuranMaster: false, error: "Gagal memuat data iuran master. Silakan coba lagi." });
      }
    },

    fetchUserIuran: async (userId: string) => {
      set({ loadingIuranUser: true, error: null });
      try {
        console.log('[FETCH USER IURAN] Starting fetch for user:', userId);

        const { data, error } = await supabase
          .from("iuran_user")
          .select("*, iuran_master(*)")
          .eq("user_id", userId);

        console.log('[FETCH USER IURAN] Raw Supabase response:', { data, error });
        console.log('[FETCH USER IURAN] Data length:', data?.length ?? 0);

        if (error) {
          console.error('[FETCH USER IURAN] Error:', error.message || error.details || JSON.stringify(error));
          set({ loadingIuranUser: false, error: "Gagal memuat data iuran. Silakan coba lagi." });
          return;
        }

        console.log('[FETCH USER IURAN] Success, setting iuranUser:', data);
        set({ iuranUser: (data as IuranUser[]) ?? [], loadingIuranUser: false });
      } catch (err) {
        console.error('[FETCH USER IURAN CATCH ERROR]', err);
        set({ loadingIuranUser: false, error: "Gagal memuat data iuran. Silakan coba lagi." });
      }
    },

    fetchAllIuranUser: async () => {
      set({ loadingIuranUser: true, error: null });
      try {
        console.log('[FETCH ALL IURAN USER] Starting fetch for all iuran_user (admin)');
        
        const { data, error } = await supabase
          .from("iuran_user")
          .select("*, iuran_master(*)");

        console.log('[FETCH ALL IURAN USER] Raw Supabase response:', { data, error });
        console.log('[FETCH ALL IURAN USER] Data length:', data?.length ?? 0);

        if (error) {
          console.error('[FETCH ALL IURAN USER ERROR]', error);
          set({ loadingIuranUser: false, error: "Gagal memuat data iuran semua warga. Silakan coba lagi." });
          return;
        }

        console.log('[FETCH ALL IURAN USER] Success, setting iuranUser:', data);
        set({ iuranUser: (data as IuranUser[]) ?? [], loadingIuranUser: false });
      } catch (err) {
        console.error('[FETCH ALL IURAN USER CATCH ERROR]', err);
        set({ loadingIuranUser: false, error: "Gagal memuat data iuran semua warga. Silakan coba lagi." });
      }
    },

    createIuranMaster: async (iuran: Omit<IuranMaster, "id" | "created_at" | "updated_at">) => {
      let result = { success: false, message: "Pembuatan iuran gagal." };

      try {
        console.log('[CREATE IURAN MASTER] Creating iuran:', iuran);
        const response = await supabase
          .from("iuran_master")
          .insert(iuran)
          .select()
          .maybeSingle();
        
        console.log('[CREATE IURAN MASTER] Supabase response:', response);
        
        if (response.error) {
          console.error('[CREATE IURAN MASTER ERROR]', response.error);
          throw response.error;
        }

        const newIuran = response.data as IuranMaster;
        console.log('[CREATE IURAN MASTER] Insert successful:', newIuran);
        
        set({ iuranMaster: [newIuran, ...get().iuranMaster] });
        result = { success: true, message: "Iuran berhasil dibuat dan otomatis ditagihkan ke semua warga." };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorCode = (error as any).code;
        console.error('[CREATE IURAN MASTER ERROR]', { errorMessage, errorCode, error });
        
        let userMessage = "Gagal menyimpan iuran ke server.";
        if (errorCode === "42501") {
          userMessage = "Anda tidak memiliki izin untuk membuat iuran. Hubungi admin.";
        } else if (errorMessage) {
          userMessage = `Gagal: ${errorMessage}`;
        }
        
        result = { success: false, message: userMessage };
      }

      return result;
    },

    updateIuranUserPayment: async (iuranId: string) => {
      let result = { success: false, message: "Update pembayaran iuran gagal." };

      try {
        console.log('[UPDATE IURAN USER PAYMENT] Updating iuran:', iuranId);
        const response = await supabase
          .from("iuran_user")
          .update({
            status: "paid",
            paid_at: new Date().toISOString()
          })
          .eq("id", iuranId)
          .select()
          .maybeSingle();
        
        console.log('[UPDATE IURAN USER PAYMENT] Supabase response:', response);
        
        if (response.error) {
          console.error('[UPDATE IURAN USER PAYMENT ERROR]', response.error);
          throw response.error;
        }

        const updatedIuran = response.data as IuranUser;
        console.log('[UPDATE IURAN USER PAYMENT] Update successful:', updatedIuran);
        
        set({ 
          iuranUser: get().iuranUser.map((i) => i.id === iuranId ? updatedIuran : i)
        });
        result = { success: true, message: "Pembayaran iuran berhasil dicatat." };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorCode = (error as any).code;
        console.error('[UPDATE IURAN USER PAYMENT ERROR]', { errorMessage, errorCode, error });
        
        let userMessage = "Gagal mengupdate pembayaran iuran.";
        if (errorCode === "42501") {
          userMessage = "Anda tidak memiliki izin untuk update pembayaran ini.";
        } else if (errorMessage) {
          userMessage = `Gagal: ${errorMessage}`;
        }
        
        result = { success: false, message: userMessage };
      }

      return result;
    },

    fetchNotifications: async () => {
      set({ loadingNotifications: true, error: null });
      try {
        const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        set({ notifications: (data as AppNotification[]) ?? [], loadingNotifications: false });
      } catch (err) {
        set({ loadingNotifications: false, error: "Gagal memuat notifikasi. Silakan coba lagi." });
      }
    },

    refreshData: async () => {
      // Individual fetches are exposed as store actions; pages can call them directly
      // This placeholder avoids circular ref at init time
    },

    setupRealtime: () => {
      const state = get();

      // Subscribe to notifications changes
      const notificationsChannel = supabase
        .channel("notifications-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
          },
          async (payload: any) => {
            console.log("Notification change:", payload);
            await state.fetchNotifications();
          }
        )
        .subscribe((status: any) => {
          if (status === "SUBSCRIBED") {
            console.log("Subscribed to notifications");
          }
        });

      // Subscribe to iuran changes
      const iuranChannel = supabase
        .channel("iuran-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "iuran",
          },
          async (payload: any) => {
            console.log("Iuran change:", payload);
            await state.fetchIuran();
          }
        )
        .subscribe((status: any) => {
          if (status === "SUBSCRIBED") {
            console.log("Subscribed to iuran");
          }
        });

      // Subscribe to iuran_payments changes
      const iuranPaymentsChannel = supabase
        .channel("iuran-payments-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "iuran_payments",
          },
          async (payload: any) => {
            console.log("Iuran Payments change:", payload);
            await state.fetchIuranPayments();
          }
        )
        .subscribe((status: any) => {
          if (status === "SUBSCRIBED") {
            console.log("Subscribed to iuran_payments");
          }
        });

      // Subscribe to letters changes
      const lettersChannel = supabase
        .channel("letters-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "letters",
          },
          async (payload: any) => {
            console.log("Letter change:", payload);
            await state.fetchLetters();
          }
        )
        .subscribe((status: any) => {
          if (status === "SUBSCRIBED") {
            console.log("Subscribed to letters");
          }
        });

      // Subscribe to iuran_master changes
      const iuranMasterChannel = supabase
        .channel("iuran-master-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "iuran_master",
          },
          async (payload: any) => {
            console.log("[REALTIME] Iuran Master change:", payload);
            await state.fetchIuranMaster();
          }
        )
        .subscribe((status: any) => {
          if (status === "SUBSCRIBED") {
            console.log("[REALTIME] Subscribed to iuran_master");
          }
        });

      // Subscribe to iuran_user changes
      const iuranUserChannel = supabase
        .channel("iuran-user-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "iuran_user",
          },
          async (payload: any) => {
            console.log("[REALTIME] Iuran User change:", payload);
            // Refresh based on user role
            if (state.role === "admin") {
              await state.fetchIuranMaster();
            } else if (state.supabaseUser?.id) {
              await state.fetchUserIuran(state.supabaseUser.id);
            }
          }
        )
        .subscribe((status: any) => {
          if (status === "SUBSCRIBED") {
            console.log("[REALTIME] Subscribed to iuran_user");
          }
        });

      // Return cleanup function
      return () => {
        supabase.removeChannel(notificationsChannel);
        supabase.removeChannel(iuranChannel);
        supabase.removeChannel(iuranPaymentsChannel);
        supabase.removeChannel(lettersChannel);
        supabase.removeChannel(iuranMasterChannel);
        supabase.removeChannel(iuranUserChannel);
      };
    },

    clearNotif: () => set({ notifMessage: null, showNotification: false }),
    clearError: () => set({ error: null }),
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

        const nextProfiles =
          nextAccount.role === "warga"
            ? [
                ...state.profiles,
                {
                  id: crypto.randomUUID(),
                  name: nextAccount.name,
                  nik: nextAccount.nik,
                  address: nextAccount.address,
                  status: "pending",
                  phone: nextAccount.phone,
                  role: "warga",
                },
              ]
            : state.profiles;

        result = { success: true, message: "Akun berhasil didaftarkan. Silakan masuk." };

        return {
          accounts: [...state.accounts, nextAccount],
          lastSelectedAccountId: nextAccount.id,
          profiles: nextProfiles,
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
        // Role will be set by syncSupabaseUser from profiles table
        role: null,
        userProfile: {
          name: metadata.name ?? user.email ?? "",
          nik: metadata.nik ?? "",
          address: metadata.address ?? "",
          phone: metadata.phone ?? "",
          // Role will be set by syncSupabaseUser from profiles table
          role: null,
        },
      });
    },
    syncSupabaseUser: async () => {
      console.log("[SYNC] syncSupabaseUser called");
      set({ loading: true, isAuthReady: false });
      const { data: { user } } = await supabase.auth.getUser();
      console.log("[SYNC] User from auth:", { hasUser: !!user, userId: user?.id, email: user?.email });
      
      if (!user) {
        console.warn("[SYNC] No user found");
        set({ supabaseUser: null, isLoggedIn: false, role: null, isAuthReady: true, loading: false });
        return;
      }

      console.log("[SYNC] Fetching profile data for user:", user.id);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, phone, role, email")
        .eq("id", user.id)
        .maybeSingle();

      console.log("[SYNC] Profile fetch result:", { 
        hasProfile: !!profile, 
        error: error?.message,
        profileData: profile ? { id: profile.id, role: profile.role, email: profile.email } : null 
      });

      if (error) {
        console.error("[SYNC] Gagal fetch profiles:", error.message);
        // RLS error - this is critical, set error status
        set({
          supabaseUser: user,
          isLoggedIn: true,
          role: null,
          isAuthReady: true,
          loading: false,
          userProfile: {
            name: user.email ?? "",
            nik: "",
            address: "",
            phone: "",
            role: null,
          },
        });
        return;
      }

      // Only set role if profile data exists
      if (!profile) {
        console.warn("[SYNC] Profile data not found for user:", user.id);
        set({
          supabaseUser: user,
          isLoggedIn: true,
          role: null,
          isAuthReady: true,
          loading: false,
          userProfile: {
            name: user.email ?? "",
            nik: "",
            address: "",
            phone: "",
            role: null,
          },
        });
        return;
      }

      // Use role from database, no fallback
      const role = profile.role as AppRole;
      console.log("[SYNC] Role found:", role);

      set({
        supabaseUser: user,
        isLoggedIn: true,
        role,
        isAuthReady: true,
        loading: false,
        userProfile: {
          name: profile.full_name ?? user.email ?? "",
          nik: profile.nik ?? "",
          address: profile.address ?? "",
          phone: profile.phone ?? "",
          role,
        },
      });
      console.log("[SYNC] syncSupabaseUser completed successfully with role:", role);
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
    updateProfile: (data: Partial<UserProfile>) => {
      set((state: AppStore) => {
        // Validate phone number format
        if (data.phone && !/^\d+$/.test(data.phone)) {
          return {};
        }
        // Validate NIK format (should be 16 digits)
        if (data.nik && !/^\d{16}$/.test(data.nik)) {
          return {};
        }
        return {
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
          profiles: state.profiles.map((profile) =>
            profile.nik === state.userProfile.nik
              ? {
                  ...profile,
                  name: data.name ?? profile.name,
                  address: data.address ?? profile.address,
                  phone: data.phone ?? profile.phone,
                }
              : profile
          ),
          userProfile: {
            ...state.userProfile,
            ...data,
          },
        };
      });
    },
    updateSecuritySettings: async (data) => {
      const state = get();
      const notification = createNotification(
        Date.now(),
        "Keamanan Akun Diperbarui",
        "Pengaturan keamanan akun Anda berhasil diperbarui.",
        "warning",
        new Date().toISOString()
      );

      // Insert notification to Supabase
      try {
        await supabase.from("notifications").insert({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          is_read: notification.isRead,
          created_at: notification.createdAt,
        });
      } catch {
        // Silently fail if notification insert fails
      }

      set({
        securitySettings: {
          ...state.securitySettings,
          ...data,
        },
        notifications: [notification, ...state.notifications],
      });
    },
    changePin: async (currentPin: string, newPin: string) => {
      let result = { success: false, message: "PIN lama tidak sesuai." };

      const state = get();
      
      if (state.securitySettings.pin !== currentPin) {
        result = { success: false, message: "PIN lama tidak sesuai." };
        return result;
      }

      if (!/^\d{6}$/.test(newPin)) {
        result = { success: false, message: "PIN baru harus 6 digit angka." };
        return result;
      }

      if (newPin === currentPin) {
        result = { success: false, message: "PIN baru harus berbeda dari PIN lama." };
        return result;
      }

      result = { success: true, message: "PIN berhasil diperbarui." };

      const notification = createNotification(
        Date.now(),
        "PIN Berhasil Diubah",
        "PIN keamanan akun Anda baru saja diperbarui.",
        "warning",
        new Date().toISOString()
      );

      // Insert notification to Supabase
      try {
        await supabase.from("notifications").insert({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          is_read: notification.isRead,
          created_at: notification.createdAt,
        });
      } catch {
        // Silently fail if notification insert fails
      }

      set({
        securitySettings: {
          ...state.securitySettings,
          pin: newPin,
          lastPinChangedAt: new Date().toLocaleString("id-ID"),
        },
        accounts: state.accounts.map((account) =>
          account.id === state.currentAccountId ? { ...account, pin: newPin } : account
        ),
        notifications: [notification, ...state.notifications],
      });

      return result;
    },
    logoutOtherSessions: async () => {
      const state = get();
      const notification = createNotification(
        Date.now(),
        "Sesi Lain Dikeluarkan",
        "Semua sesi lain berhasil dikeluarkan dari akun Anda.",
        "warning",
        new Date().toISOString()
      );

      // Insert notification to Supabase
      try {
        await supabase.from("notifications").insert({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          is_read: notification.isRead,
          created_at: notification.createdAt,
        });
      } catch {
        // Silently fail if notification insert fails
      }

      set({
        securitySettings: {
          ...state.securitySettings,
          activeSessions: 1,
        },
        notifications: [notification, ...state.notifications],
      });
    },
    setAiResult: (result: string) => set({ aiResult: result }),
    setIsAiLoading: (v: boolean) => set({ isAiLoading: v }),
    setIsTtsLoading: (v: boolean) => set({ isTtsLoading: v }),
    requestLetter: async (type: string) => {
      let result = { success: false, message: "Pengajuan surat gagal." };

      const normalizedType = type.trim();
      if (!normalizedType) {
        return { success: false, message: "Jenis surat wajib dipilih." };
      }

      const { userProfile, letters, supabaseUser } = get();
      if (!userProfile.name) {
        return { success: false, message: "Data akun belum lengkap untuk mengajukan surat." };
      }

      console.log('[REQUEST LETTER] User ID:', supabaseUser?.id);
      console.log('[REQUEST LETTER] User authenticated:', !!supabaseUser?.id);

      const nextLetter = {
        user_id: supabaseUser?.id,
        type: normalizedType,
        status: "pending" as const
      };

      console.log('[REQUEST LETTER] Payload to insert:', nextLetter);

      // Validate payload before insert
      if (!nextLetter.user_id) {
        console.error('[REQUEST LETTER ERROR] user_id is null or undefined');
        return { success: false, message: "User tidak terautentikasi. Silakan login ulang." };
      }
      if (!nextLetter.type || nextLetter.type.trim() === "") {
        console.error('[REQUEST LETTER ERROR] type is empty');
        return { success: false, message: "Jenis surat tidak boleh kosong." };
      }
      if (!nextLetter.status) {
        console.error('[REQUEST LETTER ERROR] status is null');
        return { success: false, message: "Status tidak boleh kosong." };
      }

      try {
        console.log('[REQUEST LETTER] Inserting letter...');
        const response = await supabase.from("letters").insert(nextLetter).select().maybeSingle();
        
        console.log('[REQUEST LETTER] Supabase response:', response);
        
        if (response.error) {
          console.error('[REQUEST LETTER ERROR] Supabase error:', response.error);
          throw response.error;
        }

        const newLetter = response.data as Letter;
        console.log('[REQUEST LETTER] Insert successful:', newLetter);
        
        set({ letters: [newLetter, ...letters] });
        result = { success: true, message: "Pengajuan surat berhasil dikirim." };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorCode = (error as any).code;
        console.error('[REQUEST LETTER ERROR]', { errorMessage, errorCode, error });
        
        logError(error instanceof Error ? error : new Error(String(error)), "requestLetter");
        
        // Return detailed error message
        let userMessage = "Gagal menyimpan pengajuan surat ke server.";
        if (errorCode === "42501") {
          userMessage = "Anda tidak memiliki izin untuk mengajukan surat. Hubungi admin.";
        } else if (errorCode === "23505") {
          userMessage = "Pengajuan surat duplikat terdeteksi.";
        } else if (errorMessage) {
          userMessage = `Gagal: ${errorMessage}`;
        }
        
        result = { success: false, message: userMessage };
      }

      return result;
    },
    payIuran: async (id: number) => {
      let result = { success: false, message: "Pembayaran iuran gagal." };

      const state = get();
      const currentProfile = state.profiles.find((profile) => profile.nik === state.userProfile.nik);
      const target = state.iuran.find((item) => item.id === id);

      if (!currentProfile || !target || target.citizenId !== parseInt(currentProfile.id)) {
        return { success: false, message: "Tagihan iuran tidak ditemukan untuk akun ini." };
      }

      if (target.status === "Lunas") {
        return { success: false, message: "Iuran ini sudah tercatat lunas." };
      }

      // Check for duplicate payment (already has a payment for this iuran)
      const existingPayment = state.iuranPayments.find(
        (payment) => payment.iuranId === id && payment.citizenId === parseInt(currentProfile.id)
      );
      if (existingPayment) {
        return { success: false, message: "Pembayaran untuk iuran ini sudah pernah dilakukan." };
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

        const notification = createNotification(
          Date.now(),
          "Pembayaran Iuran Berhasil",
          `Pembayaran iuran ${target.month} sudah diterima.`,
          "iuran",
          new Date().toISOString()
        );
        
        // Insert notification to Supabase
        try {
          await supabase.from("notifications").insert({
            title: notification.title,
            message: notification.message,
            type: notification.type,
            is_read: notification.isRead,
            created_at: notification.createdAt,
          });
        } catch {
          // Silently fail if notification insert fails
        }

        set({
          iuran: nextIuran,
          notifications: [notification, ...pendingNotifications, ...otherNotifications],
        });
        result = { success: true, message: `Iuran ${target.month} berhasil dibayar.` };
        
        // Log payment
        logPayment({
          citizenId: parseInt(currentProfile!.id),
          amount: target.amount,
          iuranTypeId: 0,
          status: "Lunas",
        }, state.userProfile.nik, state.role ?? undefined);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)), "payIuran");
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
      const oldStatus = target.status;
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

        let notification;
        if (status === "Lunas") {
          notification = createNotification(
            Date.now(),
            "Iuran Terkonfirmasi",
            `Pembayaran iuran ${target.month} telah dikonfirmasi pengurus.`,
            "iuran",
            new Date().toISOString()
          );
          
          // Insert notification to Supabase
          try {
            await supabase.from("notifications").insert({
              title: notification.title,
              message: notification.message,
              type: notification.type,
              is_read: notification.isRead,
              created_at: notification.createdAt,
            });
          } catch {
            // Silently fail if notification insert fails
          }
        }

        set({
          iuran: nextIuran,
          notifications: status === "Lunas" && notification
            ? [notification, ...pendingNotifications, ...otherNotifications]
            : [...pendingNotifications, ...otherNotifications],
        });
        result = {
          success: true,
          message: status === "Lunas" ? `Iuran ${target.month} ditandai lunas.` : `Iuran ${target.month} ditandai pending.`,
        };
        
        // Log status change
        logStatusChange({
          table: "iuran",
          recordId: id,
          oldStatus,
          newStatus: status,
        }, state.userProfile.nik, state.role ?? undefined);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)), "updateIuranStatus");
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
    updateLetterStatus: async (id: string, status: Letter["status"]) => {
      const state = get();
      const currentLetter = state.letters.find((letter) => letter.id === id);
      if (!currentLetter) return;

      const oldStatus = currentLetter.status;
      try {
        const { error } = await supabase.from("letters").update({ status }).eq("id", id);
        if (error) throw error;

        const updatedLetters = state.letters.map((letter) =>
          letter.id === id ? { ...letter, status } : letter
        );

        const nextNotifications =
          status === "approved" && currentLetter.status !== "approved"
            ? [
                createNotification(
                  Date.now(),
                  "Surat Disetujui",
                  "Pengajuan surat Anda telah disetujui.",
                  "surat",
                  new Date().toISOString()
                ),
                ...state.notifications,
              ]
            : status === "rejected" && currentLetter.status !== "rejected"
            ? [
                createNotification(
                  Date.now(),
                  "Surat Ditolak",
                  "Pengajuan surat Anda ditolak oleh admin.",
                  "surat",
                  new Date().toISOString()
                ),
                ...state.notifications,
              ]
            : state.notifications;

        // Insert notification to Supabase if status changed
        if ((status === "approved" || status === "rejected") && nextNotifications[0]) {
          try {
            await supabase.from("notifications").insert({
              title: nextNotifications[0].title,
              message: nextNotifications[0].message,
              type: nextNotifications[0].type,
              is_read: nextNotifications[0].isRead,
              created_at: nextNotifications[0].createdAt,
            });
          } catch {
            // Silently fail if notification insert fails
          }
        }

        set({
          letters: updatedLetters,
          notifications: nextNotifications,
        });
        
        // Log status change
        logStatusChange({
          table: "letters",
          recordId: parseInt(id),
          oldStatus,
          newStatus: status,
        }, state.userProfile.nik, state.role ?? undefined);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)), "updateLetterStatus");
        // silently fail - UI can show generic error
      }
    },
    approveLetter: async (id: string, adminNote: string) => {
      let result = { success: false, message: "Gagal menyetujui surat." };
      
      const state = get();
      const currentLetter = state.letters.find((letter) => letter.id === id);
      if (!currentLetter) {
        return { success: false, message: "Surat tidak ditemukan." };
      }

      try {
        console.log('[APPROVE LETTER] Approving letter:', id, 'with note:', adminNote);
        const { error } = await supabase
          .from("letters")
          .update({
            status: "approved",
            admin_note: adminNote,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
        
        if (error) {
          console.error('[APPROVE LETTER ERROR]', error);
          throw error;
        }

        // Update local state
        const updatedLetters = state.letters.map((letter) =>
          letter.id === id ? { ...letter, status: "approved" as const, admin_note: adminNote } : letter
        );

        // Create notification for user
        const notification = createNotification(
          Date.now(),
          "Surat Disetujui",
          `Pengajuan ${currentLetter.jenis_surat} Anda telah disetujui.`,
          "surat",
          new Date().toISOString()
        );

        // Insert notification to Supabase
        try {
          await supabase.from("notifications").insert({
            title: notification.title,
            message: notification.message,
            type: notification.type,
            is_read: notification.isRead,
            created_at: notification.createdAt,
          });
        } catch {
          // Silently fail if notification insert fails
        }

        set({
          letters: updatedLetters,
          notifications: [notification, ...state.notifications],
        });

        result = { success: true, message: "Surat berhasil disetujui." };
        
        // Log action
        logStatusChange({
          table: "letters",
          recordId: parseInt(id),
          oldStatus: currentLetter.status,
          newStatus: "approved",
        }, state.userProfile.nik, state.role ?? undefined);
      } catch (error) {
        console.error('[APPROVE LETTER ERROR]', error);
        logError(error instanceof Error ? error : new Error(String(error)), "approveLetter");
        result = { success: false, message: "Gagal menyetujui surat. Silakan coba lagi." };
      }

      return result;
    },
    rejectLetter: async (id: string, adminNote: string) => {
      let result = { success: false, message: "Gagal menolak surat." };
      
      const state = get();
      const currentLetter = state.letters.find((letter) => letter.id === id);
      if (!currentLetter) {
        return { success: false, message: "Surat tidak ditemukan." };
      }

      try {
        console.log('[REJECT LETTER] Rejecting letter:', id, 'with note:', adminNote);
        const { error } = await supabase
          .from("letters")
          .update({
            status: "rejected",
            admin_note: adminNote,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
        
        if (error) {
          console.error('[REJECT LETTER ERROR]', error);
          throw error;
        }

        // Update local state
        const updatedLetters = state.letters.map((letter) =>
          letter.id === id ? { ...letter, status: "rejected" as const, admin_note: adminNote } : letter
        );

        // Create notification for user
        const notification = createNotification(
          Date.now(),
          "Surat Ditolak",
          `Pengajuan ${currentLetter.jenis_surat} Anda ditolak. ${adminNote}`,
          "surat",
          new Date().toISOString()
        );

        // Insert notification to Supabase
        try {
          await supabase.from("notifications").insert({
            title: notification.title,
            message: notification.message,
            type: notification.type,
            is_read: notification.isRead,
            created_at: notification.createdAt,
          });
        } catch {
          // Silently fail if notification insert fails
        }

        set({
          letters: updatedLetters,
          notifications: [notification, ...state.notifications],
        });

        result = { success: true, message: "Surat berhasil ditolak." };
        
        // Log action
        logStatusChange({
          table: "letters",
          recordId: parseInt(id),
          oldStatus: currentLetter.status,
          newStatus: "rejected",
        }, state.userProfile.nik, state.role ?? undefined);
      } catch (error) {
        console.error('[REJECT LETTER ERROR]', error);
        logError(error instanceof Error ? error : new Error(String(error)), "rejectLetter");
        result = { success: false, message: "Gagal menolak surat. Silakan coba lagi." };
      }

      return result;
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
      
      // Check for duplicate name
      const existingType = state.iuranTypes.find(
        (t) => t.name.toLowerCase() === type.name.trim().toLowerCase()
      );
      if (existingType) {
        return { success: false, message: "Jenis iuran dengan nama ini sudah ada." };
      }

      const newType: Omit<IuranType, "id"> = {
        name: type.name.trim(),
        type: type.type,
        amount: type.amount,
        createdAt: new Date().toISOString().slice(0, 10),
        description: type.description,
      };

      try {
        const { data, error } = await supabase.from("iuran_types").insert(newType).select().maybeSingle();
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
        const { data, error } = await supabase.from("iuran_payments").insert(newPayment).select().maybeSingle();
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
      const currentProfile = state.profiles.find((c) => c.nik === state.userProfile.nik);
      const target = state.iuranPayments.find((p) => p.id === id);

      if (!currentProfile || !target || target.citizenId !== parseInt(currentProfile.id)) {
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
    // New methods for RT/RW features
    fetchLocationConfig: async () => {
      const { locationService } = await import('@/services/locationService');
      set({ loadingLocationConfig: true });
      const result = await locationService.getLocationConfig();
      if (result.success && result.data) {
        set({ locationConfig: result.data, loadingLocationConfig: false });
      } else {
        set({ locationConfig: null, loadingLocationConfig: false });
      }
    },
    fetchCandidates: async () => {
      const { candidatesService } = await import('@/services/candidatesService');
      set({ loadingCandidates: true });
      const result = await candidatesService.getCandidates();
      if (result.success && result.data) {
        set({ candidates: result.data, loadingCandidates: false });
      } else {
        set({ candidates: [], loadingCandidates: false });
      }
    },
    fetchPanicAlerts: async () => {
      const { panicService } = await import('@/services/panicService');
      set({ loadingPanicAlerts: true });
      const result = await panicService.getAllPanicAlerts();
      if (result.success && result.data) {
        set({ panicAlerts: result.data, loadingPanicAlerts: false });
      } else {
        set({ panicAlerts: [], loadingPanicAlerts: false });
      }
    },
    setLocationConfig: (config: any) => set({ locationConfig: config }),
    setCandidates: (candidates: any[]) => set({ candidates }),
    setPanicAlerts: (alerts: any[]) => set({ panicAlerts: alerts }),
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
