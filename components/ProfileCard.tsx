"use client";

import { User } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

type ProfileCardProps = {
  showEditButton?: boolean;
  onEditClick?: () => void;
};

export default function ProfileCard({ showEditButton = false, onEditClick }: ProfileCardProps) {
  const userProfile = useAppStore((s) => s.userProfile);

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-slate-200 shadow-md">
          {userProfile.photo_url ? (
            <img
              src={userProfile.photo_url}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {getInitials(userProfile.name)}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900">
            {userProfile.name || "Nama belum tersedia"}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {userProfile.phone || "Nomor HP belum tersedia"}
          </p>
        </div>

        {/* Edit Button */}
        {showEditButton && onEditClick && (
          <button
            onClick={onEditClick}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <User size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
