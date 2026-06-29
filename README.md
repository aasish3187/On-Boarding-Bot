# OnboardBot — AI-Powered Enterprise Onboarding Portal

OnboardBot is an intelligent, full-stack employee self-service chatbot designed to streamline the corporate onboarding experience. Powered by **FastAPI**, **React (Vite)**, and **LangGraph**, it enables new hires to instantly retrieve policy information, request software provisioning, and apply for leaves via dynamic, interactive UI forms built right into the chat stream.

---

## 📸 Screenshots

### 🔑 Premium Glassmorphism Login
![OnboardBot Login](screenshots/login.png)

### 💬 Conversational Chat Assistant
![OnboardBot Chat](screenshots/chat.png)

### 📅 Interactive Leave Request Form (Widget)
![Leave Request Widget](screenshots/leave_widget.png)

---

## 🌟 Problems Solved

Traditionally, onboarding systems and conversational chatbots suffer from three major problems:

1. **Brittle Natural Language Extraction**: Asking chatbots to extract durations and reasons from raw conversational text is highly fragile. Users type values in inconsistent formats (e.g., "three days," "from Mon to Wed," "family vacation"), which often breaks LLM parser logic and traps users in infinite prompt loops.
   * **Our Solution**: **Interactive Form Widgets**. When the bot detects a leave intent, it injects a calendar date-picker and text form directly into the chat flow. This guarantees 100% data extraction accuracy and creates a seamless, modern user experience.
2. **Setup Friction**: Launching modern full-stack web applications usually requires opening multiple command line terminals, activating virtual environments, and running several independent start scripts.
   * **Our Solution**: **One-Click Startup Script**. A custom `.bat` file automates activating the python virtual environment, running the uvicorn backend, spinning up the Vite frontend, and opening the system browser automatically.
3. **AI Hallucinations on Policies**: General-purpose AI chatbots can fabricate corporate policy, leading to compliance risks.
   * **Our Solution**: **Strict-Context RAG Node**. The conversational agent's routing graph isolates HR FAQs into a strict Retrieval-Augmented Generation (RAG) agent that returns a standard HR support fallback message if the policy query is not explicitly detailed in the source handbook.
4. **Delayed HR Approvals**: Static ticketing systems force employees to manually refresh their dashboards to see if their requests were approved.
   * **Our Solution**: **Websocket Live Sync**. Active WebSocket connections automatically push HR decisions (approvals/rejections) straight to the employee's screen, updating approval cards in real-time.

---

## 🏗️ Core Architecture & Flow

```
                      +-------------------+
                      |   React Frontend  |
                      +---------+---------+
                                |  (HTTP / WebSocket)
                                v
                      +---------+---------+
                      |   FastAPI Server  |
                      +---------+---------+
                                |
                                v
                      +---------+---------+
                      |  LangGraph Agent  |
                      +----+----+----+----+
                           |    |    |
      +--------------------+    |    +--------------------+
      |                         v                         |
+-----+-----+             +-----+-----+             +-----+-----+
| IT Agent  |             |  RAG FAQ  |             | Chat Agent|
+-----------+             +-----+-----+             +-----------+
                                |
                                v (Leave Intent Detected)
                          [Renders Form Widget]
                                |
                                v (Form Submit)
                          [Escalates to HR]
```

---

## 📁 Detailed File Structure

```
agnt-ai/
│
├── frontend/                     # React Frontend Application
│   ├── public/                   # Static assets & icons
│   ├── src/
│   │   ├── assets/               # Local stylesheets and design graphics
│   │   ├── components/
│   │   │   ├── ChatScreen.jsx    # Primary Chat screen (renders widgets & messages)
│   │   │   ├── DashboardScreen.px# Overview panel (shows stats, profile, widgets)
│   │   │   └── LoginScreen.jsx   # Premium glassmorphism login system
│   │   ├── App.jsx               # Navigation, routing, and user session wrapper
│   │   └── main.jsx              # App entry point
│   ├── package.json              # Frontend npm dependencies and scripts
│   ├── tailwind.config.js        # Design tokens and custom theme specifications
│   └── vite.config.js            # Build configuration for Vite
│
├── onboardbot_v2/                # FastAPI Backend Application
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py           # Employee registration, login, and JWT logic
│   │   │   ├── bot.py            # Chat API and database message persistence
│   │   │   └── v1.py             # HR approval ticketing and status routes
│   │   ├── core/
│   │   │   └── security.py       # Password hashing and JWT generation utils
│   │   ├── db/
│   │   │   ├── database.py       # SQLite engine session initialization
│   │   │   └── models.py         # SQLAlchemy schemas (Users, ChatMessage, Tickets)
│   │   ├── schemas/
│   │   │   └── payload.py        # Pydantic schemas for requests/responses
│   │   ├── services/
│   │   │   ├── agent_graph.py    # LangGraph routing definitions & LLM configuration
│   │   │   └── websocket.py      # Active WS connection manager for live approvals
│   │   └── main.py               # Main application entry point & Middleware
│   ├── requirements.txt          # Python virtual env dependencies
│   └── onboardbot.db             # Local SQLite development database
│
├── start_bot.bat                 # One-click Windows startup script
└── README.md                     # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18+)
* **Python** (v3.10+)
* A **Groq Cloud API Key** (for LLaMA model invocation)

### Quick Start (Windows)
1. Ensure your `.env` file is set up inside `onboardbot_v2/` with a valid `GROQ_API_KEY`.
2. Double-click the `start_bot.bat` file in the root folder.
3. The app will launch automatically at `http://localhost:5173/`.

### Manual Setup
Refer to the component directories (`frontend/` and `onboardbot_v2/`) to install dependencies via `npm install` and run services using `uvicorn` and Vite dev commands.
