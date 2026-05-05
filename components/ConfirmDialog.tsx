"use client";

import { X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "danger",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      confirm: "bg-rose-600 hover:bg-rose-700 text-white",
      icon: "bg-rose-100 text-rose-600",
    },
    warning: {
      confirm: "bg-amber-600 hover:bg-amber-700 text-white",
      icon: "bg-amber-100 text-amber-600",
    },
    info: {
      confirm: "bg-blue-600 hover:bg-blue-700 text-white",
      icon: "bg-blue-100 text-blue-600",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${styles.icon}`}>
            <X size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold transition-colors hover:bg-slate-200"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-colors ${styles.confirm}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
