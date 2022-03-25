import {
  ModelComment,
  predictInformationType,
  saveInformationType,
} from "../endpoints";

export const addCommentToDB = async (
  gh_user: string,
  repo: string,
  issue_number: number,
  commentId: string,
  commentText: string
) => {
  const spans = await predictInformationType(commentText);
  const infoTypedComment: ModelComment = {
    comment: commentText,
    comment_id: commentId,
    sentences: spans,
    datetime: new Date().toISOString(),
  };
  await saveInformationType(gh_user, repo, issue_number, infoTypedComment);
  console.log(infoTypedComment);
  return;
};
