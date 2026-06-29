from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.api import auth, bot, v1
from app.services.websocket import manager

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Prism Agent by Lumina Systems")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(bot.router, prefix="/api/bot", tags=["AI Agent"])
app.include_router(v1.router, prefix="/api/v1", tags=["Approvals & Resume"])
