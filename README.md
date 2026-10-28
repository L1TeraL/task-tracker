# Task Tracker

A full-stack task management application built with FastAPI and React.

## Tech Stack

**Backend**
- Python
- FastAPI
- SQLAlchemy
- SQLite

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS

## Features

- Create new tasks
- View all tasks
- Retrieve a task by ID
- Update task status
- Delete tasks
- REST API with interactive Swagger documentation
- Persistent storage using SQLite

## Project Structure

```text
task-tracker/
├── task-tracker-backend/
│   ├── main.py
│   ├── database.py
│   ├── routers/
│   ├── schemas/
│   └── services/
├── task-tracker-frontend/
│   ├── src/
│   ├── package.json
│   └── README.md
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js and npm

### 1. Clone the Repository

```bash
git clone https://github.com/L1TeraL/task-tracker.git
cd task-tracker
```

### 2. Run the Backend

Create and activate a virtual environment from the project root:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the backend dependencies:

```bash
pip install fastapi uvicorn sqlalchemy
```

Start the API:

```bash
cd task-tracker-backend
python main.py
```

The backend will be available at:

- API: http://127.0.0.1:8000
- Swagger UI: http://127.0.0.1:8000/docs

### 3. Run the Frontend

Open a separate terminal from the project root:

```bash
cd task-tracker-frontend
npm install
cp .env.example .env
npm run dev
```

Open the application at http://127.0.0.1:5173.

## Configuration

The frontend uses the `VITE_API_URL` environment variable to connect to the backend.

Default local configuration:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## License

This project is intended for educational and portfolio purposes.