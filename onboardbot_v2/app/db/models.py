from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, JSON
from datetime import datetime, date
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="employee") 
    name = Column(String, nullable=False)
    department = Column(String, default="Engineering")
    start_date = Column(Date, default=date.today)

class PendingApproval(Base):
    __tablename__ = "pending_approvals"
    id = Column(String, primary_key=True)
    employee_id = Column(String, ForeignKey("users.id"))
    action_type = Column(String, nullable=False) 
    payload = Column(JSON, nullable=False)
    status = Column(String, default="pending") 
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(String, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("users.id"))
    sender = Column(String, nullable=False)  # "user" or "knowledge_rag"
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class HardwareTicket(Base):
    __tablename__ = "hardware_tickets"
    id = Column(String, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("users.id"))
    laptop_choice = Column(String, nullable=False)
    monitors = Column(String, nullable=False)
    peripherals = Column(String, nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

class PolicyQueryInsight(Base):
    __tablename__ = "policy_query_insights"
    id = Column(String, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("users.id"), nullable=True)
    query_text = Column(String, nullable=False)
    status = Column(String, default="open")  # "open" or "resolved"
    created_at = Column(DateTime, default=datetime.utcnow)

class UserProgress(Base):
    __tablename__ = "user_progress"
    user_id = Column(String, primary_key=True, index=True)
    tasks_json = Column(JSON, nullable=False)
    progress_pct = Column(String, default="20%")
    updated_at = Column(DateTime, default=datetime.utcnow)

