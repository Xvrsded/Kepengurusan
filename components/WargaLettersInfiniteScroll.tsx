"use client";

import { useInfiniteScroll, useIntersectionObserver } from "@/hooks/usePaginationHooks";
import { getLettersWithProfiles } from "@/services/optimizedQueryService";
import { useState, useEffect } from "react";
import {
  Loader2,
  AlertCircle,
  FileText,
  CheckCircle2,
  Clock3,
  XCircle,
  ChevronRight,
} from "lucide-react";

interface WargaLettersInfiniteScrollProps {
  pageSize?: number;
  statusFilter?: "all" | "pending" | "approved" | "rejected";
  userId?: string;
  onLetterClick?: (letter: any) => void;
}

/**
 * Komponen Warga Letters dengan Infinite Scroll
 *
 * Fitur:
 * - Menggunakan useInfiniteScroll untuk append data otomatis
 * - Intersection observer untuk auto-trigger load more
 * - Data dari getLettersWithProfiles (JOIN letters + profiles)
 * - Tombol "Muat Lebih Banyak" atau auto-scroll
 * - Status badge dengan icon
 * - Loading state per batch
 *
 * @example
 * <WargaLettersInfiniteScroll
 *   pageSize={15}
 *   statusFilter="pending"
 *   userId={currentUserId}
 * />
 */
export function WargaLettersInfiniteScroll({
  pageSize = 15,
  statusFilter = "all",
  userId,
  onLetterClick,
}: WargaLettersInfiniteScrollProps) {
  const [mounted, setMounted] = useState(false);
  const [manualLoadMore, setManualLoadMore] = useState(false);

  // Fetch function untuk infinite scroll - menerima cursor (tidak digunakan di contoh ini, bisa di-extend)
  const fetchLettersData = async (cursor?: string) => {
    try {
      // Menggunakan optimizedQueryService function
      const result = await getLettersWithProfiles(
        { page: 1, pageSize }, // Page selalu 1, tapi akan di-offset berdasarkan item count
        {
          userId: userId,
          status: statusFilter !== "all" ? statusFilter : undefined,
        }
      );

      // Format response sesuai dengan UseInfiniteScrollResult interface
      return {
        items: result.data || [],
        nextCursor: cursor || undefined, // Bisa di-extend dengan real cursor
        hasMore: result.pagination?.hasMore || false,
      };
    } catch (error) {
      console.error("Error fetching letters data:", error);
      throw error;
    }
  };

  // Menggunakan hook infinite scroll
  const {
    items: lettersList,
    loading,
    error,
    hasMore,
    loadMore,
  } = useInfiniteScroll(fetchLettersData, {
    initialLoad: true,
    pageSize,
    onError: (err) => console.error("Infinite scroll error:", err),
    onLoadMore: (newItems) => {
      console.log(`Loaded ${newItems.length} more items`);
    },
  });

  // Trigger ref untuk auto-load more saat scroll
  const triggerRef = useIntersectionObserver(() => {
    if (hasMore && !loading && mounted) {
      loadMore();
    }
  });

  // Hydration guard
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Gagal Memuat Surat</h3>
          <p className="text-sm text-red-700 mt-1">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Status badge helper
  const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      approved: "bg-emerald-100 text-emerald-800 border-emerald-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
    };

    const icons = {
      pending: <Clock3 className="w-4 h-4" />,
      approved: <CheckCircle2 className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
    };

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${
          styles[status as keyof typeof styles] ||
          "bg-gray-100 text-gray-800 border-gray-300"
        }`}
      >
        {icons[status as keyof typeof icons]}
        <span className="capitalize">
          {status === "pending"
            ? "Menunggu"
            : status === "approved"
              ? "Disetujui"
              : "Ditolak"}
        </span>
      </div>
    );
  };

  // Empty state
  if (!loading && lettersList.length === 0) {
    return (
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-8 text-center">
        <FileText className="w-12 h-12 mx-auto text-slate-400 mb-3" />
        <h3 className="font-semibold text-slate-900">Belum ada surat</h3>
        <p className="text-sm text-slate-600 mt-1">
          Anda belum mengajukan permohonan surat apapun
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header dengan info */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Riwayat Surat Pengajuan
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Total {lettersList.length} surat ditampilkan
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Memuat...</span>
          </div>
        )}
      </div>

      {/* Letter Cards - Infinite Scroll Container */}
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        {lettersList.map((letter, idx) => (
          <div
            key={letter.id || idx}
            onClick={() => onLetterClick?.(letter)}
            className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {letter.type || "Surat"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ID: {letter.id?.substring(0, 12)}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
            </div>

            {/* Card Body */}
            <div className="space-y-2 mb-3">
              {letter.purpose && (
                <p className="text-sm text-slate-700 line-clamp-2">
                  <span className="text-slate-600">Keperluan: </span>
                  {letter.purpose}
                </p>
              )}
              {letter.profiles?.full_name && (
                <p className="text-sm text-slate-700">
                  <span className="text-slate-600">Atas Nama: </span>
                  {letter.profiles.full_name}
                </p>
              )}
            </div>

            {/* Card Footer - Status dan Tanggal */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <StatusBadge status={letter.status || "pending"} />
              <p className="text-xs text-slate-500">
                {new Date(letter.created_at).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Optional notes */}
            {letter.notes && (
              <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-100">
                <p className="text-xs text-blue-800">
                  <span className="font-medium">Catatan: </span>
                  {letter.notes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More Trigger - Intersection Observer Point */}
      {hasMore && (
        <div
          ref={triggerRef}
          className="py-6 text-center border-2 border-dashed border-slate-300 rounded-lg bg-slate-50"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-sm text-blue-600 font-medium">
                Memuat surat lainnya...
              </span>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-700 mb-3">
                Scroll untuk muat surat lebih banyak
              </p>
              <button
                onClick={loadMore}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                Muat Lebih Banyak
              </button>
            </>
          )}
        </div>
      )}

      {/* End of list message */}
      {!hasMore && lettersList.length > 0 && (
        <div className="py-6 text-center bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">
            Anda sudah melihat semua surat pengajuan
          </p>
        </div>
      )}

      {/* Debug info (opsional, hapus di production) */}
      <div className="text-xs text-slate-500 text-center mt-4 p-2 bg-slate-50 rounded border border-slate-200">
        {lettersList.length} surat dimuat • Infinite scroll
        {hasMore ? " aktif" : " selesai"}
      </div>
    </div>
  );
}

export default WargaLettersInfiniteScroll;
