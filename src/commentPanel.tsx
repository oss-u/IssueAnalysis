import React from "react";
import ReactDOM from "react-dom";
import "./style.scss";
import SummariseButton from "./commentButtons";
import { informationTypeMap } from "./utils/maps";
import CommentButtons from "./commentButtons";

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


  let summariseButton = document.createElement("button");
  summariseButton.setAttribute("type", "button");
  summariseButton.setAttribute(
    "class",
    "btn-link tabnav-tab preview-tab js-preview-tab flex-1 flex-md-auto"
  );
  summariseButton.setAttribute("role", "tab");
  summariseButton.setAttribute("aria-selected", "false");
  summariseButton.setAttribute("id", "summarise-tab");
  summariseButton.setAttribute("tab-index", "-1");
  summariseButton.innerText = "Summarise";

  let commentButtonContainer = document.createElement("div");
  commentButtonContainer.setAttribute("role", "tabpanel");
  commentButtonContainer.setAttribute("aria-labelledby", "summarise-tab");
  commentButtonContainer.hidden = true;


  ReactDOM.render(<CommentButtons />, commentButtonContainer);

  tabContainer.appendChild(commentButtonContainer);
  
  summariseButton.onclick = () => {
    commentButtonContainer.hidden = false;
  };

  tabNav.appendChild(summariseButton);
}

const initNewCommentComponent = () => {
  newComment();
};

export default initNewCommentComponent;
