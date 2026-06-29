from passlib.context import CryptContext
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
analyzer = AnalyzerEngine()
anonymizer = AnonymizerEngine()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def scrub_pii(text: str) -> str:
    target_entities = ["EMAIL_ADDRESS", "PHONE_NUMBER", "US_SSN", "CREDIT_CARD", "IP_ADDRESS"]
    results = analyzer.analyze(text=text, entities=target_entities, language="en")
    if not results:
        return text
    anonymized = anonymizer.anonymize(text=text, analyzer_results=results)
    return anonymized.text

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt

SECRET_KEY = "SUPER_SECRET_KEY_ONBOARDBOT_V2_DEVELOPMENT_ONLY_DO_NOT_USE_IN_PROD"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
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
