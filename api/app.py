from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, Response
from sqlalchemy.orm import Session
from typing import List
import pickle
import pathlib

from api.database import SessionLocal
from api import schemas, crud, models, utils
from segmentation import Sentencizer

app = FastAPI()

origins = [
  "https://github.com",
  "http://localhost:8000"     # dev
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

curr_dir = pathlib.Path(__file__).parent.resolve()
with open(pathlib.Path.joinpath(curr_dir, "models/LTS.pkl"), "rb") as f:
  model = pickle.load(f)

sentencizer = Sentencizer(model)

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
def generate_summary(summary_input: schemas.SummaryInput):
  """
  Generates summary from text.
  """
  return schemas.SummaryText(summary=utils.get_summary(summary_input.text))

@app.post("/api/information-type/", response_model=List[schemas.Sentence])
def predict_information_type(comment: schemas.SummaryInput):
  """
  Predict information types in sentences of a comment. Performs sentence splitting as well.
  """
  return crud.predict_info_types(comment.text, sentencizer)

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
def get_comment_summary_detail(comment_summary_id: int, db: Session = Depends(get_db_session)):
  """
  Get details about a comment summary with particular id.
  """
  if db.query(models.CommentSummary).filter(models.CommentSummary.id == comment_summary_id).first() is None:
    raise HTTPException(status_code=404, detail="Comment summary not found.")
  
  comment_summary = crud.get_comment_summary_detail(comment_summary_id, db)
  return comment_summary

@app.delete("/api/{gh_user}/{repo}/{issue_number}/comment-summary/{comment_summary_id}/")
def delete_comment_summary(comment_summary_id: int, db: Session = Depends(get_db_session)):
  """
  Deletes the required comment summary.
  """
  if db.query(models.CommentSummary).filter(models.CommentSummary.id == comment_summary_id).first() is not None:
    crud.delete_comment_summary(comment_summary_id, db)
  return Response(status_code=204)
