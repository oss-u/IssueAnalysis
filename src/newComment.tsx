import ReactDOM from "react-dom";
import React from "react";
import "./style.scss";
import { informationTypeMap } from "./utils/maps";

const newComment = () => {
  const discussionBucket = document.querySelector("#discussion_bucket div");
  const discussionTimelineActions = discussionBucket.querySelector(
    ".discussion-timeline-actions"
  );

  const tabContainer =
    discussionTimelineActions.getElementsByTagName("tab-container")[0];

  const commentFormHead = tabContainer.querySelector(
    "[class^=comment-form-head]"
  );
  commentFormHead.classList.remove("flex-lg-row");
  commentFormHead.classList.remove("flex-lg-items-center");
  commentFormHead.classList.add("flex-lg-column");

  const tabNav = commentFormHead.querySelector("[class^=tabnav-tabs]");
  const markdownToolbar = (commentFormHead.querySelector("[class~=toolbar-commenting]") as HTMLElement);

  let summariseButton = document.createElement("button");
  summariseButton.setAttribute("type", "button");
  summariseButton.setAttribute(
    "class",
    "btn-link tabnav-tab preview-tab js-preview-tab flex-1 flex-md-auto"
  );
  summariseButton.setAttribute("role", "tab");
  summariseButton.setAttribute("aria-selected", "false");
  summariseButton.innerText = "Summarise";
  summariseButton.onclick = () => {
    console.log(markdownToolbar);
    // markdownToolbar.hidden = true;
    // tabContainer.className = "js-previewable-comment-form previewable-comment-form preview-selected";
    markdownToolbar.style.visibility = "hidden";

  };
  // tabNav.insertBefore(summariseButton, tabNav.children[1]);

  // console.log(tabNav.children);
  tabNav.appendChild(summariseButton);

  // let newSummary = document.createElement("div");
  // discussion_header.appendChild(newSummary);
  // ReactDOM.render(<commentFormHead parent={commentFormHead}/>, summariseButton);
};

const initNewCommentComponent = () => {
  // newComment();
};

export default initNewCommentComponent;
