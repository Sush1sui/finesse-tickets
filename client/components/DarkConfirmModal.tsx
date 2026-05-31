"use client";

import React from "react";
import { AlertTriangle, Info, X } from "lucide-react";

interface DarkConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export default function DarkConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}: DarkConfirmModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "info":
        return <Info className="h-6 w-6 text-[#FF5A36] drop-shadow-[0_0_6px_rgba(255,90,54,0.3)]" />;
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-[#FF5A36] drop-shadow-[0_0_6px_rgba(255,90,54,0.3)]" />;
      case "danger":
      default:
        return <AlertTriangle className="h-6 w-6 text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.3)]" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case "info":
        return "bg-[#FF5A36] hover:bg-[#FF6B4A] text-white shadow-lg shadow-orange-950/20 active:scale-95";
      case "warning":
        return "bg-[#FF5A36] hover:bg-[#FF6B4A] text-white shadow-lg shadow-orange-950/20 active:scale-95";
      case "danger":
      default:
        return "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-950/20 active:scale-95";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-zinc-950/65 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose} 
      />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/5 bg-[#2B2D31] p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Decorative subtle background brand light */}
        <div className={`absolute -top-12 -left-12 h-24 w-24 rounded-full blur-[40px] opacity-15 pointer-events-none ${
          type === "danger" ? "bg-red-500" : "bg-[#FF5A36]"
        }`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="flex gap-4 items-start mt-2">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-white/2 ${
            type === "danger" ? "border-red-500/20" : "border-[#FF5A36]/20"
          }`}>
            {getIcon()}
          </div>
          <div className="flex-1 space-y-1.5 min-w-0">
            <h3 className="text-sm font-extrabold text-white tracking-tight uppercase leading-none">
              {title}
            </h3>
            <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 text-xs font-bold text-zinc-400 hover:bg-white/10 hover:text-zinc-200 hover:border-white/10 transition-all active:scale-95 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`rounded-xl px-4 py-2.5 text-xs font-black transition-all cursor-pointer ${getConfirmButtonClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
