from sqlalchemy.orm import Session, joinedload

from api import models, schemas, utils


def get_main_summary(gh_user: str, repo: str, db: Session):
  # hard-coded
  return schemas.MainSummary(
    summaries=[
      schemas.InfoTypeSummary(type_id=1,
                              content="I would like to propose an additional instance method to the ensemble estimators to fit additional sub estimators."),
      schemas.InfoTypeSummary(type_id=2, content="There is something similar in adaboost!"),
      schemas.InfoTypeSummary(type_id=6, content="I don't know if fit_extends is the best solution to the problem.")
    ]
  )


def get_comments_summary(gh_user, repo, issue_number, db: Session):
  issue_id = utils.construct_issue_id(gh_user, repo, issue_number)
  
  comment_summaries = db.query(models.CommentSummary) \
    .options(joinedload(models.CommentSummary.authors)) \
    .filter(models.CommentSummary.issue == issue_id).all()
  
  return comment_summaries


def get_comment_summary_detail(comment_summary_id, db: Session):
  comment_summary = db.query(models.CommentSummary) \
    .options(joinedload(models.CommentSummary.authors)) \
    .options(joinedload(models.CommentSummary.comments)) \
    .filter(models.CommentSummary.id == comment_summary_id).first()
  
  return comment_summary


def post_comment_summary(gh_user, repo, issue_number, comment_summary_obj: schemas.CommentSummary, db: Session):
  issue_id = utils.construct_issue_id(gh_user, repo, issue_number)
  
  if db.query(models.Issue).filter(models.Issue.id == issue_id).first() is None:
    issue = models.Issue(id=issue_id, repo=f"{gh_user}/{repo}", issue_number=issue_number)
    db.add(issue)
    db.flush()
  
  author = db.query(models.Author).filter(models.Author.user_id == comment_summary_obj.author.user_id).first()
  if author is None:
    author = models.Author(user_id=comment_summary_obj.author.user_id, link=comment_summary_obj.author.link)
    db.add(author)
  
  comments = {comment_obj.id: models.Comment(
      id=comment_obj.id,
      author=comment_obj.author,
      commented_on=comment_obj.commented_on,
      text=comment_obj.text
    )
    for comment_obj in comment_summary_obj.comments
  }
  
  # updates
  comment_ids_updated = []
  for row_entry in db.query(models.Comment).filter(models.Comment.id.in_(comments.keys())).all():
    comment_ids_updated.append(row_entry.id)
    db.merge(comments.pop(row_entry.id))
  
  comment_summary = models.CommentSummary(
    summary=comment_summary_obj.summary,
    issue=issue_id
  )
  comment_summary.authors = [author]
  comment_summary.comments = list(comments.values())
  db.add(comment_summary)
  
  # inserting updated comments relationships because not directly added through db.add()
  # TODO
  
  db.commit()
  
  return comment_summary.id


def delete_comment_summary(comment_summary_id, db: Session):
  models.CommentSummary.filter(models.CommentSummary.id == comment_summary_id).delete()
  db.commit()
