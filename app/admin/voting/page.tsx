"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { ArrowLeft, Trophy, Users, BarChart3, TrendingUp, Crown, Power, Plus, Trash2, X, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import BottomNav from "@/components/BottomNav";
import Notification from "@/components/Notification";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { createClient } from "@/lib/supabase/client";
import { getVotingStatus, toggleVotingStatus } from "@/app/warga/voting/actions";
import { toast } from "react-hot-toast";

export default function AdminVotingPage() {
  useAuthGuard();
  const router = useRouter();
  const supabase = createClient();
  
  // Store state
  const supabaseUser = useAppStore((s) => s.supabaseUser);
  const setNotif = useAppStore((s) => s.setNotif);
  
  // Local state - avoid global state for realtime data
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVotingActive, setIsVotingActive] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  
  // New state for candidate management
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  
  // Fetch lock to prevent spam
  const isFetchingRef = useRef(false);
  const realtimeTimeoutRef = useRef<any>(null);

  // Fetch voting data - proper pattern with dependency guard
  const fetchVotingData = useCallback(async () => {
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    
    try {
      console.log('[VOTING DASHBOARD] Fetching voting data');
      setLoading(true);
      
      // Fetch candidates purely
      const { data: cData, error: cErr } = await supabase
        .from('candidates')
        .select('*');
      
      if (cErr) {
        console.error('[VOTING DASHBOARD] Fetch candidates error:', cErr.message || cErr.details || JSON.stringify(cErr));
        setNotif({ title: "Error", message: "Gagal memuat data kandidat", variant: "warning", role: "admin" });
        return;
      }
      
      // Fetch all votes
      const { data: vData, error: vErr } = await supabase
        .from('votes')
        .select('candidate_id');
      
      if (vErr) {
        console.error('[VOTING DASHBOARD] Fetch votes error:', vErr.message || vErr.details || JSON.stringify(vErr));
        setNotif({ title: "Error", message: "Gagal memuat data suara", variant: "warning", role: "admin" });
        return;
      }
      
      // Combine data with JavaScript - calculate vote_count manually
      const candidatesWithVotes = (cData || []).map((candidate: any) => {
        const voteCount = (vData || []).filter((vote: any) => vote.candidate_id === candidate.id).length;
        return {
          ...candidate,
          vote_count: voteCount,
          created_at: candidate.created_at || new Date().toISOString()
        };
      });
      
      // Sort by vote_count descending
      candidatesWithVotes.sort((a: any, b: any) => b.vote_count - a.vote_count);
      
      console.log('[VOTING DASHBOARD] Fetched:', candidatesWithVotes.length, 'candidates');
      setCandidates(candidatesWithVotes);
    } catch (err) {
      console.error('[VOTING DASHBOARD] Unexpected error:', err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [supabase, setNotif]);

  const fetchVotingStatus = useCallback(async () => {
    try {
      const status = await getVotingStatus();
      setIsVotingActive(status);
    } catch (error) {
      console.error("Error fetching voting status:", error);
    }
  }, []);

  const handleToggleVoting = async () => {
    setShowToggleConfirm(false);
    setIsToggling(true);
    try {
      const result = await toggleVotingStatus(isVotingActive);
      if (result.success) {
        toast.success(isVotingActive ? "Pemilihan ditutup" : "Pemilihan dibuka");
        // Update local state immediately
        setIsVotingActive(!isVotingActive);
        // Refresh router to clear cache
        router.refresh();
      } else {
        toast.error(result.error || "Gagal mengubah status pemilihan");
      }
    } catch (error) {
      console.error("Error toggling voting status:", error);
      toast.error("Terjadi kesalahan saat mengubah status");
    } finally {
      setIsToggling(false);
    }
  };

  const fetchProfiles = useCallback(async () => {
    try {
      console.log('[VOTING DASHBOARD] Fetching profiles...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role')
        .eq('role', 'warga');
      
      console.log('WARGA DATA:', data);
      console.log('WARGA ERROR:', error);
      
      if (error) {
        console.error('[VOTING DASHBOARD] Fetch profiles error:', error);
        return;
      }
      
      console.log('[VOTING DASHBOARD] Setting profiles:', data?.length || 0, 'items');
      setProfiles(data || []);
    } catch (err) {
      console.error('[VOTING DASHBOARD] Unexpected error fetching profiles:', err);
    }
  }, [supabase]);

  const handleAddCandidate = async () => {
    if (!selectedProfileId) {
      toast.error('Pilih warga terlebih dahulu');
      return;
    }

    const selectedProfile = profiles.find(p => p.id === selectedProfileId);
    if (!selectedProfile) {
      toast.error('Data warga tidak ditemukan');
      return;
    }

    console.log('SELECTED PROFILE:', selectedProfile);

    setIsAddingCandidate(true);
    try {
      const candidateName = (!selectedProfile.full_name || selectedProfile.full_name === "User Lama") ? "Nama belum diisi" : selectedProfile.full_name;
      
      const { error } = await supabase
        .from('candidates')
        .insert({
          name: candidateName,
          photo_url: null,
          is_active: true
        });

      if (error) {
        console.error('[VOTING DASHBOARD] Add candidate error:', error);
        toast.error('Gagal menambahkan kandidat');
        return;
      }

      console.log('[VOTING DASHBOARD] Candidate added:', candidateName);
      toast.success('Kandidat berhasil ditambahkan');
      setSelectedProfileId('');
      fetchVotingData();
    } catch (err) {
      console.error('[VOTING DASHBOARD] Unexpected error adding candidate:', err);
      toast.error('Terjadi kesalahan saat menambahkan kandidat');
    } finally {
      setIsAddingCandidate(false);
    }
  };

  const handleDeleteCandidate = async (candidateId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kandidat ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', candidateId);

      if (error) {
        console.error('[VOTING DASHBOARD] Delete candidate error:', error);
        toast.error('Gagal menghapus kandidat');
        return;
      }

      toast.success('Kandidat berhasil dihapus');
      fetchVotingData();
    } catch (err) {
      console.error('[VOTING DASHBOARD] Unexpected error deleting candidate:', err);
      toast.error('Terjadi kesalahan saat menghapus kandidat');
    }
  };

  // Initial fetch - proper dependency
  useEffect(() => {
    if (!supabaseUser?.id) return;
    fetchVotingData();
    fetchVotingStatus();
    fetchProfiles();
  }, [fetchVotingData, fetchVotingStatus, fetchProfiles, supabaseUser?.id]);

  // Realtime subscription - mandatory
  useEffect(() => {
    if (!supabaseUser?.id) return;
    
    const handleRealtimeChange = () => {
      if (isFetchingRef.current) return;
      clearTimeout(realtimeTimeoutRef.current);
      realtimeTimeoutRef.current = setTimeout(() => {
        console.log('[VOTING DASHBOARD] Debounced realtime fetch');
        fetchVotingData();
      }, 500);
    };
    
    const channel = supabase
      .channel('voting-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'candidates'
      }, (payload: any) => {
        console.log('[VOTING DASHBOARD] Realtime INSERT change:', payload);
        handleRealtimeChange();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'candidates'
      }, (payload: any) => {
        console.log('[VOTING DASHBOARD] Realtime UPDATE change:', payload);
        handleRealtimeChange();
      })
      .subscribe((status: any) => {
        if (status === 'SUBSCRIBED') {
          console.log('[VOTING DASHBOARD] Realtime subscribed');
        }
      });

    return () => {
      console.log('[VOTING DASHBOARD] Cleaning up realtime');
      clearTimeout(realtimeTimeoutRef.current);
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchVotingData, supabaseUser?.id]);

  // Format data for chart
  const chartData = useMemo(() => {
    return candidates.map((c) => ({
      name: c.name || "Unknown",
      votes: c.vote_count || 0,
      id: c.id
    }));
  }, [candidates]);

  // Statistics
  const stats = useMemo(() => {
    const totalVotes = candidates.reduce((sum, c) => sum + (c.vote_count || 0), 0);
    const sorted = [...candidates].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
    const leader = sorted[0];
    const candidateCount = candidates.length;
    
    // Calculate percentages
    const withPercentage = chartData.map((item) => ({
      ...item,
      percentage: totalVotes > 0 ? ((item.votes / totalVotes) * 100).toFixed(1) : 0
    }));
    
    return {
      totalVotes,
      leader: leader ? {
        ...leader,
        name: leader.name || "Unknown",
        vote_count: leader.vote_count || 0
      } : null,
      candidateCount,
      withPercentage
    };
  }, [candidates, chartData]);

  // Anti-bug rule: Don't fetch before user ready
  if (!supabaseUser?.id) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-violet-200 border-t-violet-500 animate-spin" />
          <span className="text-slate-500 font-bold">Memuat user...</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-violet-200 border-t-violet-500 animate-spin" />
          <span className="text-slate-500 font-bold">Memuat data voting...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-md mx-auto bg-slate-50 relative overflow-x-hidden overflow-y-auto pb-28" style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))" }}>
      <Notification />
      
      {/* Header */}
      <div className="bg-linear-to-b from-violet-500 via-purple-600 to-indigo-700 text-white px-6 pt-7 pb-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-8 h-28 w-28 rounded-full bg-violet-200/35 blur-3xl" />
        <div className="absolute top-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-purple-200/20 blur-3xl" />
        
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/20 bg-[rgba(255,255,255,0.14)] px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-violet-50 backdrop-blur-sm">
              <Trophy size={12} className="mr-1.5" /> Hasil Voting
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight">Dashboard Pemilihan RT</h1>
            <p className="text-sm text-violet-50/92 mt-3 leading-relaxed max-w-80">Pantau hasil voting secara realtime dengan visualisasi data modern.</p>
          </div>
          <button onClick={() => router.push("/admin")} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-[rgba(255,255,255,0.14)] text-white shadow-lg backdrop-blur-sm transition-all hover:scale-105 active:scale-95 shrink-0">
            <ArrowLeft size={16} />
          </button>
        </div>
      </div>

      {/* Kontrol Pemilihan */}
      <div className="px-6 mt-4">
        <div className="rounded-4xl border border-violet-100/80 bg-white/90 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isVotingActive ? 'bg-green-100 border border-green-200 text-green-600' : 'bg-amber-100 border border-amber-200 text-amber-600'
              }`}>
                <Power size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-violet-600">Status Pemilihan</p>
                <p className={`text-sm font-black ${isVotingActive ? 'text-green-600' : 'text-amber-600'}`}>
                  {isVotingActive ? 'Aktif' : 'Ditutup'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (!isVotingActive) {
                  setShowToggleConfirm(true);
                } else {
                  handleToggleVoting();
                }
              }}
              disabled={isToggling}
              className={`px-4 py-2 rounded-xl font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 ${
                isVotingActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isToggling ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  {isVotingActive ? 'Tutup Pemilihan' : 'Buka Pemilihan'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Lock Warning */}
      {isVotingActive && (
        <div className="px-6 mt-4">
          <div className="rounded-4xl border border-amber-200 bg-amber-50 shadow-sm p-4 flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-600" />
            <p className="text-sm font-bold text-amber-800">Pemilihan sedang berlangsung. Penambahan/Penghapusan kandidat dikunci.</p>
          </div>
        </div>
      )}

      {/* Add Candidate Form */}
      {!isVotingActive && (
        <div className="px-6 mt-4">
          <div className="rounded-4xl border border-violet-100/80 bg-white/90 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                <Plus size={15} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-600">Tambah Kandidat</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Pilih Warga</label>
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="">-- Pilih Warga --</option>
                  {profiles.map((profile) => {
                    const displayName = (!profile.full_name || profile.full_name === "User Lama") ? "Nama belum diisi" : profile.full_name;
                    const displayPhone = (!profile.phone || profile.phone === "No HP") ? "No HP belum diisi" : profile.phone;
                    return (
                      <option key={profile.id} value={profile.id}>
                        {displayName} - {displayPhone}
                      </option>
                    );
                  })}
                </select>
                {profiles.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Tidak ada data warga</p>
                )}
              </div>
              <button
                onClick={handleAddCandidate}
                disabled={isAddingCandidate || !selectedProfileId}
                className="w-full rounded-2xl bg-linear-to-r from-violet-600 to-purple-500 py-3 text-xs font-black text-white shadow-lg shadow-violet-100 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isAddingCandidate ? 'Menambahkan...' : 'Tambah Kandidat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-6 mt-4 space-y-4 pb-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-4xl border border-violet-100/80 bg-white/90 shadow-sm p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                <BarChart3 size={12} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-600">Total Suara</p>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.totalVotes}</p>
          </div>
          <div className="rounded-4xl border border-green-100/80 bg-white/90 shadow-sm p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-green-600">
                <Crown size={12} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-green-600">Terdepan</p>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.leader?.vote_count || 0}</p>
          </div>
          <div className="rounded-4xl border border-blue-100/80 bg-white/90 shadow-sm p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Users size={12} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Kandidat</p>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.candidateCount}</p>
          </div>
        </div>

        {/* Leader Card */}
        {stats.leader && (
          <div className="rounded-4xl border border-green-100/80 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-2xl bg-green-100 border border-green-200 flex items-center justify-center text-green-600">
                <TrendingUp size={15} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-green-600">Kandidat Terdepan</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                {stats.leader.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-900">{stats.leader.name}</h3>
                <p className="text-sm text-slate-600">Kandidat RT</p>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-sm font-black text-green-600">{stats.leader.vote_count} suara</p>
                  <p className="text-xs text-slate-500">
                    {stats.totalVotes > 0 ? ((stats.leader.vote_count / stats.totalVotes) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
              <Crown size={32} className="text-yellow-500" />
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="rounded-4xl border border-violet-100/80 bg-white/90 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
              <BarChart3 size={15} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-600">Grafik Perolehan Suara</p>
          </div>
          
          {candidates.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700">Belum Ada Data</p>
                <p className="text-xs text-slate-500 mt-1">Tambahkan kandidat untuk memulai voting</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.withPercentage}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any) => [`${value} suara`, 'Total']}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }}
                />
                <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                  {stats.withPercentage.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.id === stats.leader?.id ? '#22c55e' : '#8b5cf6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Candidate List with Progress */}
        <div className="rounded-4xl border border-violet-100/80 bg-white/90 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
              <Users size={15} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-600">Detail Perolehan Suara</p>
          </div>
          
          {candidates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm font-bold text-slate-700">Belum Ada Kandidat</p>
              <p className="text-xs text-slate-500 mt-1">Tambahkan kandidat di halaman Calon</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.withPercentage.map((item, index) => {
                const isLeader = item.id === stats.leader?.id;
                const percentage = parseFloat(String(item.percentage));
                
                return (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          isLeader ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-violet-500 to-purple-500'
                        }`}>
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                            {item.name}
                            {isLeader && <Crown size={14} className="text-yellow-500" />}
                          </p>
                          <p className="text-xs text-slate-500">{item.votes} suara</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-black ${isLeader ? 'text-green-600' : 'text-violet-600'}`}>
                          {item.percentage}%
                        </p>
                        {!isVotingActive && (
                          <button
                            onClick={() => handleDeleteCandidate(item.id)}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          isLeader ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-violet-500 to-purple-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Toggle Confirmation Dialog */}
      {showToggleConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Konfirmasi Buka Pemilihan</h3>
              </div>
              <button
                onClick={() => setShowToggleConfirm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-slate-600 mb-6">
              Apakah Anda yakin? Setelah dibuka, daftar kandidat tidak bisa diubah lagi.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowToggleConfirm(false)}
                className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold transition-colors hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                onClick={handleToggleVoting}
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors"
              >
                Ya, Buka
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
