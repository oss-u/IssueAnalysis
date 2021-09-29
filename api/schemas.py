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
  name: str
  link: str

class Comment(BaseModel):
  id: Optional[int]
  text: str
  author: Author
  commented_on: datetime

class CompleteCommentSummary(BaseModel):
  id: Optional[int]
  summary: Optional[str]
  n_comments: int
  author: Author
  comments: List[Comment]
  commented_on: datetime

# class SubSummary(BaseModel):
#   id: Optional[int]
#   summary: str
#   n_comments: int
#   author: Author
#
#
# class SubSummaryDetail(SubSummary):
#   comments: List[Comment]
