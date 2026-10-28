export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
}

export interface TaskCreate {
  title: string;
  description: string;
  status: TaskStatus;
}

export type TaskUpdate = Partial<TaskCreate>;

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "К выполнению",
  in_progress: "В процессе",
  done: "Выполнено",
};
