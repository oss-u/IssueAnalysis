from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class InfoTypeSummary(BaseModel):
  type_id: int
  content: str

class MainSummary(BaseModel):
  summaries: List[InfoTypeSummary]

class SummaryInput(BaseModel):
  text: str

class SummaryText(BaseModel):
  summary: str

class Span(BaseModel):
  start: int
  end: int

class Sentence(BaseModel):
  span: Span
  info_type: str

class SentenceResponse(Sentence):
  id: int

class InformationTypeIdentifiedComment(BaseModel):
  comment: str
  sentences: List[Sentence]
  datetime: Optional[datetime]    # when the comment was made
  comment_id: Optional[str]

class InformationTypeIdentifiedCommentResponse(BaseModel):
  comment_id: Optional[str]
  sentences: List[SentenceResponse]
  datetime: Optional[datetime]
  comment: str

class InformationTypeSpanUpdate(BaseModel):
  span_id: int
  info_type: str
  
class CommentInformationTypeSentences(BaseModel):
  # TODO: add datetime
  comment_id: str
  text: str
  span: Span

class CommentInformationType(BaseModel):
  info_type: str
  issue: str
  sentences: List[CommentInformationTypeSentences]
  

class Author(BaseModel):
  user_id: str
  link: str
  
  class Config:
    orm_mode = True

class Comment(BaseModel):
  id: str
  text: str
  author: str
  commented_on: datetime
  
  class Config:
    orm_mode = True

class Edit(BaseModel):
  author: Author
  commented_on: datetime

class ShortCommentSummary(BaseModel):
  id: int
  summary: str
  authors: List[Author]
  
  class Config:
    orm_mode = True

class CommentSummary(BaseModel):
  summary: str
  author: Author
  comments: List[Comment]
  
class CommentSummaryWithId(CommentSummary):
  id: int

class CommentSummaryDetail(ShortCommentSummary):
  comments: List[Comment]

# TOP LEVEL SUMMARY
class TopLevelSummarySpan(BaseModel):
  summary_id: int
  summary_span: Span      # sentence span limit in summary
  comment_span: Span      # sentence span limit in corresponding comment
  commented_on: datetime
  comment_id: str

class TopLevelSummary(BaseModel):
  id: int
  text: str
  info_type: str    # TODO: Enum
  issue: str
  posted_on: datetime
  author: str
  spans: Optional[List[TopLevelSummarySpan]]

# Summarization Service
class SentenceSummRequest(BaseModel):
  text: str
  sentence_id: int

class TopLevelSummRequest(BaseModel):
  info_type: str
  sentences: List[SentenceSummRequest]

class TopLevelSummSpanResponse(BaseModel):
  id: int
  span: Span

class TopLevelSummSummaryResponse(BaseModel):
  info_type: str
  sentences: List[TopLevelSummSpanResponse]

class TopLevelSummResponse(BaseModel):
  summaries: List[TopLevelSummSummaryResponse]
