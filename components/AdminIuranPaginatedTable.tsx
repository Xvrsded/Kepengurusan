"use client";

import { usePagination } from "@/hooks/usePaginationHooks";
import { getIuranUserWithDetails } from "@/services/optimizedQueryService";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Wallet,
} from "lucide-react";

interface AdminIuranPaginatedTableProps {
  pageSize?: number;
  statusFilter?: "all" | "paid" | "unpaid" | "overdue";
  onRowClick?: (iuran: any) => void;
}

/**
 * Komponen Admin Tabel Iuran Warga dengan Pagination Standar
 *
 * Fitur:
 * - Menggunakan usePagination hook untuk standard pagination
 * - Menampilkan data dari getIuranUserWithDetails (JOIN profiles + iuran_master)
 * - Pagination controls: Previous, Angka Halaman, Next
 * - Status badge dengan warna yang berbeda
 * - Loading state dan error handling
 *
 * @example
 * <AdminIuranPaginatedTable
 *   pageSize={20}
 *   statusFilter="unpaid"
 *   onRowClick={(item) => console.log(item)}
 * />
 */
export function AdminIuranPaginatedTable({
  pageSize = 20,
  statusFilter = "all",
  onRowClick,
}: AdminIuranPaginatedTableProps) {
  const [mounted, setMounted] = useState(false);

  // Fetch function untuk pagination - menerima page dan pageSize
  const fetchIuranData = async (page: number, pageSize: number) => {
    try {
      // Menggunakan optimizedQueryService function
      const result = await getIuranUserWithDetails(
        { page, pageSize },
        {
          status: statusFilter !== "all" ? statusFilter : undefined,
        }
      );

      // Format response sesuai dengan UsePaginationResult interface
      return {
        data: result.data || [],
        pagination: {
          current_page: page,
          page_size: pageSize,
          total_items: result.pagination?.totalItems || 0,
          total_pages: result.pagination?.totalPages || 1,
          has_more: result.pagination?.hasMore || false,
        },
      };
    } catch (error) {
      console.error("Error fetching iuran data:", error);
      throw error;
    }
  };

  // Menggunakan hook pagination - akan auto-load pada mount
  const {
    items: iuranList,
    loading,
    error,
    currentPage,
    totalPages,
    pageSize: currentPageSize,
    totalItems,
    nextPage,
    prevPage,
  } = usePagination(fetchIuranData, {
    pageSize,
    initialPage: 1,
    autoLoad: true,
    onError: (err) => console.error("Pagination error:", err),
  });

  // Hydration guard - pastikan component hanya render setelah mount
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
          <h3 className="font-semibold text-red-900">Terjadi Kesalahan</h3>
          <p className="text-sm text-red-700 mt-1">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  // Status badge helper
  const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
      paid: "bg-emerald-100 text-emerald-800 border-emerald-300",
      unpaid: "bg-yellow-100 text-yellow-800 border-yellow-300",
      overdue: "bg-red-100 text-red-800 border-red-300",
      pending: "bg-blue-100 text-blue-800 border-blue-300",
    };

    const icons = {
      paid: <CheckCircle2 className="w-4 h-4" />,
      unpaid: <Clock3 className="w-4 h-4" />,
      overdue: <AlertCircle className="w-4 h-4" />,
      pending: <Loader2 className="w-4 h-4" />,
    };

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${
          styles[status as keyof typeof styles] ||
          "bg-gray-100 text-gray-800 border-gray-300"
        }`}
      >
        {icons[status as keyof typeof icons]}
        <span className="capitalize">{status}</span>
      </div>
    );
  };

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Empty state
  if (!loading && iuranList.length === 0) {
    return (
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-8 text-center">
        <Wallet className="w-12 h-12 mx-auto text-slate-400 mb-3" />
        <h3 className="font-semibold text-slate-900">Tidak ada data iuran</h3>
        <p className="text-sm text-slate-600 mt-1">
          Belum ada iuran untuk ditampilkan pada halaman ini
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
            Daftar Iuran Warga
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Menampilkan {(currentPage - 1) * currentPageSize + 1}-
            {Math.min(currentPage * currentPageSize, totalItems)} dari {totalItems}{" "}
            data
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Memuat...</span>
          </div>
        )}
      </div>

      {/* Table - Responsive design */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Nama Warga
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Jenis Iuran
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                Nominal
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">
                Status
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">
                Jatuh Tempo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {iuranList.map((item, idx) => (
              <tr
                key={item.id || idx}
                onClick={() => onRowClick?.(item)}
                className="hover:bg-blue-50/50 transition-colors cursor-pointer"
              >
                {/* Nama Warga */}
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-900">
                      {item.profiles?.full_name || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ID: {item.id?.substring(0, 8)}
                    </p>
                  </div>
                </td>

                {/* Jenis Iuran */}
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-700">
                    {item.iuran_master?.title || "-"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">
                    {item.iuran_master?.category || "-"}
                  </p>
                </td>

                {/* Nominal */}
                <td className="px-6 py-4 text-right">
                  <p className="font-semibold text-slate-900">
                    {formatCurrency(item.iuran_master?.amount || 0)}
                  </p>
                </td>

                {/* Status */}
                <td className="px-6 py-4 text-center">
                  <StatusBadge status={item.status || "pending"} />
                </td>

                {/* Jatuh Tempo */}
                <td className="px-6 py-4 text-center">
                  {item.iuran_master?.due_date ? (
                    <div>
                      <p className="text-sm text-slate-700">
                        {new Date(item.iuran_master.due_date).toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.iuran_master.period || "-"}
                      </p>
                    </div>
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls - Rapi dan Intuitif */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 1 || loading}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>

          {/* Pagination info */}
          <div className="px-4 py-2 bg-slate-50 rounded border border-slate-200">
            <p className="text-sm font-medium text-slate-900">
              Halaman <span className="font-bold">{currentPage}</span> dari{" "}
              <span className="font-bold">{totalPages}</span>
            </p>
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages || loading}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Halaman Selanjutnya"
          >
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        {/* Items per page info */}
        <div className="text-sm text-slate-600">
          <span className="font-medium">{iuranList.length}</span> item ditampilkan
          per halaman
        </div>
      </div>

      {/* Debug info (opsional, hapus di production) */}
      <div className="text-xs text-slate-500 text-center mt-4 p-2 bg-slate-50 rounded border border-slate-200">
        {loading && "Memuat data..."}
        {!loading && iuranList.length > 0 && "Data siap. Gunakan tombol navigasi untuk berpindah halaman."}
      </div>
    </div>
  );
}

export default AdminIuranPaginatedTable;
