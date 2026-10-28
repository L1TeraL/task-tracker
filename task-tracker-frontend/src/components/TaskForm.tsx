import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Task, TaskCreate, TaskStatus } from "../types/task";
import { STATUS_LABELS } from "../types/task";

interface Props {
  task: Task | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (data: TaskCreate) => Promise<void>;
}

export function TaskForm({ task, busy, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "todo");
  const [error, setError] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Добавь название задачи.");
      return;
    }
    if (trimmed.length > 200) {
      setError("Название должно быть не длиннее 200 символов.");
      return;
    }
    setError("");
    try {
      await onSubmit({ title: trimmed, description: description.trim(), status });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить задачу.");
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <div className="modal-head">
          <div>
            <p className="eyebrow">{task ? `ЗАДАЧА #${task.id}` : "НОВАЯ ЗАДАЧА"}</p>
            <h2 id="form-title">{task ? "Редактировать задачу" : "Создать задачу"}</h2>
          </div>
          <button className="icon-button" onClick={onClose} disabled={busy} aria-label="Закрыть форму">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="task-form">
          <label className="field">
            <span>Название <b>*</b></span>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например, изучить FastAPI"
              maxLength={200}
              required
            />
            <small>{title.length}/200</small>
          </label>
          <label className="field">
            <span>Описание</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Добавь немного контекста..."
              rows={4}
              maxLength={2000}
            />
            <small>{description.length}/2000</small>
          </label>
          <label className="field">
            <span>Статус</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((key) => (
                <option value={key} key={key}>{STATUS_LABELS[key]}</option>
              ))}
            </select>
          </label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>
              Отмена
            </button>
            <button type="submit" className="button button-primary" disabled={busy}>
              {busy && <span className="spinner" />}
              {busy ? "Сохраняю…" : task ? "Сохранить изменения" : "Создать задачу"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
