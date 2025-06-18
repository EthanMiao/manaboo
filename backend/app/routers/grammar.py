from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from typing import List, Optional
import uuid
from datetime import datetime

from app.database import get_db, Grammar, Exercise, Mistake, UserProficiency
from app.models import (
    GrammarItem, GrammarExerciseRequest, SubmitAnswerRequest,
    ExerciseQuestion, ExerciseResult, MistakeDetail, ProficiencyScore
)
from app.services.openai_service import openai_service
from app.utils.grammar_data import get_initial_grammar_data

router = APIRouter()

@router.get("/grammar/list", response_model=List[GrammarItem])
async def list_grammar(
    level: Optional[str] = Query(None),
    theme: Optional[str] = Query(None),
    user_id: str = Query(default="default_user"),
    db: AsyncSession = Depends(get_db)
):
    query = select(Grammar)
    
    if level:
        query = query.where(Grammar.level == level)
    
    result = await db.execute(query)
    grammars = result.scalars().all()
    
    if theme:
        grammars = [g for g in grammars if theme in (g.themes or [])]
    
    grammar_items = []
    for g in grammars:
        prof_query = select(UserProficiency).where(
            and_(
                UserProficiency.user_id == user_id,
                UserProficiency.grammar_id == g.id
            )
        )
        prof_result = await db.execute(prof_query)
        proficiency = prof_result.scalar_one_or_none()
        
        item = GrammarItem(
            id=g.id,
            level=g.level,
            title=g.title,
            structure=g.structure,
            usage=g.usage,
            examples=g.examples or [],
            themes=g.themes or [],
            proficiency=proficiency.proficiency_score if proficiency else 0.0
        )
        grammar_items.append(item)
    
    return grammar_items

@router.get("/grammar/{grammar_id}", response_model=GrammarItem)
async def get_grammar_detail(
    grammar_id: str,
    user_id: str = Query(default="default_user"),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Grammar).where(Grammar.id == grammar_id))
    grammar = result.scalar_one_or_none()
    
    if not grammar:
        raise HTTPException(status_code=404, detail="Grammar not found")
    
    prof_query = select(UserProficiency).where(
        and_(
            UserProficiency.user_id == user_id,
            UserProficiency.grammar_id == grammar_id
        )
    )
    prof_result = await db.execute(prof_query)
    proficiency = prof_result.scalar_one_or_none()
    
    return GrammarItem(
        id=grammar.id,
        level=grammar.level,
        title=grammar.title,
        structure=grammar.structure,
        usage=grammar.usage,
        examples=grammar.examples or [],
        themes=grammar.themes or [],
        proficiency=proficiency.proficiency_score if proficiency else 0.0
    )

@router.post("/exercise/generate", response_model=List[ExerciseQuestion])
async def generate_exercise(
    req: GrammarExerciseRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Grammar).where(Grammar.id == req.grammarId))
    grammar = result.scalar_one_or_none()
    
    if not grammar:
        raise HTTPException(status_code=404, detail="Grammar not found")
    
    exercise_data = await openai_service.generate_exercise(grammar.title, req.type)
    
    questions = []
    for q in exercise_data.get("questions", []):
        question_id = str(uuid.uuid4())
        
        exercise = Exercise(
            grammar_id=req.grammarId,
            type=req.type,
            question=q["question"],
            options=q.get("options"),
            correct_answer=q["correct_answer"],
            explanation=q["explanation"]
        )
        db.add(exercise)
        
        questions.append(ExerciseQuestion(
            id=question_id,
            type=req.type,
            question=q["question"],
            options=q.get("options"),
            correct_answer=q["correct_answer"],
            explanation=q["explanation"]
        ))
    
    await db.commit()
    return questions

@router.post("/exercise/submit", response_model=ExerciseResult)
async def submit_answer(
    req: SubmitAnswerRequest,
    user_id: str = Query(default="default_user"),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Grammar).where(Grammar.id == req.grammarId))
    grammar = result.scalar_one_or_none()
    
    if not grammar:
        raise HTTPException(status_code=404, detail="Grammar not found")
    
    check_result = await openai_service.check_answer(
        grammar.title,
        req.userAnswer,
        req.userAnswer
    )
    
    prof_query = select(UserProficiency).where(
        and_(
            UserProficiency.user_id == user_id,
            UserProficiency.grammar_id == req.grammarId
        )
    )
    prof_result = await db.execute(prof_query)
    proficiency = prof_result.scalar_one_or_none()
    
    if not proficiency:
        proficiency = UserProficiency(
            user_id=user_id,
            grammar_id=req.grammarId,
            practice_count=0,
            correct_count=0,
            proficiency_score=0.0
        )
        db.add(proficiency)
    
    proficiency.practice_count += 1
    if check_result["result"] == "correct":
        proficiency.correct_count += 1
    else:
        mistake = Mistake(
            user_id=user_id,
            grammar_id=req.grammarId,
            question_id=req.questionId,
            user_answer=req.userAnswer,
            correct_answer=check_result.get("suggestion", "")
        )
        db.add(mistake)
    
    proficiency.proficiency_score = (proficiency.correct_count / proficiency.practice_count) * 100
    proficiency.last_practiced = datetime.utcnow()
    
    await db.commit()
    
    return ExerciseResult(
        result=check_result["result"],
        explanation=check_result["explanation"],
        correct_answer=check_result.get("suggestion", ""),
        suggestion=check_result.get("suggestion")
    )

