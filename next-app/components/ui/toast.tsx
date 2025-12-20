"use client";

import { useCallback, useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  const colors = {
    success: {
      bg: "rgba(34, 197, 94, 0.15)",
      border: "#22c55e",
      text: "#22c55e",
      icon: "✓",
    },
    error: {
      bg: "rgba(239, 68, 68, 0.15)",
      border: "#ef4444",
      text: "#ef4444",
      icon: "✕",
    },
    info: {
      bg: "rgba(59, 130, 246, 0.15)",
      border: "#3b82f6",
      text: "#3b82f6",
      icon: "ℹ",
    },
  };

  const style = colors[type];

  return (
    <div
      style={{
        position: "fixed",
        top: "1rem",
        right: isVisible && !isExiting ? "1rem" : "-400px",
        zIndex: 9999,
        minWidth: "300px",
        maxWidth: "500px",
        padding: "1rem 1.25rem",
        background: style.bg,
        border: `2px solid ${style.border}`,
        borderRadius: "8px",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        transition: "right 0.3s ease-out",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: style.border,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.875rem",
          fontWeight: "bold",
          flexShrink: 0,
        }}
      >
        {style.icon}
      </div>

      {/* Message */}
      <div
        style={{
          flex: 1,
          color: style.text,
          fontSize: "0.9375rem",
          fontWeight: "500",
          lineHeight: "1.4",
        }}
      >
        {message}
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        style={{
          background: "transparent",
          border: "none",
          color: style.text,
          cursor: "pointer",
          fontSize: "1.25rem",
          lineHeight: "1",
          padding: "0.25rem",
          opacity: 0.7,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

// Toast Container Component
interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: number) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            position: "fixed",
            top: `${1 + index * 5}rem`,
            right: 0,
            zIndex: 9999,
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </>
  );
}
