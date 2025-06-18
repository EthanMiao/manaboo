from fastapi import APIRouter, Depends, Query
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from datetime import datetime, timedelta
import pandas as pd
import os
from typing import List, Dict

from app.database import get_db, StudyStats, UserProficiency, Mistake, DialogueSession
from app.models import WeeklyStats

router = APIRouter()

@router.get("/stats/weekly", response_model=WeeklyStats)
async def get_weekly_stats(
    user_id: str = Query(default="default_user"),
    db: AsyncSession = Depends(get_db)
):
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)
    
    daily_stats = []
    total_grammar = 0
    total_dialogue = 0
    
    for i in range(7):
        current_date = start_date + timedelta(days=i)
        next_date = current_date + timedelta(days=1)
        
        grammar_query = select(func.count(UserProficiency.id)).where(
            and_(
                UserProficiency.user_id == user_id,
                UserProficiency.last_practiced >= current_date,
                UserProficiency.last_practiced < next_date
            )
        )
        grammar_result = await db.execute(grammar_query)
        grammar_count = grammar_result.scalar() or 0
        
        dialogue_query = select(func.count(DialogueSession.id)).where(
            and_(
                DialogueSession.user_id == user_id,
                DialogueSession.updated_at >= current_date,
                DialogueSession.updated_at < next_date
            )
        )
        dialogue_result = await db.execute(dialogue_query)
        dialogue_count = dialogue_result.scalar() or 0
        
        daily_stats.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "grammar": grammar_count,
            "dialogue": dialogue_count
        })
        
        total_grammar += grammar_count
        total_dialogue += dialogue_count
    
    return WeeklyStats(
        dailyStats=daily_stats,
        totalGrammar=total_grammar,
        totalDialogue=total_dialogue
    )

@router.get("/stats/export")
async def export_study_data(
    user_id: str = Query(default="default_user"),
    db: AsyncSession = Depends(get_db)
):
    proficiency_query = select(UserProficiency).where(UserProficiency.user_id == user_id)
    proficiency_result = await db.execute(proficiency_query)
    proficiencies = proficiency_result.scalars().all()
    
    mistakes_query = select(Mistake).where(Mistake.user_id == user_id)
    mistakes_result = await db.execute(mistakes_query)
    mistakes = mistakes_result.scalars().all()
    
    dialogue_query = select(DialogueSession).where(DialogueSession.user_id == user_id)
    dialogue_result = await db.execute(dialogue_query)
    dialogues = dialogue_result.scalars().all()
    
    data_proficiency = []
    for p in proficiencies:
        data_proficiency.append({
            "Grammar ID": p.grammar_id,
            "Practice Count": p.practice_count,
            "Correct Count": p.correct_count,
            "Proficiency Score": p.proficiency_score,
            "Last Practiced": p.last_practiced.strftime("%Y-%m-%d %H:%M:%S") if p.last_practiced else ""
        })
    
    data_mistakes = []
    for m in mistakes:
        data_mistakes.append({
            "Grammar ID": m.grammar_id,
            "User Answer": m.user_answer,
            "Correct Answer": m.correct_answer,
            "Timestamp": m.timestamp.strftime("%Y-%m-%d %H:%M:%S") if m.timestamp else ""
        })
    
    data_dialogues = []
    for d in dialogues:
        data_dialogues.append({
            "Session ID": d.id,
            "Scenario": d.scenario,
            "Message Count": len(d.history) if d.history else 0,
            "Created At": d.created_at.strftime("%Y-%m-%d %H:%M:%S") if d.created_at else "",
            "Updated At": d.updated_at.strftime("%Y-%m-%d %H:%M:%S") if d.updated_at else ""
        })
    
    os.makedirs("data", exist_ok=True)
    
    with pd.ExcelWriter("data/manaboo_study_data.xlsx", engine='openpyxl') as writer:
        if data_proficiency:
            pd.DataFrame(data_proficiency).to_excel(writer, sheet_name='Proficiency', index=False)
        if data_mistakes:
            pd.DataFrame(data_mistakes).to_excel(writer, sheet_name='Mistakes', index=False)
        if data_dialogues:
            pd.DataFrame(data_dialogues).to_excel(writer, sheet_name='Dialogues', index=False)
    
    return FileResponse(
        path="data/manaboo_study_data.xlsx",
        filename="manaboo_study_data.xlsx",
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

@router.get("/stats/summary")
async def get_study_summary(
    user_id: str = Query(default="default_user"),
    db: AsyncSession = Depends(get_db)
):
    total_grammar_query = select(func.count(UserProficiency.id)).where(
        UserProficiency.user_id == user_id
    )
    total_grammar_result = await db.execute(total_grammar_query)
    total_grammar = total_grammar_result.scalar() or 0
    
    mastered_query = select(func.count(UserProficiency.id)).where(
        and_(
            UserProficiency.user_id == user_id,
            UserProficiency.proficiency_score >= 80
        )
    )
    mastered_result = await db.execute(mastered_query)
    mastered_count = mastered_result.scalar() or 0
    
    total_mistakes_query = select(func.count(Mistake.id)).where(
        Mistake.user_id == user_id
    )
    total_mistakes_result = await db.execute(total_mistakes_query)
    total_mistakes = total_mistakes_result.scalar() or 0
    
    total_dialogues_query = select(func.count(DialogueSession.id)).where(
        DialogueSession.user_id == user_id
    )
    total_dialogues_result = await db.execute(total_dialogues_query)
    total_dialogues = total_dialogues_result.scalar() or 0
    
    return {
        "total_grammar_practiced": total_grammar,
        "mastered_grammar": mastered_count,
        "total_mistakes": total_mistakes,
        "total_dialogue_sessions": total_dialogues,
        "mastery_rate": (mastered_count / total_grammar * 100) if total_grammar > 0 else 0
    }