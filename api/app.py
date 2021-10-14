from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List

from api.database import SessionLocal
from api import schemas, crud, models, utils

app = FastAPI()

def get_db_session():
  session = SessionLocal()
  try:
    yield session
  except BaseException:
    session.rollback()
    raise
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
  return schemas.SummaryText(summary=utils.get_summary(text))

@app.post("/api/information-type/", response_model=List[schemas.Sentence])
def predict_information_type(comment: str):
  """
  Predict information types in sentences of a comment. Performs sentence splitting as well.
  """
  pass

@app.post("/api/{gh_user}/{repo}/{issue_number}/comment-summary/", response_model=schemas.CommentSummaryWithId)
def post_comments_summary(gh_user: str, repo: str, issue_number: int, comment_summary: schemas.CommentSummary,
                          db: Session = Depends(get_db_session)):
  """
  Post new comment summaries. Datetime taken in ISO-8601 format (including timezone)
  """
  comment_summary_id = crud.post_comment_summary(gh_user, repo, issue_number, comment_summary, db)
  return schemas.CommentSummaryWithId(id=comment_summary_id, **comment_summary.dict())

@app.get("/api/{gh_user}/{repo}/{issue_number}/comment-summary/", response_model=List[schemas.ShortCommentSummary])
def get_comments_summary(gh_user: str, repo: str, issue_number: int, db: Session = Depends(get_db_session)):
  """
  Returns a list of comment summaries for the particular issue in the repository.
  """
  issue_id = utils.construct_issue_id(gh_user, repo, issue_number)
  if db.query(models.Issue).filter(models.Issue.id == issue_id).first() is None:
    raise HTTPException(status_code=404, detail="Issue thread not found.")
  
  comment_summaries = crud.get_comments_summary(gh_user, repo, issue_number, db)
  return comment_summaries

@app.get("/api/{gh_user}/{repo}/{issue_number}/comment-summary/{comment_summary_id}/",
         response_model=schemas.CommentSummaryDetail)
def get_comment_summary_detail(comment_summary_id: int,
                               db: Session = Depends(get_db_session)):
  """
  Get details about a comment summary with particular id.
  """
  if db.query(models.CommentSummary).filter(models.CommentSummary.id == comment_summary_id).first() is None:
    raise HTTPException(status_code=404, detail="Comment summary not found.")
  
  comment_summary = crud.get_comment_summary_detail(comment_summary_id, db)
  return comment_summary
