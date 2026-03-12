import sys
import os
from fastapi import FastAPI

# Add parent directory to path so db module can be imported
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
# Add current directory to path so routers can be imported
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from routers import search, recommend, eta

app = FastAPI()

# Include routers
app.include_router(search.router)
app.include_router(recommend.router)
app.include_router(eta.router)

@app.get("/")
def root():
    return {"message": "AI Service running"}
