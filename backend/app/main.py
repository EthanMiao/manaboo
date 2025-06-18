from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import grammar, dialogue, stats
from app.database import engine, Base
import asyncio

app = FastAPI(title="Manaboo API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(grammar.router, prefix="/api")
app.include_router(dialogue.router, prefix="/api")
app.include_router(stats.router, prefix="/api")

@app.on_event("startup")
async def startup():
    from app.database import DB_PATH
    # Ensure the database directory exists
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
def read_root():
    return {"message": "Welcome to Manaboo API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)