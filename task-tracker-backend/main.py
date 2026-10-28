
import uvicorn
from fastapi import FastAPI

from database import init_db
from routers.tasks import router as tasks_router

from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="Task Tracker API",
    description="REST API for managing tasks",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


app.include_router(tasks_router)


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000
    )
