import os
import re
import bcrypt
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt

EMAIL_REGEX = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')
PHONE_REGEX = re.compile(r'\b(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b')
SSN_REGEX = re.compile(r'\b\d{3}-\d{2}-\d{4}\b')
IP_REGEX = re.compile(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b')
CREDIT_CARD_REGEX = re.compile(r'\b(?:\d[ -]*?){13,16}\b')

SECRET_KEY = os.getenv("JWT_SECRET", os.getenv("SECRET_KEY", "SUPER_SECRET_KEY_ONBOARDBOT_V2_DEVELOPMENT_ONLY_DO_NOT_USE_IN_PROD"))
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

def hash_password(password: str) -> str:
    """Safely hash password using bcrypt, enforcing the 72-byte max length."""
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Safely verify plain password against bcrypt hash."""
    try:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception as e:
        print(f"[Password Verification Error] {e}")
        return False

def scrub_pii(text: str) -> str:
    if not text:
        return text
    text = EMAIL_REGEX.sub("<EMAIL_ADDRESS>", text)
    text = PHONE_REGEX.sub("<PHONE_NUMBER>", text)
    text = SSN_REGEX.sub("<US_SSN>", text)
    text = CREDIT_CARD_REGEX.sub("<CREDIT_CARD>", text)
    text = IP_REGEX.sub("<IP_ADDRESS>", text)
    return text

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