@router.get("/mistakes", response_model=List[MistakeDetail])
async def get_mistake_list(
    user_id: str = Query(default="default_user"),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Mistake).where(Mistake.user_id == user_id).order_by(Mistake.timestamp.desc())
    )
    mistakes = result.scalars().all()
    
    mistake_details = []
    for m in mistakes:
        grammar_result = await db.execute(select(Grammar).where(Grammar.id == m.grammar_id))
        grammar = grammar_result.scalar_one_or_none()
        
        detail = MistakeDetail(
            id=m.id,
            grammarId=m.grammar_id,
            questionId=m.question_id,
            user_answer=m.user_answer,
            correct_answer=m.correct_answer,
            explanation=f"Grammar: {grammar.title if grammar else 'Unknown'}",
            timestamp=m.timestamp
        )
        mistake_details.append(detail)
    
    return mistake_details

@router.get("/mistakes/detail")
async def get_mistake_detail(
    id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Mistake).where(Mistake.id == id))
    mistake = result.scalar_one_or_none()
    
    if not mistake:
        raise HTTPException(status_code=404, detail="Mistake not found")
    
    grammar_result = await db.execute(select(Grammar).where(Grammar.id == mistake.grammar_id))
    grammar = grammar_result.scalar_one_or_none()
    
    return MistakeDetail(
        id=mistake.id,
        grammarId=mistake.grammar_id,
        questionId=mistake.question_id,
        user_answer=mistake.user_answer,
        correct_answer=mistake.correct_answer,
        explanation=f"Grammar: {grammar.title if grammar else 'Unknown'}",
        timestamp=mistake.timestamp
    )

@router.get("/proficiency/{grammar_id}", response_model=ProficiencyScore)
async def get_proficiency(
    grammar_id: str,
    user_id: str = Query(default="default_user"),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(UserProficiency).where(
            and_(
                UserProficiency.user_id == user_id,
                UserProficiency.grammar_id == grammar_id
            )
        )
    )
    proficiency = result.scalar_one_or_none()
    
    if not proficiency:
        return ProficiencyScore(
            grammarId=grammar_id,
            score=0.0,
            practice_count=0,
            accuracy=0.0
        )
    
    accuracy = (proficiency.correct_count / proficiency.practice_count * 100) if proficiency.practice_count > 0 else 0
    
    return ProficiencyScore(
        grammarId=grammar_id,
        score=proficiency.proficiency_score,
        practice_count=proficiency.practice_count,
        accuracy=accuracy
    )

@router.get("/recommendations/grammar", response_model=List[str])
async def get_recommendations(
    user_id: str = Query(default="default_user"),
    db: AsyncSession = Depends(get_db)
):
    query = select(UserProficiency).where(
        and_(
            UserProficiency.user_id == user_id,
            UserProficiency.proficiency_score < 60
        )
    ).order_by(UserProficiency.proficiency_score).limit(5)
    
    result = await db.execute(query)
    low_proficiency = result.scalars().all()
    
    recommendations = [prof.grammar_id for prof in low_proficiency]
    
    if len(recommendations) < 5:
        mistakes_query = select(Mistake.grammar_id, func.count(Mistake.id).label('count')).where(
            Mistake.user_id == user_id
        ).group_by(Mistake.grammar_id).order_by(func.count(Mistake.id).desc()).limit(5)
        
        mistakes_result = await db.execute(mistakes_query)
        frequent_mistakes = mistakes_result.all()
        
        for grammar_id, _ in frequent_mistakes:
            if grammar_id not in recommendations:
                recommendations.append(grammar_id)
                if len(recommendations) >= 5:
                    break
    
    return recommendations[:5]

@router.on_event("startup")
async def initialize_grammar_data():
    from app.database import AsyncSessionLocal, DB_PATH, engine, Base
    # Ensure the database directory exists
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(func.count(Grammar.id)))
        count = result.scalar()
        
        if count == 0:
            grammar_data = get_initial_grammar_data()
            for g in grammar_data:
                grammar = Grammar(**g)
                db.add(grammar)
            await db.commit()