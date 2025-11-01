from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from API.routes import slm
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="TripBot API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(slm.router, prefix="/api/slm", tags=["SLM"])

@app.get("/")
async def root():
    return {"status": "active", "service": "TripBot API"}