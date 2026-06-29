from pydantic import BaseModel, EmailStr
from typing import Literal, Optional

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: Literal["employee", "hr"]
    department: Optional[str] = "Engineering"

class ChatPayload(BaseModel):
    message: str
