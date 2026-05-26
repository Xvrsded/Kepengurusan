import { useCallback, useState, useEffect, useRef } from "react";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PaginationState<T> {
  items: T[];
  loading: boolean;
  error: Error | null;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasMore: boolean;
}

export interface PaginationCallbacks {
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  reset: () => void;
}

export type UsePaginationResult<T> = PaginationState<T> & PaginationCallbacks;

export interface InfiniteScrollState<T> {
  items: T[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  cursor?: string;
}

export interface InfiniteScrollCallbacks {
  loadMore: () => Promise<void>;
  reset: () => void;
  setItems: (items: T[]) => void;
}

export type UseInfiniteScrollResult<T> = InfiniteScrollState<T> & InfiniteScrollCallbacks;

// ============================================================================
// STANDARD PAGINATION HOOK (offset-based)
// Untuk admin tables dengan tombol Next/Previous
// ============================================================================

/**
 * Hook untuk standard offset-based pagination
 * 
 * Skenario: Admin tables dengan pagination controls (Next/Previous)
 * 
 * @param fetchFunction - Function yang menerima (page, pageSize)
 * @returns Pagination state dan callbacks
 * 
 * @example
 * const { items, currentPage, totalPages, nextPage, prevPage } = usePagination(
 *   getLettersWithProfiles,
 *   { pageSize: 20 }
 * );
 */
export function usePagination<T>(
  fetchFunction: (page: number, pageSize: number) => Promise<{
    data: T[];
    pagination: {
      current_page: number;
      page_size: number;
      total_items: number;
      total_pages: number;
      has_more: boolean;
    };
  }>,
  options?: {
    initialPage?: number;
    pageSize?: number;
    onError?: (error: Error) => void;
    autoLoad?: boolean;
  }
): UsePaginationResult<T> {
  const initialPage = options?.initialPage || 1;
  const pageSize = options?.pageSize || 20;
  const autoLoad = options?.autoLoad !== false;

  const [state, setState] = useState<PaginationState<T>>({
    items: [],
    loading: false,
    error: null,
    currentPage: initialPage,
    totalPages: 0,
    pageSize,
    totalItems: 0,
    hasMore: false,
  });

  const isLoadingRef = useRef(false);

  const goToPage = useCallback(
    async (page: number) => {
      if (isLoadingRef.current) return;

      try {
        isLoadingRef.current = true;
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const result = await fetchFunction(page, pageSize);

        setState({
          items: result.data,
          loading: false,
          error: null,
          currentPage: result.pagination.current_page,
          totalPages: result.pagination.total_pages,
          pageSize: result.pagination.page_size,
          totalItems: result.pagination.total_items,
          hasMore: result.pagination.has_more,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to fetch data");
        setState((prev) => ({
          ...prev,
          loading: false,
          error,
        }));
        options?.onError?.(error);
      } finally {
        isLoadingRef.current = false;
      }
    },
    [fetchFunction, pageSize, options]
  );

  const nextPage = useCallback(async () => {
    if (state.hasMore && !state.loading) {
      await goToPage(state.currentPage + 1);
    }
  }, [goToPage, state.currentPage, state.hasMore, state.loading]);

  const prevPage = useCallback(async () => {
    if (state.currentPage > 1 && !state.loading) {
      await goToPage(state.currentPage - 1);
    }
  }, [goToPage, state.currentPage, state.loading]);

  const reset = useCallback(async () => {
    await goToPage(initialPage);
  }, [goToPage, initialPage]);

  // Auto load on mount
  useEffect(() => {
    if (autoLoad) {
      goToPage(initialPage);
    }
  }, []);

  return {
    ...state,
    nextPage,
    prevPage,
    goToPage,
    reset,
  };
}

// ============================================================================
// INFINITE SCROLL HOOK (cursor-based)
// Untuk skenario warga page dengan infinite scroll
// ============================================================================

/**
 * Hook untuk infinite scroll / cursor-based pagination
 * 
 * Skenario: Infinite scroll dengan append data
 * 
 * @param fetchFunction - Function yang menerima cursor
 * @returns Infinite scroll state dan callbacks
 * 
 * @example
 * const { items, hasMore, loadMore } = useInfiniteScroll(
 *   (cursor) => getLettersWithProfiles({ page: 1, pageSize: 20 })
 * );
 */
export function useInfiniteScroll<T>(
  fetchFunction: (cursor?: string) => Promise<{
    items: T[];
    nextCursor?: string | null;
    hasMore: boolean;
  }>,
  options?: {
    initialLoad?: boolean;
    pageSize?: number;
    onError?: (error: Error) => void;
    onLoadMore?: (items: T[]) => void;
  }
): UseInfiniteScrollResult<T> {
  const [state, setState] = useState<InfiniteScrollState<T>>({
    items: [],
    loading: false,
    error: null,
    hasMore: true,
    cursor: undefined,
  });

  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    // Prevent duplicate requests
    if (isLoadingRef.current || state.loading || !state.hasMore) {
      return;
    }

    try {
      isLoadingRef.current = true;
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const result = await fetchFunction(state.cursor);

      setState((prev) => ({
        items: [...prev.items, ...result.items],
        loading: false,
        error: null,
        hasMore: result.hasMore,
        cursor: result.nextCursor || undefined,
      }));

      options?.onLoadMore?.(result.items);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load more");
      setState((prev) => ({
        ...prev,
        loading: false,
        error,
      }));
      options?.onError?.(error);
    } finally {
      isLoadingRef.current = false;
    }
  }, [fetchFunction, state.cursor, state.hasMore, state.loading, options]);

  const reset = useCallback(() => {
    setState({
      items: [],
      loading: false,
      error: null,
      hasMore: true,
      cursor: undefined,
    });
    isLoadingRef.current = false;
  }, []);

  const setItems = useCallback((items: T[]) => {
    setState((prev) => ({
      ...prev,
      items,
    }));
  }, []);

  // Auto load on mount
  useEffect(() => {
    if (options?.initialLoad !== false) {
      loadMore();
    }
  }, []);

  return {
    ...state,
    loadMore,
    reset,
    setItems,
  };
}

// ============================================================================
// INTERSECTION OBSERVER HOOK
// Trigger infinite scroll saat element terlihat di viewport
// ============================================================================

/**
 * Hook untuk intersection observer
 * Trigger callback ketika element terlihat di viewport
 * 
 * @param callback - Function yang dipanggil saat element terlihat
 * @param options - IntersectionObserver options
 * @returns Ref untuk attach ke element
 * 
 * @example
 * const triggerRef = useIntersectionObserver(() => loadMore());
 * return <div ref={triggerRef}>Loading...</div>;
 */
export function useIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit
) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
      }
    }, {
      threshold: 0.1,
      rootMargin: "100px",
      ...options,
    });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [callback, options]);

  return elementRef;
}

