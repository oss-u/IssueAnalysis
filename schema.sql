CREATE TABLE infotypes (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL
);

CREATE TABLE issues (
    id VARCHAR PRIMARY KEY,
    repo VARCHAR NOT NULL,
    issue_number INTEGER NOT NULL,
    CONSTRAINT repo_issue_number UNIQUE (repo, issue_number)
);

CREATE TABLE authors (
    user_id VARCHAR PRIMARY KEY,
    link VARCHAR NOT NULL
);

CREATE TABLE comment_summaries (
    id SERIAL PRIMARY KEY,
    summary VARCHAR NOT NULL,
    issue VARCHAR NOT NULL REFERENCES issues(id) ON DELETE CASCADE
);

CREATE TABLE comments (
    id VARCHAR PRIMARY KEY,
    text VARCHAR NOT NULL,
    author VARCHAR NOT NULL,
    commented_on TIMESTAMP NOT NULL
);

CREATE TABLE "CommentSummaryXAuthor" (
    id SERIAL PRIMARY KEY,
    "commentSummaryId" INTEGER REFERENCES comment_summaries(id) ON DELETE CASCADE,
    "authorId" VARCHAR REFERENCES authors(user_id),
    edit TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "CommentSummaryXComment" (
    id SERIAL PRIMARY KEY,
    "commentSummaryId" INTEGER REFERENCES comment_summaries(id) ON DELETE CASCADE,
    "commentId" VARCHAR REFERENCES comments(id)
);

CREATE TABLE "CommentInformationType" (
    id SERIAL PRIMARY KEY,
    comment_id VARCHAR NOT NULL,
    issue VARCHAR NOT NULL,
    datetime TIMESTAMP,
    span_start INTEGER NOT NULL,
    span_end INTEGER NOT NULL,
    info_type VARCHAR NOT NULL,
    text VARCHAR NOT NULL
);

CREATE INDEX "CommentInformationType_issue_idx" ON "CommentInformationType"(issue);

CREATE TABLE "TopLevelSummary" (
    id SERIAL PRIMARY KEY,
    text VARCHAR NOT NULL,
    info_type VARCHAR NOT NULL,
    issue VARCHAR NOT NULL,
    posted_on TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    author VARCHAR,
    CONSTRAINT issue_info_type UNIQUE (issue, info_type)
);

CREATE INDEX "TopLevelSummary_issue_idx" ON "TopLevelSummary"(issue);

CREATE TABLE "TopLevelSummarySpan" (
    id SERIAL PRIMARY KEY,
    summary_id INTEGER NOT NULL,
    summary_span_start INTEGER NOT NULL,
    summary_span_end INTEGER NOT NULL,
    comment_span_start INTEGER NOT NULL,
    comment_span_end INTEGER NOT NULL,
    commented_on TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    comment_id VARCHAR NOT NULL
);

CREATE INDEX "TopLevelSummarySpan_summary_id_idx" ON "TopLevelSummarySpan"(summary_id);