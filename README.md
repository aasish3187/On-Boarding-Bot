# OnboardBot - AI-Powered Enterprise Onboarding Assistant

OnboardBot is an intelligent, full-stack onboarding chatbot designed to help new employees settle in smoothly. It features a conversational interface powered by LangGraph and LLaMA 3.1, coupled with dynamic, interactive UI widgets (such as a date-picker leave request form) and automated HR ticketing.

---

## 🚀 One-Click Quick Start (Windows)

To start both the frontend and backend servers automatically and open the app in your browser, simply **double-click** the startup script in the root directory:
```bash
start_bot.bat
```

---

## 🛠️ Manual Setup

If you prefer to run the components manually, follow the instructions below:

### 1. Backend Setup (`onboardbot_v2`)
The backend is built with FastAPI, SQLite, and LangGraph.
1. Navigate to the backend directory:
   ```bash
   cd onboardbot_v2
   ```
2. Activate the virtual environment:
   ```bash
   .\venv\Scripts\activate
   ```
3. Start the FastAPI server:
   ```bash
   python -m uvicorn app.main:app --port 8000 --reload
   ```

### 2. Frontend Setup (`frontend`)
The frontend is a modern React application built with Vite and TailwindCSS.
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies (if running for the first time):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application at `http://localhost:5173`.

---

## 🌟 Key Features

* **Interactive Leave Requests**: A calendar-based date-picker widget embedded directly in the chat stream to submit leave requests. No fragile text-parsing loop—100% reliable.
* **Smart Routing**: LangGraph agent workflow dynamically routes user queries to the appropriate RAG database or IT provisioning node.
* **Onboarding FAQ**: Instant, context-restricted answers about core hours, HR contacts, required documents, and benefits.
* **HR Ticket Escalation**: Submitting leave or IT requests automatically creates pending approval tasks with live WebSocket updates.

---

## 📁 Repository Structure

* `onboardbot_v2/` — FastAPI backend code, DB models, and LangGraph flow definition.
* `frontend/` — React frontend codebase, Tailwind configuration, and UI screens.
* `start_bot.bat` — Windows script for one-click setup.
* `.gitignore` — Excludes local credentials, SQLite databases, `node_modules`, and virtual environments.
