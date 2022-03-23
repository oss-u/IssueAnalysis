import { predictInformationType } from "../endpoints";

export const addCommentToDB = async (
  gh_user: string,
  repo: string,
  issue_number: number,
  commentId: string,
  commentText: string
) => {
  const spans = await predictInformationType(commentText);
};
