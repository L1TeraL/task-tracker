import type { Task, TaskCreate, TaskStatus, TaskUpdate } from "../types/task";

const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new Error("Не удалось подключиться к серверу. Проверь, запущен ли FastAPI.");
  }

  if (!response.ok) {
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      payload = undefined;
    }

    const detail =
      typeof payload === "object" && payload !== null && "detail" in payload
        ? (payload as { detail: unknown }).detail
        : undefined;

    let message = `Ошибка сервера (${response.status})`;
    if (response.status === 404) message = "Задача не найдена. Возможно, она уже удалена.";
    else if (response.status === 422) message = "Проверь введённые данные.";
    else if (response.status >= 500) message = "На сервере произошла ошибка.";
    else if (typeof detail === "string") message = detail;

    throw new ApiError(message, response.status, detail);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const tasksApi = {
  list(params: { status?: TaskStatus | "all"; search?: string } = {}): Promise<Task[]> {
    const query = new URLSearchParams();
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.search?.trim()) query.set("search", params.search.trim());
    const suffix = query.toString();
    return request<Task[]>(`/tasks${suffix ? `?${suffix}` : ""}`);
  },

  get(id: number): Promise<Task> {
    return request<Task>(`/tasks/${id}`);
  },

  create(data: TaskCreate): Promise<Task> {
    return request<Task>("/tasks", { method: "POST", body: JSON.stringify(data) });
  },

  update(id: number, data: TaskUpdate): Promise<Task> {
    return request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  },

  remove(id: number): Promise<void> {
    return request<void>(`/tasks/${id}`, { method: "DELETE" });
  },
};
