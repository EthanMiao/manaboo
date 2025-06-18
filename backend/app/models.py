from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class GrammarExerciseRequest(BaseModel):
    grammarId: str
    type: str

class SubmitAnswerRequest(BaseModel):
    grammarId: str
    questionId: str
    userAnswer: str

class GrammarFilter(BaseModel):
    level: Optional[str] = None
    theme: Optional[str] = None

class GrammarItem(BaseModel):
    id: str
    level: str
    title: str
    structure: str
    usage: str
    examples: List[Dict[str, str]]
    themes: List[str]
    proficiency: Optional[float] = 0.0

class ExerciseQuestion(BaseModel):
    id: str
    type: str
    question: str
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: str

class ExerciseResult(BaseModel):
    result: str
    explanation: str
    correct_answer: str
    suggestion: Optional[str] = None

class DialogueRequest(BaseModel):
    scenarioId: str
    message: str
    sessionId: Optional[str] = None

class DialogueResponse(BaseModel):
    reply: str
    sessionId: str
    correction: Optional[Dict[str, str]] = None

class CorrectionRequest(BaseModel):
    message: str

class CorrectionResponse(BaseModel):
    corrected: str
    explanation: str
    zh: str

class MistakeDetail(BaseModel):
    id: int
    grammarId: str
    questionId: str
    user_answer: str
    correct_answer: str
    explanation: str
    timestamp: datetime

class WeeklyStats(BaseModel):
    dailyStats: List[Dict[str, Any]]
    totalGrammar: int
    totalDialogue: int

class ProficiencyScore(BaseModel):
    grammarId: str
    score: float
    practice_count: int
    accuracy: float