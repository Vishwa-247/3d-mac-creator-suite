"""
Orchestrator Service - Main FastAPI Application
Port: 8011

Endpoint: GET /next?user_id=UUID
Returns the next module user should work on based on their weakness scores.

v1.1: Added memory system for persistent user tracking.
"""

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

import asyncpg
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import sys
from pathlib import Path

# Add parent directory to path for shared imports
backend_root = Path(__file__).parent.parent
sys.path.insert(0, str(backend_root))

from state import fetch_user_state, update_next_module
from rules import decide, get_module_description
from shared.memory import UserMemory, create_user_memory

# Load environment variables
backend_root = Path(__file__).parent.parent
env_path = backend_root / ".env"
load_dotenv(dotenv_path=env_path)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Database configuration
DB_URL = os.getenv("SUPABASE_DB_URL", "")


# Pydantic Models
class NextModuleResponse(BaseModel):
    next_module: str
    reason: str
    description: str = ""
    memory_context: str = ""  # NEW: summary from memory system


class MemoryEventRequest(BaseModel):
    """Request body for recording memory events."""
    event_type: str
    module: str
    observation: str
    metric_name: str | None = None
    metric_value: float | None = None
    tags: list[str] | None = None


class HealthResponse(BaseModel):
    status: str
    service: str
    database: str


class UserStateResponse(BaseModel):
    user_id: str
    clarity_avg: float
    tradeoff_avg: float
    adaptability_avg: float
    failure_awareness_avg: float
    dsa_predict_skill: float
    next_module: str | None


# Lifespan for connection pool management
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage connection pool lifecycle."""
    # Startup
    if not DB_URL:
        logger.error("SUPABASE_DB_URL not set!")
        app.state.pool = None
    else:
        try:
            app.state.pool = await asyncpg.create_pool(
                dsn=DB_URL,
                min_size=2,
                max_size=10,
                command_timeout=30,
                statement_cache_size=0  # For PgBouncer compatibility
            )
            logger.info("✅ Database connection pool created")
        except Exception as e:
            logger.error(f"❌ Failed to create connection pool: {e}")
            app.state.pool = None
    
    yield
    
    # Shutdown
    if app.state.pool:
        await app.state.pool.close()
        logger.info("Database connection pool closed")


# FastAPI App
app = FastAPI(
    title="StudyMate Orchestrator Service",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ Routes ============

@app.get("/")
async def root():
    return {
        "service": "StudyMate Orchestrator",
        "version": "1.1.0",
        "port": 8011,
        "description": "Deterministic rule-based routing engine with memory",
        "features": ["rules-based routing", "user memory", "pattern detection"]
    }


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    db_status = "connected" if app.state.pool else "disconnected"
    return HealthResponse(
        status="healthy" if app.state.pool else "degraded",
        service="orchestrator",
        database=db_status
    )


@app.get("/next", response_model=NextModuleResponse)
async def get_next_module(user_id: str = Query(..., description="User UUID")):
    """
    Get the next module for a user based on their weakness scores.
    
    Flow:
    1. Fetch user_state (auto-initializes if missing)
    2. Run deterministic rules
    3. Update next_module in DB
    4. Return result
    
    Returns:
        next_module: Module identifier
        reason: Why this module was chosen
        description: Human-readable module description
    """
    pool = app.state.pool
    
    if not pool:
        logger.error("Database pool not available")
        raise HTTPException(status_code=503, detail="Database not available")
    
    # Step 1: Fetch user state (auto-initializes for new users)
    state = await fetch_user_state(pool, user_id)
    logger.info(f"Fetched state for {user_id}: clarity={state.get('clarity_avg')}, "
                f"tradeoffs={state.get('tradeoff_avg')}, adaptability={state.get('adaptability_avg')}, "
                f"failure_awareness={state.get('failure_awareness_avg')}")
    
    # Step 2: Run deterministic rules
    next_module, reason = decide(state)
    logger.info(f"Decision for {user_id}: {next_module} ({reason})")
    
    # Step 3: Get memory context (NEW)
    memory = create_user_memory(user_id, pool)
    memory_context = await memory.get_weakness_summary()
    logger.info(f"Memory context for {user_id}: {memory_context[:100]}...")
    
    # Step 4: Update next_module in DB
    await update_next_module(pool, user_id, next_module)
    
    # Step 5: Return result with memory context
    return NextModuleResponse(
        next_module=next_module,
        reason=reason,
        description=get_module_description(next_module),
        memory_context=memory_context
    )


@app.get("/state/{user_id}", response_model=UserStateResponse)
async def get_state(user_id: str):
    """
    Get current user state (for debugging/admin).
    """
    pool = app.state.pool
    
    if not pool:
        raise HTTPException(status_code=503, detail="Database not available")
    
    state = await fetch_user_state(pool, user_id)
    
    return UserStateResponse(
        user_id=user_id,
        clarity_avg=state.get("clarity_avg", 1.0),
        tradeoff_avg=state.get("tradeoff_avg", 1.0),
        adaptability_avg=state.get("adaptability_avg", 1.0),
        failure_awareness_avg=state.get("failure_awareness_avg", 1.0),
        dsa_predict_skill=state.get("dsa_predict_skill", 1.0),
        next_module=state.get("next_module")
    )


# ============ Memory Endpoints (NEW) ============

@app.post("/memory/{user_id}/record")
async def record_memory_event(user_id: str, event: MemoryEventRequest):
    """
    Record a memory event for a user.
    Use this after interviews, course completions, etc.
    """
    pool = app.state.pool
    
    if not pool:
        raise HTTPException(status_code=503, detail="Database not available")
    
    memory = create_user_memory(user_id, pool)
    event_id = await memory.record_event(
        event_type=event.event_type,
        module=event.module,
        observation=event.observation,
        metric_name=event.metric_name,
        metric_value=event.metric_value,
        tags=event.tags
    )
    
    if not event_id:
        raise HTTPException(status_code=500, detail="Failed to record event")
    
    return {"status": "ok", "event_id": event_id}


@app.get("/memory/{user_id}")
async def get_memory_context(user_id: str):
    """
    Get memory context for a user.
    Returns weakness summary, recent events, and patterns.
    """
    pool = app.state.pool
    
    if not pool:
        raise HTTPException(status_code=503, detail="Database not available")
    
    memory = create_user_memory(user_id, pool)
    context = await memory.get_orchestrator_context()
    
    return context


@app.get("/memory/{user_id}/summary")
async def get_weakness_summary(user_id: str):
    """
    Get text summary of user weaknesses.
    Useful for LLM context injection.
    """
    pool = app.state.pool
    
    if not pool:
        raise HTTPException(status_code=503, detail="Database not available")
    
    memory = create_user_memory(user_id, pool)
    summary = await memory.get_weakness_summary()
    
    return {"user_id": user_id, "summary": summary}


@app.post("/memory/{user_id}/update-patterns")
async def trigger_pattern_update(user_id: str):
    """
    Trigger pattern analysis for a user.
    Call this after recording multiple events.
    """
    pool = app.state.pool
    
    if not pool:
        raise HTTPException(status_code=503, detail="Database not available")
    
    memory = create_user_memory(user_id, pool)
    count = await memory.update_patterns()
    
    return {"status": "ok", "patterns_updated": count}


# ============ Run Server ============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8011)
