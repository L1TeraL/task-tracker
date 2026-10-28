
from database import get_connection
from schemas.tasks import TaskCreate, TaskUpdate


def get_tasks(status=None, search=None):
    query = "SELECT * FROM tasks WHERE 1 = 1"
    params = []

    if status is not None:
        query += " AND status = ?"
        params.append(status.value)

    if search:
        query += " AND LOWER(title) LIKE LOWER(?)"
        params.append(f"%{search}%")

    query += " ORDER BY id"

    with get_connection() as connection:
        rows = connection.execute(query, params).fetchall()
        return [dict(row) for row in rows]


def get_task(task_id: int):
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM tasks WHERE id = ?",
            (task_id,)
        ).fetchone()

        return dict(row) if row else None


def create_task(task: TaskCreate):
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO tasks (title, description, status)
            VALUES (?, ?, ?)
            """,
            (
                task.title,
                task.description,
                task.status.value
            )
        )

        row = connection.execute(
            "SELECT * FROM tasks WHERE id = ?",
            (cursor.lastrowid,)
        ).fetchone()

        return dict(row)


def update_task(task_id: int, task: TaskUpdate):
    updated_data = task.model_dump(
        exclude_unset=True,
        mode="json"
    )

    if not updated_data:
        return None, "empty"

    if any(value is None for value in updated_data.values()):
        return None, "null"

    allowed_fields = {"title", "description", "status"}

    # Названия столбцов берутся только из разрешённого набора.
    fields = [
        field for field in updated_data
        if field in allowed_fields
    ]

    with get_connection() as connection:
        existing = connection.execute(
            "SELECT id FROM tasks WHERE id = ?",
            (task_id,)
        ).fetchone()

        if existing is None:
            return None, "not_found"

        assignments = ", ".join(f"{field} = ?" for field in fields)
        values = [updated_data[field] for field in fields]

        connection.execute(
            f"UPDATE tasks SET {assignments} WHERE id = ?",
            (*values, task_id)
        )

        row = connection.execute(
            "SELECT * FROM tasks WHERE id = ?",
            (task_id,)
        ).fetchone()

        return dict(row), None


def delete_task(task_id: int):
    with get_connection() as connection:
        cursor = connection.execute(
            "DELETE FROM tasks WHERE id = ?",
            (task_id,)
        )

        return cursor.rowcount > 0
