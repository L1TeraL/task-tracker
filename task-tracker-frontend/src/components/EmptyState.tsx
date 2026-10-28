import { ClipboardList, Search, Plus } from "lucide-react";

export function EmptyState({
  searching,
  onCreate,
  onReset,
}: {
  searching: boolean;
  onCreate: () => void;
  onReset: () => void;
}) {
  const Icon = searching ? Search : ClipboardList;
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon size={25} /></div>
      <h3>{searching ? "Ничего не найдено" : "Пока нет задач"}</h3>
      <p>{searching ? "Попробуй изменить запрос или сбросить фильтры." : "Добавь первую задачу — и пусть дела двигаются вперёд."}</p>
      {searching
        ? <button className="button button-secondary" onClick={onReset}>Сбросить фильтры</button>
        : <button className="button button-primary" onClick={onCreate}><Plus size={17} /> Создать первую задачу</button>}
    </div>
  );
}
