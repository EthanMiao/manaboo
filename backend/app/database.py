from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
import os
from dotenv import load_dotenv
from datetime import datetime
from pathlib import Path

load_dotenv()

# Get the project root directory (two levels up from this file)
PROJECT_ROOT = Path(__file__).parent.parent.parent
DB_PATH = PROJECT_ROOT / "data" / "manaboo.db"

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{DB_PATH}")

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

class Grammar(Base):
    __tablename__ = "grammar"
    
    id = Column(String, primary_key=True)
    level = Column(String)
    title = Column(String)
    structure = Column(String)
    usage = Column(Text)
    examples = Column(JSON)
    themes = Column(JSON)

class Exercise(Base):
    __tablename__ = "exercises"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    grammar_id = Column(String)
    type = Column(String)
    question = Column(Text)
    options = Column(JSON)
    correct_answer = Column(String)
    explanation = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Mistake(Base):
    __tablename__ = "mistakes"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String)
    grammar_id = Column(String)
    question_id = Column(String)
    user_answer = Column(Text)
    correct_answer = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

class UserProficiency(Base):
    __tablename__ = "user_proficiency"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String)
    grammar_id = Column(String)
    practice_count = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    proficiency_score = Column(Float, default=0.0)
    last_practiced = Column(DateTime, default=datetime.utcnow)

class DialogueSession(Base):
    __tablename__ = "dialogue_sessions"
    
    id = Column(String, primary_key=True)
    user_id = Column(String)
    scenario = Column(String)
    history = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class StudyStats(Base):
    __tablename__ = "study_stats"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String)
    date = Column(DateTime)
    grammar_count = Column(Integer, default=0)
    dialogue_count = Column(Integer, default=0)
    total_time_minutes = Column(Integer, default=0)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session