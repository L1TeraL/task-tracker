import { MoreHorizontal, Pencil, Trash2, CalendarDays, ArrowRight } from "lucide-react";
import { useState } from "react";
import type { Task, TaskStatus } from "../types/task";
import { STATUS_LABELS } from "../types/task";

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  layout,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  layout: "list" | "grid";
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className={`task-card ${layout === "grid" ? "task-card-grid" : ""}`}>
      <div className="task-card-main">
        <div className={`task-status-dot dot-${task.status}`} aria-hidden="true" />
        <div className="task-content">
          <div className="task-title-row">
            <h3>{task.title}</h3>
            <span className="task-id">#{task.id}</span>
          </div>
          <p className={`task-description ${task.description ? "" : "muted-description"}`}>
            {task.description || "Описание не добавлено"}
          </p>
          <div className="task-meta">
            <span className={`status-badge status-${task.status}`}>{STATUS_LABELS[task.status]}</span>
            <span className="task-meta-separator" />
            <span className="task-meta-label"><CalendarDays size={13} /> Задача #{task.id}</span>
          </div>
        </div>
      </div>
      <div className="task-actions">
        <label className="quick-status">
          <span className="sr-only">Изменить статус задачи {task.title}</span>
          <select
            aria-label={`Статус задачи ${task.title}`}
            value={task.status}
            onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
          >
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
              <option key={status} value={status}>{STATUS_LABELS[status]}</option>
            ))}
          </select>
          <ArrowRight size={14} />
        </label>
        <div className="action-menu-wrap">
          <button
            className="icon-button task-more"
            aria-label={`Действия с задачей ${task.title}`}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <MoreHorizontal size={19} />
          </button>
          {menuOpen && (
            <>
              <button className="menu-dismiss" aria-label="Закрыть меню" onClick={() => setMenuOpen(false)} />
              <div className="action-menu">
                <button onClick={() => { setMenuOpen(false); onEdit(task); }}><Pencil size={15} /> Редактировать</button>
                <button className="menu-danger" onClick={() => { setMenuOpen(false); onDelete(task); }}><Trash2 size={15} /> Удалить</button>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
