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

@app.post("/api/{gh_user}/{repo}/{issue_number}/comment-summary/", response_model=schemas.CommentSummaryDetail)
def post_comments_summary(gh_user: str, repo: str, issue_number: int, comments: schemas.CompleteCommentSummary,
                          db: Session = Depends(get_db_session)):
  """
  Takes comments. If summary field given, then saves it otherwise returns with generated summary.
  """
  pass

@app.get("/api/{gh_user}/{repo}/{issue_number}/comment-summary/", response_model=List[schemas.CommentSummary])
def get_comments_summary(gh_user: str, repo: str, issue_number: int, db: Session = Depends(get_db_session)):
  """
  Returns a list of comment summaries for the particular issue in the repository.
  """
  pass

@app.get("/api/{gh_user}/{repo}/{issue_number}/comment-summary/{comment_summary_id}/",
         response_model=schemas.CommentSummaryDetail)
def get_comment_summary_detail(gh_user: str, repo: str, issue_number: int, comment_id: int,
                               db: Session = Depends(get_db_session)):
  """
  Get details about a comment summary with particular id.
  """
  pass
