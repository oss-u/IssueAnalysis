from sqlalchemy.orm import Session
from typing import Dict

from api.database import Base

def construct_issue_id(gh_user: str, repo: str, issue_number: int) -> str:
  return f"{gh_user}/{repo}#{issue_number}"

def upsert(items: Dict, model: Base, db: Session):
  """
  Upsert items.
  :param items: Dictionary of <id: primary key, object: model>
  :param model: model class
  :param db: database session
  """
  for row_entry in db.query(Base.id).filter(model.id.in_(items.keys())).all():
    db.merge(items.pop(row_entry.id))

  db.bulk_save_objects(items.values())

def get_summary(text: str) -> str:
  lorem_text = """Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sed tortor efficitur, scelerisque
  nulla eget, sollicitudin purus. Quisque placerat mi ipsum, nec efficitur orci dignissim vel. Sed lobortis suscipit
  condimentum. Cras mattis eleifend lacus nec ullamcorper. Integer vehicula ante lacus, eu vulputate velit ultrices
  non. Vestibulum sit amet sapien et augue scelerisque aliquam. Sed et libero augue. Integer a diam a diam molestie
  rutrum sit amet ut leo. Sed quis nisl placerat, facilisis lectus in, porttitor est. Pellentesque pellentesque nisl
  ac ante mattis condimentum. """
  
  return f"{text[:min(len(lorem_text), len(text))]}" \
         f"{lorem_text[:len(lorem_text)-len(text)] if len(lorem_text)>len(text) else ''}"
