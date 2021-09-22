from fastapi import FastAPI, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List

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

@app.get("/api/{gh_user}/{repo}/main-summary/", response_model=schemas.MainSummary)
def get_main_summary(gh_user: str, repo: str, db: Session = Depends(get_db_session)):
  """
  Get main summary for the given repository.
  """
  return crud.get_main_summary(gh_user, repo, db)

@app.post("/api/{gh_user}/{repo}/main-summary/")
def post_main_summary(gh_user: str, repo: str, summary: schemas.MainSummary, db: Session = Depends(get_db_session)):
  """
  Post main summary for the given repository.
  Workflow: Generate main summary -> user edits -> post
  """
  pass

@app.post("/api/generate-summary/", response_model=schemas.SummaryText)
def generate_summary(text: str):
  """
  Generates summary from text.
  """
  pass

@app.post("/api/information-type/", response_model=List[schemas.Sentence])
def predict_information_type(comment: str):
  """
  Predict information types in sentences of a comment. Performs sentence splitting as well.
  """
  pass

@app.get("/api/{gh_user}/{repo}/sub-summary/", response_model=List[schemas.SubSummary])
def get_sub_summaries(gh_user: str, repo: str, db: Session = Depends(get_db_session)):
  """
  Gets a list of sub-summaries for a particular repository.
  Query each sub-summary for details.
  """
  pass

@app.get("/api/{gh_user}/{repo}/sub-summary/{sub_summary_id}", response_model=schemas.SubSummaryDetail)
def get_sub_summary_details(gh_user: str, repo: str, sub_summary_id: int, db: Session = Depends(get_db_session)):
  """
  Gets details of a particular sub summary.
  """
  pass

@app.post("/api/{gh_user}/{repo}/sub-summary/", response_model=schemas.SubSummaryDetail)
def post_sub_summary(gh_user: str, repo: str, sub_summary: schemas.SubSummaryDetail,
                     db: Session = Depends(get_db_session)):
  """
  Posts sub summary for the given repository.
  """
  pass
