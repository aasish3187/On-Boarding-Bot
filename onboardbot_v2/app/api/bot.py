import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User, PendingApproval, ChatMessage
from app.schemas.payload import ChatPayload
from app.core.security import scrub_pii, decode_access_token
from app.services.agent_graph import agent_graph
from app.services.websocket import manager, run_sync

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    token_data = decode_access_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token session.")
    user_id = token_data.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found.")
    return user

@router.post("/chat")
def bot_chat(payload: ChatPayload, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    clean_input = scrub_pii(payload.message)
    
    # 1. Persist user message to database
    user_msg = ChatMessage(
        id=str(uuid.uuid4()),
        employee_id=current_user.id,
        sender="user",
        content=clean_input
    )
    db.add(user_msg)
    db.commit()
    
    # Fetch recent message history (last 15 messages) to provide context for multi-turn conversations
    history = db.query(ChatMessage).filter(ChatMessage.employee_id == current_user.id).order_by(ChatMessage.created_at.desc()).limit(15).all()
    messages_list = [{"sender": msg.sender, "content": msg.content} for msg in reversed(history)]
    
    state = {
        "messages": messages_list,
        "employee_id": current_user.id,
        "employee_meta": {"name": current_user.name},
        "next_node": "",
        "provisioning_payload": {},
        "risk_flag": False,
        "compliance_passed": False
    }
    
    final_state = agent_graph.invoke(state)
    
    if final_state.get("risk_flag"):
        ticket_id = str(uuid.uuid4())
        # Store pending approval matching the schema
        db.add(PendingApproval(
            id=ticket_id, 
            employee_id=current_user.id, 
            action_type="provisioning", 
            payload={"req": clean_input}
        ))
        db.commit()
        
        # Broadcast ticket creation to WebSocket listeners
        run_sync(manager.broadcast({
            "type": "approval_created",
            "employee_id": current_user.id,
            "ticket_id": ticket_id
        }))
        
        response_text = "HR Action Required: This request has been flagged for administrative review."
        
        # 2. Persist bot pending message to database
        bot_msg = ChatMessage(
            id=str(uuid.uuid4()),
            employee_id=current_user.id,
            sender="knowledge_rag",
            content=response_text
        )
        db.add(bot_msg)
        db.commit()
        
        return {"response": response_text, "status": "awaiting_approval", "thread_id": ticket_id}
        
    response_text = final_state["messages"][-1]["content"]
    
    # 2. Persist bot completion message to database
    bot_msg = ChatMessage(
        id=str(uuid.uuid4()),
        employee_id=current_user.id,
        sender="knowledge_rag",
        content=response_text
    )
    db.add(bot_msg)
    db.commit()
    
    return {"response": response_text, "status": "completed"}

@router.get("/history")
def get_chat_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(ChatMessage.employee_id == current_user.id).order_by(ChatMessage.created_at.asc()).all()
    return [
        {"sender": msg.sender, "content": msg.content, "created_at": msg.created_at.isoformat()}
        for msg in messages
    ]
