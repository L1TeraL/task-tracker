import { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export interface ToastMessage {
  id: number;
  text: string;
  type: "success" | "error";
}

export function Toast({
  toast,
  onClose,
}: {
  toast: ToastMessage | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onClose, 3600);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const Icon = toast.type === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div className={`toast toast-${toast.type}`} role="status" aria-live="polite">
      <Icon size={19} />
      <span>{toast.text}</span>
      <button className="icon-button toast-close" onClick={onClose} aria-label="Закрыть уведомление">
        <X size={16} />
      </button>
    </div>
  );
}
