import logging
import os
import sys
from typing import List

import requests
from sqlalchemy.orm import Session, joinedload

from api import models, schemas, utils
from segmentation import Sentencizer

# LOGGER (taken from https://stackoverflow.com/questions/14058453/making-python-loggers-output-all-messages-to-stdout
# -in-addition-to-log-file)
root = logging.getLogger()
root.setLevel(logging.DEBUG)

handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(funcName)s - %(message)s')
handler.setFormatter(formatter)
root.addHandler(handler)


def get_main_summary(gh_user: str, repo: str, db: Session):
  # hard-coded
  return schemas.MainSummary(
    summaries=[
      schemas.InfoTypeSummary(type_id=1,
                              content="I would like to propose an additional instance method to the ensemble "
                                      "estimators to fit additional sub estimators."),
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
  db.flush()
  
  # inserting updated comments relationships because not directly added through db.add()
  comment_summary_comments_updated = [models.CommentSummaryXComment(
    commentSummaryId=comment_summary.id,
    commentId=commentId
  ) for commentId in comment_ids_updated]
  db.bulk_save_objects(comment_summary_comments_updated)
  
  db.commit()
  
  return comment_summary.id


def delete_comment_summary(comment_summary_id, db: Session):
  db.query(models.CommentSummary).filter(models.CommentSummary.id == comment_summary_id).delete()
  db.commit()


def generate_summary(text: str, sentencizer: Sentencizer) -> schemas.SummaryText:
  request_payload = {
    'type': 'comment-level',
    'sentence_set': [text[span.start:span.end] for span in sentencizer.sentencize(text)]
  }
  SUMMARIZATION_SERVICE_ENDPOINT = os.getenv('ALPHA_SUMMARY_SERVICE_ENDPOINT') \
    if os.getenv('ENVIRONMENT') == 'alpha' else os.getenv('BETA_SUMMARY_SERVICE_ENDPOINT')
  response = requests.post(SUMMARIZATION_SERVICE_ENDPOINT, json=request_payload, timeout=500)
  return schemas.SummaryText(summary=response.json()['summary'][0])


# top-level summary
def predict_info_types(comment: str, sentencizer: Sentencizer) -> List[schemas.Sentence]:
  sentence_spans = sentencizer.sentencize(comment)
  sentences = [comment[span.start:span.end] for span in sentence_spans]
  predictions = sentencizer.predict(sentences)
  
  return [
    # Span workaround for python dataclasses to pydantic models
    schemas.Sentence(span=schemas.Span(start=span.start, end=span.end), info_type=pred)
    for span, pred in zip(sentence_spans, predictions)
  ]


def save_info_types(gh_user: str, repo: str, issue_number: int, comment: schemas.InformationTypeIdentifiedComment,
                    db: Session):
  issue_id = utils.construct_issue_id(gh_user, repo, issue_number)
  spans_with_predicted_info_types = [models.CommentInformationType(
    issue=issue_id,
    span_start=sent.span.start,
    span_end=sent.span.end,
    text=comment.comment[sent.span.start:sent.span.end],
    info_type=sent.info_type,
    datetime=comment.datetime if comment.datetime else None,
    comment_id=comment.comment_id if comment.comment_id else None
  ) for sent in comment.sentences]
  db.bulk_save_objects(spans_with_predicted_info_types)
  db.commit()
  
  return get_information_type_spans(issue_id=issue_id, comment_id=comment.comment_id, db=db)


def update_info_type(span_update: schemas.InformationTypeSpanUpdate, db: Session):
  db.query(models.CommentInformationType).filter(models.CommentInformationType.id == span_update.span_id).update({
    models.CommentInformationType.info_type: span_update.info_type
  })
  db.commit()
  return span_update


def get_information_type_spans(issue_id: str, comment_id: str, db: Session):
  comment_spans = db.query(models.CommentInformationType).filter(models.CommentInformationType.issue == issue_id) \
    .filter(models.CommentInformationType.comment_id == comment_id).all()
  
  return schemas.InformationTypeIdentifiedCommentResponse(
    comment="dummy. don't use",
    comment_id=comment_id,
    sentences=[schemas.SentenceResponse(
      span=schemas.Span(start=span.span_start, end=span.span_end),
      info_type=span.info_type,
      id=span.id          # TODO: add datetime of whenever updated
    ) for span in comment_spans]
  )


# TOP LEVEL SUMMARY
def generate_top_level_summary(issue_id: str, author: str, db: Session) -> List[schemas.TopLevelSummary]:
  # for updating
  summaries_that_exist = {
    summary.info_type: summary.id
    for summary in db.query(models.TopLevelSummary).filter(models.CommentInformationType.issue == issue_id).all()
  }
  
  sentences = db.query(models.CommentInformationType).filter(models.CommentInformationType.issue == issue_id).all()
  root.info(sentences)
  
  # create request body
  top_level_summ_request_dict = {}
  
  for sentence in sentences:
    if sentence.info_type not in top_level_summ_request_dict:
      top_level_summ_request_dict[sentence.info_type] = schemas.TopLevelSummRequest(info_type=sentence.info_type,
                                                                                    sentences=[])
    top_level_summ_request_dict[sentence.info_type].sentences.append(
      schemas.SentenceSummRequest(text=sentence.text, sentence_id=sentence.id)
    )
  
  sentence_set = [request.dict() for request in top_level_summ_request_dict.values()]
  request_payload = {'type': 'top-level', 'sentence_set': sentence_set}
  root.info(f"[REQUEST PAYLOAD] {request_payload}")
  
  # request and collect response (sync)
  SUMMARIZATION_SERVICE_ENDPOINT = os.getenv('ALPHA_SUMMARY_SERVICE_ENDPOINT') \
    if os.getenv('ENVIRONMENT') == 'alpha' else os.getenv('BETA_SUMMARY_SERVICE_ENDPOINT')
  response = requests.post(SUMMARIZATION_SERVICE_ENDPOINT, json=request_payload)
  if not response.ok:
    raise ValueError("Couldn't fetch data from Summarization Service")
  response = response.json()  # List
  root.info(response)
  
  # construct summary from returned IDs
  for summary in response['summaries']:
    # pick sentence for a particular summary
    sentences = db.query(models.CommentInformationType) \
      .filter(models.CommentInformationType.id.in_(sentence['id'] for sentence in summary['sentences'])).all()
    
    # create summary text
    summary_text = []
    sentences_with_summary_span = []  # to keep track of summary spans in correct order
    for summary_sentence in summary['sentences']:  # small number of sentences. no performance hit
      for sentence in sentences:
        if summary_sentence['id'] == sentence.id:
          summary_text.append(sentence.text)
          sentences_with_summary_span.append(  # summary span
            (sentence, summary_sentence['span']))  # works as sentence to info_type mapping is 1-on-1
          break
    
    # summary database object
    top_level_summary = models.TopLevelSummary(
      text=' '.join(summary_text),
      info_type=summary['info_type'],
      issue=issue_id,
      author=author
    )
    if top_level_summary.info_type in summaries_that_exist:
      top_level_summary.id = summaries_that_exist[top_level_summary.info_type]
      db.merge(top_level_summary)
    else:
      db.add(top_level_summary)
    
    db.flush()
    db.query(models.TopLevelSummarySpan).filter(models.TopLevelSummarySpan.summary_id == top_level_summary.id).delete()
    
    # sentence span data base object for the particular summary
    summary_sentence_spans = [models.TopLevelSummarySpan(
      summary_id=top_level_summary.id,
      comment_span_start=sentence.span_start,
      comment_span_end=sentence.span_end,
      summary_span_start=summary_span['start'],
      summary_span_end=summary_span['end'],
      commented_on=sentence.datetime,
      comment_id=sentence.comment_id
    ) for sentence, summary_span in sentences_with_summary_span]
    
    db.bulk_save_objects(summary_sentence_spans)
    db.commit()
  
  return get_top_level_summary(issue_id, db)


def get_top_level_summary(issue_id: str, db: Session) -> List[schemas.TopLevelSummary]:
  top_level_summaries = db.query(models.TopLevelSummary).filter(models.TopLevelSummary.issue == issue_id).all()
  
  top_level_summary_spans = db.query(models.TopLevelSummarySpan) \
    .filter(models.TopLevelSummarySpan.summary_id.in_((summary.id for summary in top_level_summaries))).all()
  
  summary_id_map = {}  # map of top level summaries by summary_id
  for summary in top_level_summaries:
    summary_id_map[summary.id] = schemas.TopLevelSummary(
      id=summary.id,
      text=summary.text,
      info_type=summary.info_type,
      issue=summary.issue,
      posted_on=summary.posted_on,
      author=summary.author,
      spans=[]  # to fill
    )
  
  for spans_obj in top_level_summary_spans:
    summary_id_map[spans_obj.summary_id].spans.append(schemas.TopLevelSummarySpan(
      summary_id=spans_obj.summary_id,
      summary_span=schemas.Span(start=spans_obj.summary_span_start, end=spans_obj.summary_span_end),
      comment_span=schemas.Span(start=spans_obj.comment_span_start, end=spans_obj.comment_span_end),
      commented_on=spans_obj.commented_on,
      comment_id=spans_obj.comment_id
    ))
  
  # sort all spans
  for key in summary_id_map.keys():
    summary_id_map[key].spans.sort(key=lambda summary_span: summary_span.summary_span.start)
  
  return list(summary_id_map.values())


def update_top_level_summary(summary: schemas.TopLevelSummary, db: Session):
  # Can implement logic to check if the text has been edited or just formatted to
  # update spans accordingly. Future step.
  
  db.query(models.TopLevelSummary).filter(models.TopLevelSummary.id == summary.id).update({
    models.TopLevelSummary.text: summary.text,
    models.TopLevelSummary.author: summary.author,
    models.TopLevelSummary.posted_on: summary.posted_on
  })
  db.query(models.TopLevelSummarySpan).filter(models.TopLevelSummarySpan.summary_id == summary.id).delete()
  db.commit()
  
  summary.spans = []
  return summary
