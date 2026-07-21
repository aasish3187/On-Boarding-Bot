from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import PendingApproval, User, ChatMessage
from app.core.security import scrub_pii
from app.services.agent_graph import agent_graph
from app.services.websocket import manager, run_sync
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import datetime
import uuid

router = APIRouter()

class DecisionPayload(BaseModel):
    action: str  # "approve" or "reject"
    note: Optional[str] = ""

class V1ChatPayload(BaseModel):
    employee_id: str
    message: str
    thread_id: Optional[str] = "demo-1"

@router.post("/chat")
def post_v1_chat(payload: V1ChatPayload, db: Session = Depends(get_db)):
    # Find user by employee_id or fallback
    user = db.query(User).filter(User.id == payload.employee_id).first()
    if not user:
        # Check by email or name as well, or pick the first user
        user = db.query(User).first()
        if not user:
            raise HTTPException(status_code=404, detail="No users found in database. Please sign up first.")
            
    clean_input = scrub_pii(payload.message)
    
    # 1. Save user's message
    db.add(ChatMessage(
        id=str(uuid.uuid4()),
        employee_id=user.id,
        sender="user",
        content=clean_input
    ))
    db.commit()
    
    # Fetch recent message history (last 15 messages) to provide context for multi-turn conversations
    history = db.query(ChatMessage).filter(ChatMessage.employee_id == user.id).order_by(ChatMessage.created_at.desc()).limit(15).all()
    messages_list = [{"sender": msg.sender, "content": msg.content} for msg in reversed(history)]
    
    state = {
        "messages": messages_list,
        "employee_id": user.id,
        "employee_meta": {"name": user.name},
        "next_node": "", 
        "provisioning_payload": {}, 
        "risk_flag": False, 
        "compliance_passed": False
    }
    
    final_state = agent_graph.invoke(state)
    
    if final_state.get("risk_flag"):
        approval_id = str(uuid.uuid4())
        # Create a pending approval
        db.add(PendingApproval(
            id=approval_id,
            employee_id=user.id,
            action_type="provisioning",
            payload={"req": clean_input}
        ))
        db.commit()
        
        # Broadcast ticket creation
        run_sync(manager.broadcast({
            "type": "approval_created",
            "employee_id": user.id,
            "ticket_id": approval_id
        }))
        
        response_text = "HR Action Required: This request has been flagged for administrative review."
        
        # 2. Save bot's response
        db.add(ChatMessage(
            id=str(uuid.uuid4()),
            employee_id=user.id,
            sender="knowledge_rag",
            content=response_text
        ))
        db.commit()
        
        return {
            "response": response_text,
            "status": "awaiting_approval",
            "thread_id": approval_id
        }
        
    response_text = final_state["messages"][-1]["content"]
    
    # 2. Save bot's response
    db.add(ChatMessage(
        id=str(uuid.uuid4()),
        employee_id=user.id,
        sender="knowledge_rag",
        content=response_text
    ))
    db.commit()
    
    return {
        "response": response_text,
        "status": "completed"
    }

@router.get("/approvals/pending")
def get_pending_approvals(db: Session = Depends(get_db)):
    pending = db.query(PendingApproval, User).join(User, PendingApproval.employee_id == User.id).filter(PendingApproval.status == "pending").all()
    
    results = []
    for approval, user in pending:
        tool_name = "IT Provisioning" if approval.action_type == "provisioning" else approval.action_type.title()
        icon = "computer" if approval.action_type == "provisioning" else "settings"
        
        results.append({
            "id": approval.id,
            "tool_name": tool_name,
            "icon": icon,
            "submitted_by": f"{user.name} ({user.department})",
            "timestamp": approval.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "details": {
                "Employee ID": approval.employee_id,
                "Requested Access": approval.payload.get("req", "System Access"),
                "Action Required": f"Grant {approval.action_type} permission"
            }
        })
    return results

