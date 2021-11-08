from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class InfoTypeSummary(BaseModel):
  type_id: int
  content: str

class MainSummary(BaseModel):
  summaries: List[InfoTypeSummary]

class SummaryInput(BaseModel):
  text: str

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
