import pathlib
import pickle
from typing import List

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, Response
from sqlalchemy.orm import Session

from api import schemas, crud, models, utils
from api.database import SessionLocal
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
with open(pathlib.Path.joinpath(curr_dir, "ml_models/LTS.pkl"), "rb") as f:
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
  # return schemas.SummaryText(summary=utils.get_summary(summary_input.text))
  return crud.generate_summary(text=summary_input.text, sentencizer=sentencizer)

@app.post("/api/predict-information-type/", response_model=List[schemas.Sentence])
def predict_information_type(comment: schemas.SummaryInput):
  """
  Predict information types in sentences of a comment. Performs sentence splitting as well.
  """
  return crud.predict_info_types(comment.text, sentencizer)

@app.post("/api/{gh_user}/{repo}/{issue_number}/save-information-type/",
          response_model=schemas.InformationTypeIdentifiedCommentResponse)
def save_information_type(gh_user: str, repo: str, issue_number: int, comment: schemas.InformationTypeIdentifiedComment,
                          db: Session = Depends(get_db_session)):
  """
  Saves the predicted and edited information types of a comment. Assumes sentence split.
  """
  return crud.save_info_types(gh_user, repo, issue_number, comment, db)

@app.get("/api/{gh_user}/{repo}/{issue_number}/information-type/",
         response_model=schemas.InformationTypeIdentifiedCommentResponse)
def get_information_type(gh_user: str, repo: str, issue_number: int, comment_id: str,
                         db: Session = Depends(get_db_session)):
  """
  Returns all the sentence spans stored for a comment_id in an issue.
  """
  issue_id = utils.construct_issue_id(gh_user, repo, issue_number)
  if db.query(models.CommentInformationType).filter(models.CommentInformationType.issue==issue_id).filter(models.CommentInformationType.comment_id==comment_id).first() is None:
    return HTTPException(status_code=404, detail="Not found.")
  return crud.get_information_type_spans(issue_id, comment_id, db)

@app.post("/api/update-information-type/")
def update_information_type(span_update: schemas.InformationTypeSpanUpdate, db: Session = Depends(get_db_session)):
  """
  Updates information type of a span by its ID.
  """
  if db.query(models.CommentInformationType).filter(models.CommentInformationType.id==span_update.span_id).first() is None:
    return HTTPException(status_code=404, detail="Not found.")
  return crud.update_info_type(span_update, db)

@app.post("/api/{gh_user}/{repo}/{issue_number}/get-segmented-comments/",
          response_model=List[schemas.CommentInformationType])
def get_segmented_comments(gh_user: str, repo: str, issue_number: int, db: Session = Depends(get_db_session)):
  """
  Returns all the comments in the issue thread with information type tagged sentences in it.
  """
  # TODO: Make it paginated
  issue = utils.construct_issue_id(gh_user, repo, issue_number)
  if db.query(models.CommentInformationType).filter(models.CommentInformationType.issue==issue).first() is None:
    return HTTPException(status_code=404, detail="Issue not found.")
  return crud.get_segmented_comments(issue, db)

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

@app.post("/api/{gh_user}/{repo}/{issue_number}/comment-summary/{comment_summary_id}/update-summary")
def update_comment_summary_summary(comment_summary_id: int, summary: schemas.SummaryInput,
                                   db: Session = Depends(get_db_session)):
  """
  Updates summary part of a comment summary with given id.
  """
  if db.query(models.CommentSummary).filter(models.CommentSummary.id == comment_summary_id).first() is not None:
    crud.update_comment_summary_summary(comment_summary_id, summary.text, db)
  return Response(status_code=404)

@app.post("/api/{gh_user}/{repo}/{issue_number}/comment-summary/{comment_summary_id}/update-comments")
def update_comment_summary_comment(comment_summary_id: int, comments: List[schemas.Comment],
                                   db: Session = Depends(get_db_session)):
  """
  Updates comments part of a comment summary with given id.
  """
  if db.query(models.CommentSummary).filter(models.CommentSummary.id == comment_summary_id).first() is not None:
    crud.update_comment_summary_comment(comment_summary_id, comments, db)
  return Response(status_code=404)

# TOP LEVEL SUMMARY
@app.post("/api/{gh_user}/{repo}/{issue_number}/generate-top-level-summary/",
          response_model=List[schemas.TopLevelSummary])
def generate_top_level_summary(gh_user: str, repo: str, issue_number: int, author: str,
                               db: Session = Depends(get_db_session)):
  """
  Generates top level summaries and saves them.
  """
  issue_id = utils.construct_issue_id(gh_user, repo, issue_number)
  
  try:
    return crud.generate_top_level_summary(issue_id, author, db)
  except ValueError:
    return HTTPException(status_code=503, detail="Summarization service unable for some reason.")

@app.get("/api/{gh_user}/{repo}/{issue_number}/top-level-summary/", response_model=List[schemas.TopLevelSummary])
def get_top_level_summary(gh_user: str, repo: str, issue_number: int, db: Session = Depends(get_db_session)):
  """
  Returns all the top level summaries and the sentence-to-comment level context for a particular
  issue id.
  """
  issue_id = utils.construct_issue_id(gh_user, repo, issue_number)
  if db.query(models.TopLevelSummary).filter(models.TopLevelSummary.issue == issue_id).first() is None:
    raise HTTPException(status_code=404, detail=f"Top level summary does not exist for {issue_id} issue.")
  return crud.get_top_level_summary(issue_id, db)

@app.post("/api/{gh_user}/{repo}/{issue_number}/top-level-summary/", response_model=schemas.TopLevelSummary)
def update_top_level_summary(gh_user: str, repo: str, issue_number: int, summary: schemas.TopLevelSummary,
                             db: Session = Depends(get_db_session)):
  """
  Updates top level summary when the user edits the generated one. Single info type summary is updated through
  this endpoint.
  Note: The comment level context is lost, that is, no information on which
  sentence of summary belongs to which comment.
  """
  issue_id = utils.construct_issue_id(gh_user, repo, issue_number)
  if db.query(models.TopLevelSummary).filter(models.TopLevelSummary.id == summary.id).first() is None:
    raise HTTPException(status_code=404, detail=f"No top level summary exists with id: {summary.id}.")
  return crud.update_top_level_summary(summary, db)

@app.post("/test/generate-summary/", response_model=schemas.TopLevelSummResponse)
def test_generate_summary():
  """
  Endpoint for mocking summarization service. Replaced with actual service in beta.
  """
  return schemas.TopLevelSummResponse(
    summaries=[
      schemas.TopLevelSummSummaryResponse(
        info_type="Social Conversation",
        sentences=[
          schemas.TopLevelSummSpanResponse(
            id=2,
            span=schemas.Span(
              start=0,
              end=12
            )
          )
        ]
      ),
      schemas.TopLevelSummSummaryResponse(
        info_type="Investigation and Exploration",
        sentences=[
          schemas.TopLevelSummSpanResponse(
            id=3,
            span=schemas.Span(
              start=13,
              end=27
            )
          )
        ]
      )
    ]
  )
