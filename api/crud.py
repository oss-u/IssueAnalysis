from sqlalchemy.orm import Session
from api import models, schemas

def get_main_summary(gh_user: str, repo: str, db: Session):
  # hard-coded
  return schemas.MainSummary(
    summaries=[
      schemas.InfoTypeSummary(type_id=1, content="I would like to propose an additional instance method to the ensemble estimators to fit additional sub estimators."),
      schemas.InfoTypeSummary(type_id=2, content="There is something similar in adaboost!"),
      schemas.InfoTypeSummary(type_id=6, content="I don't know if fit_extends is the best solution to the problem.")
    ]
  )
