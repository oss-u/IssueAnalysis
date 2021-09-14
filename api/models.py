import sqlalchemy as sa

from api.database import Base

class InformationType(Base):
  __tablename__ = "infotypes"
  
  id = sa.Column(sa.Integer, autoincrement=True, primary_key=True)
  title = sa.Column(sa.String, nullable=False)
