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
