import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownUp, Check, ChevronDown, CircleHelp, Moon, Plus,
  RefreshCw, Sparkles, Sun, Target, Zap,
} from "lucide-react";
import { tasksApi } from "./api/tasks";
import type { Task, TaskCreate, TaskStatus } from "./types/task";
import { STATUS_LABELS } from "./types/task";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { TaskCard } from "./components/TaskCard";
import { StatsCards } from "./components/StatsCards";
import { TaskFilters } from "./components/TaskFilters";
import { TaskForm } from "./components/TaskForm";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { EmptyState } from "./components/EmptyState";
import { Toast, type ToastMessage } from "./components/Toast";
import { getErrorMessage } from "./utils/errors";

type Filter = TaskStatus | "all";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Filter>("all");
  const [layout, setLayout] = useState<"list" | "grid">("list");
  const [sortNewest, setSortNewest] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formTask, setFormTask] = useState<Task | null | undefined>(undefined);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busyStatusId, setBusyStatusId] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [dark, setDark] = useState(() => localStorage.getItem("tt-theme") === "dark");
  const debouncedSearch = useDebouncedValue(search, 300);

  const notify = useCallback((text: string, type: ToastMessage["type"] = "success") => {
    setToast({ id: Date.now(), text, type });
  }, []);

  const loadTasks = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setLoadError("");
    try {
      const [allData, filteredData] = await Promise.all([
        tasksApi.list(),
        tasksApi.list({ status, search: debouncedSearch }),
      ]);
      setAllTasks(allData);
      setTasks(filteredData);
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [status, debouncedSearch]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("tt-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>(".search-field input")?.focus();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        setFormTask(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const hasFilters = search.trim().length > 0 || status !== "all";
  const totalShown = allTasks.length;
  const completedShown = allTasks.filter((task) => task.status === "done").length;
  const completion = totalShown ? Math.round((completedShown / totalShown) * 100) : 0;

  const orderedTasks = useMemo(
    () => [...tasks].sort((a, b) => sortNewest ? b.id - a.id : a.id - b.id),
    [tasks, sortNewest],
  );

  async function handleSave(data: TaskCreate) {
    setSaving(true);
    try {
      if (formTask) {
        const old = formTask;
        const patch: Partial<TaskCreate> = {};
        if (data.title !== old.title) patch.title = data.title;
        if (data.description !== old.description) patch.description = data.description;
        if (data.status !== old.status) patch.status = data.status;
        if (Object.keys(patch).length) await tasksApi.update(old.id, patch);
        notify("Изменения сохранены");
      } else {
        await tasksApi.create(data);
        notify("Задача создана");
      }
      setFormTask(undefined);
      await loadTasks(true);
    } catch (error) {
      const message = getErrorMessage(error);
      notify(message, "error");
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTask) return;
    setDeleting(true);
    try {
      await tasksApi.remove(deleteTask.id);
      setDeleteTask(null);
      notify("Задача удалена");
      await loadTasks(true);
    } catch (error) {
      const message = getErrorMessage(error);
      notify(message, "error");
      if (message.includes("не найдена")) {
        setDeleteTask(null);
        await loadTasks(true);
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusChange(task: Task, nextStatus: TaskStatus) {
    if (task.status === nextStatus) return;
    setBusyStatusId(task.id);
    try {
      await tasksApi.update(task.id, { status: nextStatus });
      notify(`Статус изменён: ${STATUS_LABELS[nextStatus].toLowerCase()}`);
      await loadTasks(true);
    } catch (error) {
      notify(getErrorMessage(error), "error");
    } finally {
      setBusyStatusId(null);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Task Tracker — главная">
          <span className="brand-mark"><Check size={19} strokeWidth={3} /></span>
          <span className="brand-name">task<span>flow</span></span>
        </a>

        <div className="workspace-switcher">
          <div className="workspace-avatar">P</div>
          <div className="workspace-info"><strong>Personal space</strong><span>Личное пространство</span></div>
          <ChevronDown size={15} />
        </div>

        <p className="sidebar-label">РАБОЧЕЕ ПРОСТРАНСТВО</p>
        <nav className="sidebar-nav" aria-label="Основная навигация">
          <button className="nav-item nav-active"><Target size={17} /><span>Мои задачи</span><span className="nav-count">{allTasks.length}</span></button>
          <button className="nav-item" onClick={() => { setStatus("done"); setSearch(""); }}><Check size={17} /><span>Завершённые</span></button>
          <button className="nav-item" onClick={() => { setStatus("in_progress"); setSearch(""); }}><Activity size={17} /><span>В процессе</span></button>
        </nav>

        <div className="sidebar-bottom">
          <div className="focus-card">
            <div className="focus-card-top"><Sparkles size={16} /><span>Небольшой совет</span></div>
            <p>Большие цели становятся проще, когда превращаются в маленькие задачи.</p>
          </div>
          <button className="nav-item help-item" onClick={() => window.open("http://127.0.0.1:8000/docs", "_blank", "noopener,noreferrer")}>
            <CircleHelp size={17} /><span>Документация API</span>
          </button>
          <div className="profile-row">
            <div className="profile-avatar">D</div>
            <div className="profile-info"><strong>Моё пространство</strong><span>Локальный проект</span></div>
            <button className="icon-button profile-theme" onClick={() => setDark((value) => !value)} aria-label={dark ? "Включить светлую тему" : "Включить тёмную тему"}>
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Рабочее пространство</span><span className="crumb-slash">/</span><strong>Мои задачи</strong></div>
          <div className="topbar-actions">
            <span className="connection-pill"><span className="connection-dot" /> API подключение</span>
            <button className="button button-primary top-create" onClick={() => setFormTask(null)}><Plus size={17} /> Новая задача <kbd>⌘ N</kbd></button>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow welcome-eyebrow"><span className="eyebrow-line" /> ПОНЕДЕЛЬНИК, НОВЫЙ СТАРТ</p>
              <h1>Дела под контролем<span className="heading-period">.</span></h1>
              <p className="welcome-subtitle">Собери мысли в список. Остальное — по шагам.</p>
            </div>
            <div className="welcome-decoration" aria-hidden="true">
              <div className="decoration-orbit orbit-one" />
              <div className="decoration-orbit orbit-two" />
              <div className="decoration-core"><Zap size={25} fill="currentColor" /></div>
            </div>
          </section>

          <section className="overview-heading">
            <div><h2>Обзор</h2><p>Твоя продуктивность в одном месте</p></div>
            <button className="subtle-button" onClick={() => void loadTasks()} disabled={loading}><RefreshCw size={15} className={loading ? "spin-icon" : ""} /> Обновить</button>
          </section>

          <StatsCards tasks={allTasks} selected={status} onSelect={setStatus} />

          <section className="progress-panel">
            <div className="progress-copy">
              <div className="progress-icon"><Activity size={17} /></div>
              <div><strong>Твой прогресс</strong><span>{completedShown} из {totalShown} задач завершено</span></div>
            </div>
            <div className="progress-track" role="progressbar" aria-label="Выполнение задач" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100}>
              <div className="progress-fill" style={{ width: `${completion}%` }} />
            </div>
            <strong className="progress-percent">{completion}%</strong>
          </section>

          <section className="tasks-section">
            <div className="section-heading">
              <div><h2>Твои задачи <span className="heading-count">{tasks.length}</span></h2><p>Всё важное — в одном списке</p></div>
              <button className="sort-button" onClick={() => setSortNewest((value) => !value)}><ArrowDownUp size={15} /> {sortNewest ? "Сначала новые" : "Сначала старые"}</button>
            </div>

            <TaskFilters
              search={search}
              onSearch={setSearch}
              status={status}
              onStatus={setStatus}
              layout={layout}
              onLayout={setLayout}
              onReset={() => { setSearch(""); setStatus("all"); }}
              hasFilters={hasFilters}
            />

            {loading ? (
              <div className={layout === "grid" ? "tasks-grid" : "tasks-list"}>
                {Array.from({ length: 3 }, (_, i) => <div className="skeleton-card" key={i}><div className="skeleton-dot" /><div className="skeleton-lines"><span /><span /><span /></div></div>)}
              </div>
            ) : loadError ? (
              <div className="error-state">
                <div className="error-mark"><RefreshCw size={22} /></div>
                <h3>Не удалось загрузить задачи</h3>
                <p>{loadError}</p>
                <button className="button button-primary" onClick={() => void loadTasks()}><RefreshCw size={16} /> Попробовать снова</button>
                {loadError.includes("CORS") && <p className="error-hint">Проверь настройку CORS в FastAPI — подробности в README.</p>}
              </div>
            ) : orderedTasks.length === 0 ? (
              <EmptyState searching={hasFilters} onCreate={() => setFormTask(null)} onReset={() => { setSearch(""); setStatus("all"); }} />
            ) : (
              <div className={layout === "grid" ? "tasks-grid" : "tasks-list"}>
                {orderedTasks.map((task) => (
                  <div className={busyStatusId === task.id ? "task-busy" : ""} key={task.id}>
                    <TaskCard
                      task={task}
                      layout={layout}
                      onEdit={(selected) => setFormTask(selected)}
                      onDelete={setDeleteTask}
                      onStatusChange={(selected, next) => void handleStatusChange(selected, next)}
                    />
                  </div>
                ))}
              </div>
            )}

            {!loading && !loadError && tasks.length > 0 && (
              <div className="list-footer"><span>Показано задач: <strong>{tasks.length}</strong></span><span><span className="footer-live-dot" /> Синхронизировано с API</span></div>
            )}
          </section>

          <footer className="app-footer"><span>Сделано, чтобы было проще.</span><span>Taskflow <span className="footer-dot">·</span> v1.0</span></footer>
        </div>
      </main>

      {formTask !== undefined && (
        <TaskForm
          key={formTask?.id ?? "new-task"}
          task={formTask}
          busy={saving}
          onClose={() => !saving && setFormTask(undefined)}
          onSubmit={handleSave}
        />
      )}
      {deleteTask && <ConfirmDialog task={deleteTask} busy={deleting} onCancel={() => !deleting && setDeleteTask(null)} onConfirm={() => void handleDelete()} />}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
