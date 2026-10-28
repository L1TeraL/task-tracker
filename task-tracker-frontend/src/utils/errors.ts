import { ApiError } from "../api/tasks";

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (Array.isArray(error.details)) {
      const first = error.details[0] as { msg?: string } | undefined;
      if (first?.msg) return `Проверь данные: ${first.msg}`;
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Что-то пошло не так. Попробуй ещё раз.";
}
