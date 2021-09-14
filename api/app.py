from fastapi import FastAPI, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from api.database import SessionLocal
from api import schemas, crud

app = FastAPI()

def get_db_session():
  session = SessionLocal()
  try:
    yield session
  finally:
    session.close()

@app.get("/", response_class=RedirectResponse)
def index():
  return "/api/"

@app.get("/api/")
def api_home():
  return {
    'desc': 'API for accessing Issue-Analysis models.'
  }

@app.get("/api/main-summary/{gh_user}/{repo}/", response_model=schemas.MainSummary)
def get_main_summary(gh_user: str, repo: str, db: Session = Depends(get_db_session)):
  return crud.get_main_summary(gh_user, repo, db)
