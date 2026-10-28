import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import type { TaskStatus } from "../types/task";
import { STATUS_LABELS } from "../types/task";

export function TaskFilters({
  search,
  onSearch,
  status,
  onStatus,
  layout,
  onLayout,
  onReset,
  hasFilters,
}: {
  search: string;
  onSearch: (value: string) => void;
  status: TaskStatus | "all";
  onStatus: (value: TaskStatus | "all") => void;
  layout: "list" | "grid";
  onLayout: (value: "list" | "grid") => void;
  onReset: () => void;
  hasFilters: boolean;
}) {
  return (
    <div className="filter-bar">
      <label className="search-field">
        <Search size={18} />
        <span className="sr-only">Поиск задач</span>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Найти задачу..."
          aria-label="Поиск задач по названию"
        />
        {search && <button className="search-clear" onClick={() => onSearch("")} aria-label="Очистить поиск"><X size={15} /></button>}
        <kbd>⌘ K</kbd>
      </label>
      <div className="filter-controls">
        <label className="status-filter">
          <SlidersHorizontal size={16} />
          <span className="sr-only">Фильтр по статусу</span>
          <select value={status} onChange={(e) => onStatus(e.target.value as TaskStatus | "all")} aria-label="Фильтр по статусу">
            <option value="all">Все статусы</option>
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((key) => (
              <option key={key} value={key}>{STATUS_LABELS[key]}</option>
            ))}
          </select>
        </label>
        {hasFilters && <button className="reset-filter" onClick={onReset}>Сбросить</button>}
        <div className="view-toggle" aria-label="Режим отображения">
          <button className={layout === "list" ? "view-active" : ""} onClick={() => onLayout("list")} aria-label="Список" aria-pressed={layout === "list"}><List size={17} /></button>
          <button className={layout === "grid" ? "view-active" : ""} onClick={() => onLayout("grid")} aria-label="Сетка" aria-pressed={layout === "grid"}><LayoutGrid size={17} /></button>
        </div>
      </div>
    </div>
  );
}
