import { IssueComment } from "../types";
import { commentParser, getAllCommentsOnIssue } from "../utils/comment_parser";
import { parseURLForIssueDetails } from "../utils/scraping";
import { addCommentToDB } from "./add-comment-to-db";

export const scrapeAndAddCommentsToDB = () => {
  const commentElements = getAllCommentsOnIssue();
  const issueDetails = parseURLForIssueDetails();
  const comments: IssueComment[] = [];
  commentElements.forEach((element) => {
    comments.push(commentParser(element));
  });
  const savePromises = comments.map(async (comment) => {
    await addCommentToDB(
      issueDetails.user,
      issueDetails.repository,
      issueDetails.issueNum,
      comment.id,
      comment.text
    );
    console.log(`Comment ${comment.id} successfully added to DB`);
  });
  return Promise.all(savePromises);
};