// ============================================================================
// COMBINED HOOK - Mendukung kedua mode
// ============================================================================

export type PaginationMode = "standard" | "infinite";

/**
 * Hook yang mendukung kedua mode: standard pagination dan infinite scroll
 * 
 * @param fetchFunction - Fetch function (sesuai mode)
 * @param mode - Pagination mode: "standard" atau "infinite"
 * @param options - Configuration options
 * 
 * @example
 * // Standard mode
 * const result = useCombinedPagination(getLettersWithProfiles, "standard");
 * 
 * // Infinite mode
 * const result = useCombinedPagination(getLettersWithProfiles, "infinite");
 */
export function useCombinedPagination<T>(
  fetchFunction: any,
  mode: PaginationMode = "standard",
  options?: any
): any {
  if (mode === "infinite") {
    return useInfiniteScroll(fetchFunction, options);
  }
  return usePagination(fetchFunction, options);
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/*
// EXAMPLE 1: Standard Pagination (Admin Table)
import { usePagination } from '@/hooks/usePaginationHooks';
import { getLettersWithProfiles } from '@/services/optimizedQueryService';

export function AdminLettersPage() {
  const {
    items: letters,
    loading,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    error,
  } = usePagination(getLettersWithProfiles, { pageSize: 20 });

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      
      <div className="space-y-2">
        {letters.map((letter) => (
          <div key={letter.id}>
            <p>{letter.type}</p>
            <p>{letter.profiles?.full_name}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={prevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={nextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

// EXAMPLE 2: Infinite Scroll
import { useInfiniteScroll, useIntersectionObserver } from '@/hooks/usePaginationHooks';
import { getLettersWithProfiles } from '@/services/optimizedQueryService';

export function WargaLettersPage() {
  const {
    items: letters,
    loading,
    hasMore,
    loadMore,
    error,
  } = useInfiniteScroll(
    (cursor) => getLettersWithProfiles({ page: 1, pageSize: 20 })
  );

  const triggerRef = useIntersectionObserver(loadMore);

  return (
    <div>
      {error && <div>Error: {error.message}</div>}
      
      <div className="space-y-2">
        {letters.map((letter) => (
          <div key={letter.id}>
            <p>{letter.type}</p>
            <p>{letter.profiles?.full_name}</p>
          </div>
        ))}
      </div>

      {hasMore && (
        <div ref={triggerRef} className="py-4 text-center">
          {loading ? "Loading..." : "Scroll to load more"}
        </div>
      )}
    </div>
  );
}

// EXAMPLE 3: Iuran dengan Pagination
import { usePagination } from '@/hooks/usePaginationHooks';
import { getIuranUserWithDetails } from '@/services/optimizedQueryService';

export function AdminIuranPage() {
  const {
    items: iuranData,
    loading,
    currentPage,
    totalPages,
    pageSize,
    nextPage,
    prevPage,
  } = usePagination(
    (page, pageSize) => 
      getIuranUserWithDetails(
        { page, pageSize },
        { status: "unpaid" }
      ),
    { pageSize: 25 }
  );

  return (
    <div>
      {loading && <div>Loading...</div>}
      
      <div className="space-y-3">
        {iuranData.map((item) => (
          <div key={item.id} className="border p-3 rounded">
            <p className="font-semibold">{item.profiles?.full_name}</p>
            <p>{item.iuran_master?.title}</p>
            <p>Rp {item.iuran_master?.amount?.toLocaleString('id-ID')}</p>
            <p className={item.status === 'paid' ? 'text-green-600' : 'text-red-600'}>
              {item.status}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
        <span>{currentPage} / {totalPages}</span>
        <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
      </div>
    </div>
  );
}

// EXAMPLE 4: Messages dengan Infinite Scroll
import { useInfiniteScroll, useIntersectionObserver } from '@/hooks/usePaginationHooks';
import { getMessagesWithProfiles } from '@/services/optimizedQueryService';

export function ChatPage({ userId, targetId }: { userId: string; targetId: string }) {
  const {
    items: messages,
    loading,
    hasMore,
    loadMore,
  } = useInfiniteScroll(
    (cursor) => getMessagesWithProfiles(userId, targetId, { page: 1, pageSize: 50 })
  );

  const triggerRef = useIntersectionObserver(loadMore);

  return (
    <div className="flex flex-col h-full">
      {hasMore && (
        <div ref={triggerRef} className="py-2 text-center text-sm text-gray-500">
          {loading ? "Loading older messages..." : "Scroll up to see more"}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-lg ${
              msg.sender_id === userId ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              <p>{msg.message}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(msg.created_at).toLocaleTimeString('id-ID')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// EXAMPLE 5: Panic Alerts dengan Pagination
import { usePagination } from '@/hooks/usePaginationHooks';
import { getPanicAlertsWithProfiles } from '@/services/optimizedQueryService';

export function AdminPanicAlertsPage() {
  const {
    items: alerts,
    loading,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
  } = usePagination(
    (page, pageSize) =>
      getPanicAlertsWithProfiles(
        { page, pageSize },
        { status: "active" }
      ),
    { pageSize: 15 }
  );

  return (
    <div>
      {loading && <div>Loading...</div>}
      
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="bg-red-50 border border-red-200 p-4 rounded">
            <p className="font-semibold text-red-700">{alert.profiles?.full_name}</p>
            <p className="text-sm">{alert.message}</p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(alert.created_at).toLocaleString('id-ID')}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={prevPage} disabled={currentPage === 1}>Prev</button>
        <span>{currentPage} / {totalPages}</span>
        <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
      </div>
    </div>
  );
}
*/
