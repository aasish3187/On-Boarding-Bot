import os
import uuid
from datetime import datetime, date
from contextlib import asynccontextmanager
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, SessionLocal, Base
from app.db.models import User, PendingApproval, HardwareTicket, PolicyQueryInsight, UserProgress
from app.core.security import hash_password
from app.api import auth, bot, v1
from app.services.websocket import manager

# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

def seed_default_data():
    """Seed initial demo accounts and onboarding records if they don't exist."""
    db = SessionLocal()
    try:
        # Default Demo Users
        demo_users = [
            {
                "id": "b3bf59ae-464e-4b23-8af5-461441038a12",
                "email": "test_user@luminasystems.com",
                "name": "Alice Developer",
                "role": "employee",
                "department": "Engineering"
            },
            {
                "id": "4bf93223-00c5-4f35-95c9-eb80c775c254",
                "email": "alex.rivera@luminasystems.com",
                "name": "Alex Rivera",
                "role": "employee",
                "department": "Engineering"
            },
            {
                "id": "7ca81109-7d12-4c22-9011-8931ef110291",
                "email": "sarah.jenkins@luminasystems.com",
                "name": "Sarah Jenkins",
                "role": "hr",
                "department": "People Ops"
            }
        ]

        default_password_hash = hash_password("SecurePassword123")

        for u in demo_users:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                new_user = User(
                    id=u["id"],
                    email=u["email"],
                    hashed_password=default_password_hash,
                    role=u["role"],
                    name=u["name"],
                    department=u["department"],
                    start_date=date.today()
                )
                db.add(new_user)
            else:
                # Ensure demo password works
                existing.hashed_password = default_password_hash
                existing.role = u["role"]
                existing.name = u["name"]
        db.commit()

        # Seed initial pending approvals if empty
        if db.query(PendingApproval).count() == 0:
            sample_approvals = [
                PendingApproval(
                    id="appr-101",
                    employee_id=demo_users[0]["id"],
                    action_type="provisioning",
                    payload={"req": "GitHub Org + AWS Staging Access", "urgency": "High"},
                    status="pending",
                    created_at=datetime.utcnow()
                ),
                PendingApproval(
                    id="appr-102",
                    employee_id=demo_users[1]["id"],
                    action_type="leave",
                    payload={"req": "PTO: 3 days for Family Vacation", "dates": "Next Mon-Wed"},
                    status="pending",
                    created_at=datetime.utcnow()
                )
            ]
            for sa in sample_approvals:
                db.add(sa)
            db.commit()

        # Seed initial hardware tickets if empty
        if db.query(HardwareTicket).count() == 0:
            sample_hw = [
                HardwareTicket(
                    id="hw-201",
                    employee_id=demo_users[0]["id"],
                    laptop_choice="Apple MacBook Pro 16\" (M3 Max, 36GB)",
                    monitors="Dual 27\" 4K LG UltraFine",
                    peripherals="Apple Magic Keyboard & MX Master 3S Mouse",
                    status="approved",
                    created_at=datetime.utcnow()
                ),
                HardwareTicket(
                    id="hw-202",
                    employee_id=demo_users[1]["id"],
                    laptop_choice="Dell XPS 15 (i9, 32GB, RTX 4060)",
                    monitors="Single 34\" Ultrawide Dell Curved",
                    peripherals="Ergonomic Mechanical Keyboard & Noise-canceling Headset",
                    status="pending",
                    created_at=datetime.utcnow()
                )
            ]
            for hw in sample_hw:
                db.add(hw)
            db.commit()

        # Seed initial policy insights if empty
        if db.query(PolicyQueryInsight).count() == 0:
            sample_queries = [
                "What is our parental leave policy?",
                "How do I set up the Cisco AnyConnect VPN?",
                "What are our standard core working hours?",
                "Where is the cafeteria and gym located?",
                "What is the 401(k) company match percentage?"
            ]
            for q in sample_queries:
                db.add(PolicyQueryInsight(
                    id=str(uuid.uuid4()),
                    employee_id=demo_users[0]["id"],
                    query_text=q,
                    status="resolved"
                ))
            db.commit()

        print("[Database] Default demo accounts & initial onboarding records verified.")
    except Exception as e:
        print(f"[Database Seed Warning] {e}")
        db.rollback()
    finally:
        db.close()

# Auto-seed on startup
seed_default_data()

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_default_data()
    yield

app = FastAPI(
    title="OnboardBot Enterprise API",
    description="Intelligent AI Enterprise Onboarding Assistant API powered by FastAPI & LangGraph",
    version="2.0.0",
    lifespan=lifespan
)

# Robust CORS Configuration: allows local dev, configured origins, and all Vercel deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://on-boarding-bot.vercel.app",
        "https://on-boarding-bot-aasish3187-2151s-projects.vercel.app",
        os.getenv("FRONTEND_URL", "https://on-boarding-bot.vercel.app")
    ],
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "OnboardBot Enterprise API",
        "version": "2.0.0",
        "docs": "/docs"
    }

@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.websocket("/api/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Maintain active connection
            data = await websocket.receive_text()
            await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        manager.disconnect(websocket)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(bot.router, prefix="/api/bot", tags=["AI Agent"])
app.include_router(v1.router, prefix="/api/v1", tags=["Approvals & Resume"])
