import { AlertTriangle, X } from "lucide-react";
import type { Task } from "../types/task";

export function ConfirmDialog({
  task,
  busy,
  onCancel,
  onConfirm,
}: {
  task: Task;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && !busy && onCancel()}>
      <section className="modal confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
        <div className="confirm-icon"><AlertTriangle size={23} /></div>
        <button className="icon-button confirm-x" onClick={onCancel} disabled={busy} aria-label="Закрыть">
          <X size={19} />
        </button>
        <h2 id="delete-title">Удалить задачу?</h2>
        <p>«{task.title}» будет удалена без возможности восстановления.</p>
        <div className="modal-actions">
          <button className="button button-secondary" onClick={onCancel} disabled={busy}>Отмена</button>
          <button className="button button-danger" onClick={onConfirm} disabled={busy}>
            {busy ? <><span className="spinner" /> Удаляю…</> : "Удалить задачу"}
          </button>
        </div>
      </section>
    </div>
  );
}
