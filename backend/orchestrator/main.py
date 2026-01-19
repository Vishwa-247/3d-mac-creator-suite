"""
Orchestrator Service - Main FastAPI Application
Port: 8011

Endpoint: GET /next?user_id=UUID
Returns the next module user should work on based on their weakness scores.

NO LLM CALLS. DETERMINISTIC ROUTING ONLY.
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

from state import fetch_user_state, update_next_module
from rules import decide, get_module_description

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
        "version": "1.0.0",
        "port": 8011,
        "description": "Deterministic rule-based routing engine"
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
    
    # Step 3: Update next_module in DB
    await update_next_module(pool, user_id, next_module)
    
    # Step 4: Return result
    return NextModuleResponse(
        next_module=next_module,
        reason=reason,
        description=get_module_description(next_module)
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


# ============ Run Server ============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8011)
