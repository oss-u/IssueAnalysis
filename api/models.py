import sqlalchemy as sa
from sqlalchemy.orm import relationship

from api.database import Base


class InformationType(Base):
  __tablename__ = "infotypes"
  
  id = sa.Column(sa.Integer, autoincrement=True, primary_key=True)
  title = sa.Column(sa.String, nullable=False)


class Issue(Base):
  __tablename__ = "issues"
  
  # string combination of gh_user/repo#issue_number, for easy fk reference
  id = sa.Column(sa.String, primary_key=True)
  
  repo = sa.Column(sa.String, nullable=False)
  issue_number = sa.Column(sa.Integer, nullable=False)
  
  __table_args__ = (sa.UniqueConstraint('repo', 'issue_number', name='repo_issue_number'),)


class Author(Base):
  __tablename__ = "authors"
  
  user_id = sa.Column(sa.String, primary_key=True)
  link = sa.Column(sa.String, nullable=False)
  # comment_summaries = relationship('CommentSummary', secondary='CommentSummaryXAuthor')


class CommentSummary(Base):
  __tablename__ = "comment_summaries"
  
  id = sa.Column(sa.Integer, primary_key=True)
  summary = sa.Column(sa.String, nullable=False)
  issue = sa.Column(sa.String, sa.ForeignKey("issues.id", ondelete="CASCADE"), nullable=False)
  comments = relationship('Comment', secondary='CommentSummaryXComment', lazy="joined")
  authors = relationship('Author', secondary='CommentSummaryXAuthor', lazy="joined")


class Comment(Base):
  __tablename__ = "comments"
  
  id = sa.Column(sa.String, primary_key=True)
  text = sa.Column(sa.String, nullable=False)
  author = sa.Column(sa.String, nullable=False)
  commented_on = sa.Column(sa.DateTime, nullable=False)
  # comment_summaries = relationship('CommentSummary', secondary='CommentSummaryXComment')


class CommentSummaryXAuthor(Base):
  __tablename__ = 'CommentSummaryXAuthor'
  id = sa.Column(sa.Integer, primary_key=True)
  commentSummaryId = sa.Column(sa.Integer, sa.ForeignKey(CommentSummary.id, ondelete="CASCADE"))
  authorId = sa.Column(sa.String, sa.ForeignKey(Author.user_id))
  edit = sa.Column(sa.DateTime(timezone=True), server_default=sa.sql.func.now())


# CommentSummaryXAuthor = sa.Table('CommentSummaryXAuthor', Base.metadata,
#                                  sa.Column('id', sa.Integer, primary_key=True),
#                                  sa.Column('commentSummaryId', sa.Integer, sa.ForeignKey(CommentSummary.id)),
#                                  sa.Column('authorId', sa.String, sa.ForeignKey(Author.user_id)),
#                                  sa.Column('edit', sa.DateTime(timezone=True), server_default=sa.sql.func.now())
#                                  )


class CommentSummaryXComment(Base):
  __tablename__ = 'CommentSummaryXComment'
  id = sa.Column(sa.Integer, primary_key=True)
  commentSummaryId = sa.Column(sa.Integer, sa.ForeignKey(CommentSummary.id, ondelete="CASCADE"))
  commentId = sa.Column(sa.String, sa.ForeignKey(Comment.id))

# CommentSummaryXComment = sa.Table('CommentSummaryXComment', Base.metadata,
#                                   sa.Column('id', sa.Integer, primary_key=True),
#                                   sa.Column('commentSummaryId', sa.Integer, sa.ForeignKey(CommentSummary.id)),
#                                   sa.Column('commentId', sa.String, sa.ForeignKey(Comment.id))
#                                   )


class CommentInformationType(Base):
  __tablename__ = 'CommentInformationType'
  id = sa.Column(sa.Integer, autoincrement=True, primary_key=True)
  comment_id = sa.Column(sa.String)
  issue = sa.Column(sa.String, index=True, nullable=False)
  datetime = sa.Column(sa.DateTime)
  span_start = sa.Column(sa.Integer, nullable=False)
  span_end = sa.Column(sa.Integer, nullable=False)
  info_type = sa.Column(sa.String, nullable=False)
  text = sa.Column(sa.String, nullable=False)
