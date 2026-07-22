from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import PendingApproval, User, ChatMessage, HardwareTicket, PolicyQueryInsight, UserProgress
from app.core.security import scrub_pii
from app.services.agent_graph import agent_graph
from app.services.websocket import manager, run_sync
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import datetime
import uuid
import csv
import io

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

# Extended Enterprise Endpoint Models
class HardwareRequestPayload(BaseModel):
    employee_id: str
    laptop_choice: str
    monitors: str
    peripherals: str

class HardwareApprovalPayload(BaseModel):
    ticket_id: str
    action: str  # "approved" or "rejected"

class PolicyQueryInsightPayload(BaseModel):
    employee_id: Optional[str] = None
    query_text: str

class UserProgressPayload(BaseModel):
    user_id: str
    tasks_json: Dict[str, bool]
    progress_pct: str

@router.get("/kanban")
def get_kanban_board(db: Session = Depends(get_db)):
    users = db.query(User).all()
    kanban = {
        "not_started": [],
        "in_progress": [],
        "pending_review": [],
        "fully_onboarded": []
    }
    
    for u in users:
        prog = db.query(UserProgress).filter(UserProgress.user_id == u.id).first()
        pct_val = int(prog.progress_pct.replace("%", "")) if prog and prog.progress_pct else 20
        pending_count = db.query(PendingApproval).filter(PendingApproval.employee_id == u.id, PendingApproval.status == "pending").count()
        
        user_card = {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "department": u.department or "General",
            "progress_pct": f"{pct_val}%",
            "role": u.role
        }
        
        if pct_val == 100:
            kanban["fully_onboarded"].append(user_card)
        elif pending_count > 0:
            kanban["pending_review"].append(user_card)
        elif pct_val > 20:
            kanban["in_progress"].append(user_card)
        else:
            kanban["not_started"].append(user_card)
            
    return kanban

@router.post("/hardware")
def request_hardware(payload: HardwareRequestPayload, db: Session = Depends(get_db)):
    ticket_id = str(uuid.uuid4())
    ticket = HardwareTicket(
        id=ticket_id,
        employee_id=payload.employee_id,
        laptop_choice=payload.laptop_choice,
        monitors=payload.monitors,
        peripherals=payload.peripherals,
        status="pending"
    )
    db.add(ticket)
    
    # Also register as pending approval for HR visibility
    approval_id = str(uuid.uuid4())
    db.add(PendingApproval(
        id=approval_id,
        employee_id=payload.employee_id,
        action_type="hardware_procurement",
        payload={
            "req": f"Hardware: {payload.laptop_choice}, {payload.monitors}, {payload.peripherals}"
        }
    ))
    db.commit()
    
    run_sync(manager.broadcast({
        "type": "hardware_ticket_created",
        "ticket_id": ticket_id
    }))
    
    return {"status": "success", "ticket_id": ticket_id}

@router.get("/hardware")
def get_hardware_tickets(db: Session = Depends(get_db)):
    tickets = db.query(HardwareTicket).all()
    result = []
    for t in tickets:
        u = db.query(User).filter(User.id == t.employee_id).first()
        result.append({
            "id": t.id,
            "employee_id": t.employee_id,
            "employee_name": u.name if u else "Unknown",
            "department": u.department if u else "Staff",
            "laptop_choice": t.laptop_choice,
            "monitors": t.monitors,
            "peripherals": t.peripherals,
            "status": t.status,
            "created_at": t.created_at.isoformat() if t.created_at else ""
        })
    return result

@router.post("/hardware/approve")
def approve_hardware_ticket(payload: HardwareApprovalPayload, db: Session = Depends(get_db)):
    t = db.query(HardwareTicket).filter(HardwareTicket.id == payload.ticket_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Hardware ticket not found")
    t.status = payload.action
    db.commit()
    return {"status": "success", "action": payload.action}

@router.get("/insights")
def get_policy_insights(db: Session = Depends(get_db)):
    insights = db.query(PolicyQueryInsight).all()
    return [
        {
            "id": i.id,
            "query_text": i.query_text,
            "status": i.status,
            "created_at": i.created_at.isoformat() if i.created_at else ""
        }
        for i in insights
    ]

@router.post("/insights")
def log_policy_insight(payload: PolicyQueryInsightPayload, db: Session = Depends(get_db)):
    insight_id = str(uuid.uuid4())
    db.add(PolicyQueryInsight(
        id=insight_id,
        employee_id=payload.employee_id,
        query_text=payload.query_text,
        status="open"
    ))
    db.commit()
    return {"status": "success", "id": insight_id}

@router.post("/progress")
def update_user_progress(payload: UserProgressPayload, db: Session = Depends(get_db)):
    prog = db.query(UserProgress).filter(UserProgress.user_id == payload.user_id).first()
    if not prog:
        prog = UserProgress(
            user_id=payload.user_id,
            tasks_json=payload.tasks_json,
            progress_pct=payload.progress_pct
        )
        db.add(prog)
    else:
        prog.tasks_json = payload.tasks_json
        prog.progress_pct = payload.progress_pct
        prog.updated_at = datetime.datetime.utcnow()
    db.commit()
    return {"status": "success", "progress_pct": payload.progress_pct}

@router.get("/progress/{user_id}")
def get_user_progress(user_id: str, db: Session = Depends(get_db)):
    prog = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
    if not prog:
        return {
            "tasks": {"login": True, "policy": False, "leave": False, "it": False, "doc": False},
            "progress_pct": "20%"
        }
    return {
        "tasks": prog.tasks_json,
        "progress_pct": prog.progress_pct
    }

@router.get("/export/audit-csv")
def export_audit_csv(db: Session = Depends(get_db)):
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["Record Type", "ID", "Employee Name", "Details/Action", "Status", "Timestamp"])
    
    # Approvals
    approvals = db.query(PendingApproval).all()
    for a in approvals:
        u = db.query(User).filter(User.id == a.employee_id).first()
        name = u.name if u else a.employee_id
        req_detail = a.payload.get("req", a.action_type) if isinstance(a.payload, dict) else str(a.payload)
        writer.writerow(["Approval Ticket", a.id, name, req_detail, a.status, a.created_at.isoformat() if a.created_at else ""])
        
    # Hardware Tickets
    hardware = db.query(HardwareTicket).all()
    for h in hardware:
        u = db.query(User).filter(User.id == h.employee_id).first()
        name = u.name if u else h.employee_id
        detail = f"Laptop: {h.laptop_choice} | Monitors: {h.monitors} | Peripherals: {h.peripherals}"
        writer.writerow(["Hardware Request", h.id, name, detail, h.status, h.created_at.isoformat() if h.created_at else ""])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=onboarding_audit_report.csv"}
    )