@router.get("/approvals/history")
def get_resolved_approvals(db: Session = Depends(get_db)):
    resolved = db.query(PendingApproval, User).join(User, PendingApproval.employee_id == User.id).filter(PendingApproval.status != "pending").all()
    
    results = []
    for approval, user in resolved:
        tool_name = "IT Provisioning" if approval.action_type == "provisioning" else approval.action_type.title()
        icon = "computer" if approval.action_type == "provisioning" else "settings"
        
        results.append({
            "id": approval.id,
            "tool_name": tool_name,
            "icon": icon,
            "submitted_by": f"{user.name} ({user.department})",
            "timestamp": approval.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "status": approval.status,
            "details": {
                "Employee ID": approval.employee_id,
                "Requested Access": approval.payload.get("req", "System Access"),
                "Action Required": f"Grant {approval.action_type} permission"
            }
        })
    return results

@router.post("/approvals/{id}/decision")
def post_approval_decision(id: str, payload: DecisionPayload, db: Session = Depends(get_db)):
    approval = db.query(PendingApproval).filter(PendingApproval.id == id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")
        
    approval.status = "approved" if payload.action == "approve" else "rejected"
    db.commit()
    
    # Broadcast ticket decision
    run_sync(manager.broadcast({
        "type": "approval_decision",
        "employee_id": approval.employee_id,
        "ticket_id": approval.id,
        "status": approval.status
    }))
    
    return {
        "status": "success",
        "thread_id": approval.id,
        "message": f"Request {approval.status} successfully"
    }

@router.post("/chat/{thread_id}/resume")
def resume_chat_thread(thread_id: str, payload: DecisionPayload, db: Session = Depends(get_db)):
    approval = db.query(PendingApproval).filter(PendingApproval.id == thread_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Thread not found")
        
    if payload.action == "approve":
        response_text = f"HR has approved your request for system access! The setup task has been completed and your access is now enabled."
    else:
        response_text = f"HR has rejected your request. Note: {payload.note if payload.note else 'No reason provided.'}"
        
    # Save resumed notification message
    db.add(ChatMessage(
        id=str(uuid.uuid4()),
        employee_id=approval.employee_id,
        sender="knowledge_rag",
        content=response_text
    ))
    db.commit()
        
    return {
        "response": response_text,
        "status": "completed"
    }

@router.get("/approvals/{id}/status")
def get_approval_status(id: str, db: Session = Depends(get_db)):
    approval = db.query(PendingApproval).filter(PendingApproval.id == id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")
    return {"status": approval.status}

# Simple in-memory settings store for mock demo purposes
settings_db = {
    "core_hours": "10:00 AM to 4:00 PM",
    "hr_contact": "Sarah Jenkins",
    "hr_email": "s.jenkins@company.com",
    "documents_required": "Signed employment contract, Direct deposit form, Government ID"
}

class SettingsUpdatePayload(BaseModel):
    core_hours: str
    hr_contact: str
    hr_email: str
    documents_required: str

class CustomApprovalPayload(BaseModel):
    employee_id: str
    action_type: str
    req_details: str

@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "name": u.name,
            "role": u.role,
            "department": u.department or "General"
        }
        for u in users
    ]

@router.get("/settings")
def get_settings():
    return settings_db

@router.post("/settings")
def update_settings(payload: SettingsUpdatePayload):
    settings_db["core_hours"] = payload.core_hours
    settings_db["hr_contact"] = payload.hr_contact
    settings_db["hr_email"] = payload.hr_email
    settings_db["documents_required"] = payload.documents_required
    return {"status": "success", "settings": settings_db}

@router.post("/approvals")
def create_custom_approval(payload: CustomApprovalPayload, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload.employee_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    approval_id = str(uuid.uuid4())
    db.add(PendingApproval(
        id=approval_id,
        employee_id=user.id,
        action_type=payload.action_type,
        payload={"req": payload.req_details}
    ))
    db.commit()
    
    # Broadcast ticket creation
    run_sync(manager.broadcast({
        "type": "approval_created",
        "employee_id": user.id,
        "ticket_id": approval_id
    }))
    
    return {"status": "success", "ticket_id": approval_id}
