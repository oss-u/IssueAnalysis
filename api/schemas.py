from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class InfoTypeSummary(BaseModel):
  type_id: int
  content: str

class MainSummary(BaseModel):
  summaries: List[InfoTypeSummary]

class SummaryText(BaseModel):
  summary: str

class Sentence(BaseModel):
  sentence: str
  offset: int
  limit: int
  type_id: Optional[int]

class Author(BaseModel):
  user_id: str
  link: str

class Comment(BaseModel):
  id: str
  text: str
  author: Author
  commented_on: datetime

class Edit(BaseModel):
  author: Author
  commented_on: datetime

class ShortCommentSummary(BaseModel):
  id: int
  summary: str
  authors: List[Edit]

class CommentSummary(BaseModel):
  id: int   # TODO edit this out
  summary: str
  author: Author
  comments: List[Comment]

class CommentSummaryDetail(BaseModel):
  id: int
  summary: str
  authors: List[Edit]
  comments: List[Comment]
