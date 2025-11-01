from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from API.routes import slm

app = FastAPI(title="TripBot API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(slm.router, prefix="/api/slm", tags=["SLM"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)