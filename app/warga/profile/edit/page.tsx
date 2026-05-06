"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const supabaseUser = useAppStore((s) => s.supabaseUser);
  const userProfile = useAppStore((s) => s.userProfile);
  const syncSupabaseUser = useAppStore((s) => s.syncSupabaseUser);
  const setNotif = useAppStore((s) => s.setNotif);

  const [fullName, setFullName] = useState(userProfile.name || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(userProfile.photo_url || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!supabaseUser) {
      setNotif("Anda harus login untuk mengedit profil");
      return;
    }

    setIsLoading(true);
    let photoUrl = userProfile.photo_url || null;

    try {
      // Upload photo if selected
      if (photoFile) {
        setIsUploading(true);
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${supabaseUser.id}.${fileExt}`;
        const filePath = `${supabaseUser.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('profile')
          .upload(filePath, photoFile, { upsert: true });

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('profile')
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
        setIsUploading(false);
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          photo_url: photoUrl,
        })
        .eq('id', supabaseUser.id);

      if (updateError) {
        throw updateError;
      }

      // Sync updated profile
      await syncSupabaseUser();
      setNotif("Profil berhasil diperbarui");
      router.back();

    } catch (error: any) {
      console.error("Error updating profile:", error);
      setNotif(error.message || "Gagal memperbarui profil");
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Edit Profil</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Photo Upload */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-slate-200">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera size={32} className="text-slate-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                <Camera size={16} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-slate-500 text-center">
              Tap icon untuk mengubah foto profil
            </p>
          </div>
        </div>

        {/* Name Input */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Masukkan nama lengkap"
            className="w-full text-base text-slate-900 placeholder:text-slate-400 outline-none"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isLoading || !fullName.trim()}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>{isUploading ? "Mengupload foto..." : "Menyimpan..."}</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              <span>Simpan Perubahan</span>
            </>
          )}
        </button>
      </div>
    </main>
  );
}
