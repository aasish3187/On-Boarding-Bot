from typing import List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[WebSocket] Connected client. Active count: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print(f"[WebSocket] Disconnected client. Active count: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        # Create a copy of the connection list to avoid modification during iteration
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"[WebSocket] Error broadcasting to client, removing: {e}")
                self.disconnect(connection)

manager = ConnectionManager()

import asyncio

def run_sync(coro):
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(coro)
            return
    except RuntimeError:
        pass
    
    # Run in a new event loop if none is active
    try:
        asyncio.run(coro)
    except Exception as e:
        print(f"[WebSocket] Failed to run sync wrapper: {e}")
