import { CheckCheck, Circle, Clock3, ListTodo } from "lucide-react";
import type { Task, TaskStatus } from "../types/task";

type Filter = TaskStatus | "all";

export function StatsCards({
  tasks,
  selected,
  onSelect,
}: {
  tasks: Task[];
  selected: Filter;
  onSelect: (filter: Filter) => void;
}) {
  const stats: { key: Filter; label: string; value: number; icon: typeof ListTodo; tone: string }[] = [
    { key: "all", label: "Всего задач", value: tasks.length, icon: ListTodo, tone: "violet" },
    { key: "todo", label: "К выполнению", value: tasks.filter((t) => t.status === "todo").length, icon: Circle, tone: "slate" },
    { key: "in_progress", label: "В процессе", value: tasks.filter((t) => t.status === "in_progress").length, icon: Clock3, tone: "blue" },
    { key: "done", label: "Выполнено", value: tasks.filter((t) => t.status === "done").length, icon: CheckCheck, tone: "green" },
  ];

  return (
    <section className="stats-grid" aria-label="Статистика задач">
      {stats.map(({ key, label, value, icon: Icon, tone }) => (
        <button
          key={key}
          className={`stat-card ${selected === key ? "stat-selected" : ""}`}
          onClick={() => onSelect(key)}
          aria-pressed={selected === key}
        >
          <div className={`stat-icon stat-${tone}`}><Icon size={19} /></div>
          <div className="stat-copy">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
          <span className="stat-indicator" />
        </button>
      ))}
    </section>
  );
}
