import { Author, IssueComment } from "../types";

export const getAllCommentsOnIssue = () => document.querySelectorAll("div.timeline-comment.unminimized-comment");

export const commentParser = (comment: Element) => {
  const a_profile: string = comment.querySelector("img.avatar")["src"];
  const a_uname: string = comment.querySelector("a.author").textContent;
  const a_createdOn: string = comment.querySelector(
    "a.js-timestamp relative-time"
  )["title"];
  const c_bodytext = Array.from(comment.querySelectorAll("td.comment-body p"))
    .map((elem) => elem.innerHTML)
    .join(" ");
  const c_id = comment.querySelector("a.js-timestamp")["href"];
  const author = new Author(a_uname, a_createdOn, a_profile);
  return new IssueComment(c_id, comment, author, c_bodytext);
};