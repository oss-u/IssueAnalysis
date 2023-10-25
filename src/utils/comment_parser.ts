import { Author, IssueComment } from "../types";

export const getAllCommentsOnIssue = () =>
  document.querySelectorAll("div.TimelineItem.js-comment-container");

const querySelectorWithFallback = (element: Element, selector: string, attribute: string): string | null => {
  const foundElement = element.querySelector(selector);
  if (foundElement && attribute in foundElement) {
    return foundElement[attribute];
  }
  console.log(`Error finding attribute "${attribute}" for selector "${selector}"`);
  return null;
};

export const commentParser = (comment: Element) => {
  const a_profile = querySelectorWithFallback(comment, "img.avatar", "src");
  const a_uname = querySelectorWithFallback(comment, "a.author", "textContent");
  const a_createdOn = querySelectorWithFallback(comment, "a.js-timestamp relative-time", "title");
  const c_bodyElement = comment.querySelector("td.comment-body");
  const c_bodytext = c_bodyElement ? c_bodyElement.innerHTML.trim() : null;
  const c_id = querySelectorWithFallback(comment, "a.js-timestamp", "href")?.split('-').at(-1);

  const author = new Author(a_uname, a_createdOn, a_profile);
  return new IssueComment(c_id, comment, author, c_bodytext);
};