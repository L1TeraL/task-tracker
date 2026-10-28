
from fastapi import APIRouter, HTTPException, Query

from schemas.tasks import (
    TaskCreate,
    TaskResponse,
    TaskStatus,
    TaskUpdate,
)
from services import tasks as task_service

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    status: TaskStatus | None = None,
    search: str | None = Query(default=None, max_length=200)
):
    return task_service.get_tasks(status=status, search=search)


@router.post("", response_model=TaskResponse, status_code=201)
def create_task(task: TaskCreate):
    return task_service.create_task(task)


@router.get("/{task_id}", response_model=TaskResponse)
def read_task(task_id: int):
    task = task_service.get_task(task_id)

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task: TaskUpdate):
    updated_task, error = task_service.update_task(task_id, task)

    if error == "not_found":
        raise HTTPException(status_code=404, detail="Task not found")

    if error == "empty":
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update"
        )

    if error == "null":
        raise HTTPException(
            status_code=422,
            detail="Fields cannot be null"
        )

    return updated_task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int):
    deleted = task_service.delete_task(task_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")

    return None
