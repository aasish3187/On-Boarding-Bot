import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.schemas.payload import UserSignup
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/signup")
def signup(payload: UserSignup, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email registered.")
    
    user = User(id=str(uuid.uuid4()), email=payload.email, hashed_password=hash_password(payload.password), role=payload.role, name=payload.name)
    db.add(user)
    db.commit()
    return {"status": "success"}

@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials.")
    
    token_data = {
        "sub": user.id,
        "role": user.role,
        "name": user.name,
        "email": user.email
    }
    token = create_access_token(data=token_data)
    return {"access_token": token, "role": user.role, "name": user.name, "id": user.id}
