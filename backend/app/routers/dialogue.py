from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Dict
import uuid
from datetime import datetime

from app.database import get_db, DialogueSession
from app.models import DialogueRequest, DialogueResponse, CorrectionRequest, CorrectionResponse
from app.services.openai_service import openai_service

router = APIRouter()

SCENARIOS = {
    "greeting": "打招呼",
    "interview": "面试",
    "shopping": "购物",
    "restaurant": "餐厅",
    "hospital": "看病",
    "hotel": "酒店",
    "direction": "问路",
    "phone": "电话"
}

@router.get("/scenarios")
async def get_scenarios():
    return {"scenarios": [{"id": k, "name": v} for k, v in SCENARIOS.items()]}

@router.post("/dialogue/send", response_model=DialogueResponse)
async def send_message(
    request: DialogueRequest,
    user_id: str = "default_user",
    db: AsyncSession = Depends(get_db)
):
    session_id = request.sessionId
    
    if not session_id:
        session_id = str(uuid.uuid4())
        session = DialogueSession(
            id=session_id,
            user_id=user_id,
            scenario=request.scenarioId,
            history=[]
        )
        db.add(session)
    else:
        result = await db.execute(select(DialogueSession).where(DialogueSession.id == session_id))
        session = result.scalar_one_or_none()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
    
    history = session.history or []
    history.append({"role": "user", "text": request.message})
    
    scenario_name = SCENARIOS.get(request.scenarioId, "日常会话")
    ai_response = await openai_service.generate_dialogue_response(
        scenario_name,
        request.message,
        history
    )
    
    history.append({"role": "assistant", "text": ai_response["reply"]})
    session.history = history
    session.updated_at = datetime.utcnow()
    
    correction = await openai_service.correct_japanese(request.message)
    
    await db.commit()
    
    return DialogueResponse(
        reply=ai_response["reply"],
        sessionId=session_id,
        correction=correction if correction["corrected"] != request.message else None
    )

@router.post("/dialogue/correct", response_model=CorrectionResponse)
async def correct_message(request: CorrectionRequest):
    result = await openai_service.correct_japanese(request.message)
    
    return CorrectionResponse(
        corrected=result["corrected"],
        explanation=result["explanation"],
        zh=result["zh"]
    )

@router.get("/dialogue/history/{session_id}")
async def get_dialogue_history(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(DialogueSession).where(DialogueSession.id == session_id))
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "sessionId": session.id,
        "scenario": session.scenario,
        "history": session.history,
        "created_at": session.created_at,
        "updated_at": session.updated_at
    }

@router.delete("/dialogue/session/{session_id}")
async def delete_session(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(DialogueSession).where(DialogueSession.id == session_id))
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    await db.delete(session)
    await db.commit()
    
    return {"message": "Session deleted successfully"}