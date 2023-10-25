import { Author, IssueComment } from "../types";

export const getAllCommentsOnIssue = () =>
  document.querySelectorAll("div.TimelineItem.js-comment-container");

export const commentParser = (comment: Element) => {
  console.log(comment);

  let a_profile: string;
  try {
    a_profile = comment.querySelector("img.avatar")["src"];
  } catch (error) {
    console.log("There is a avatar error.")
    console.log(error);
  }
  const a_uname: string = comment.querySelector("a.author").textContent;
  let a_createdOn: string;
  try {
    a_createdOn = comment.querySelector(
      "a.js-timestamp relative-time"
    )["title"];
  } catch (error) {
    console.log("There is a title error.")
    console.log(error);
  }
  let c_bodytext;
  try {
    c_bodytext = comment.querySelector("td.comment-body").innerHTML.trim();
  } catch (error) {
    console.log("There is a innerHTML error.")
    console.log(error);
  }
  let c_id: string;
  try {
    c_id = comment.querySelector("a.js-timestamp")["href"].split('-').at(-1);
  } catch (error) {
    console.log("There is a href error.")
    console.log(error);
  }
  
  const author = new Author(a_uname, a_createdOn, a_profile);
  return new IssueComment(c_id, comment, author, c_bodytext);
};


// <div class="avatar-parent-child TimelineItem-avatar d-none d-md-block">
//   <a class="d-inline-block" data-hovercard-type="user" data-hovercard-url="/users/ChevinCherry/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="/ChevinCherry"><img class="avatar rounded-2 avatar-user" src="https://avatars.githubusercontent.com/u/53190159?s=80&amp;v=4" width="40" height="40" alt="@ChevinCherry"></a>

// </div>