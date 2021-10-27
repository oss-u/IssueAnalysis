import ReactDOM from "react-dom";
import React from "react";
import "./style.scss";

import InformationTypeTagger from "./tagComment";
import SubSummaryComponent from "./subSummary";
// import NavigationComponent from "./navigationPanel";
import { informationTypeMap } from "./utils/maps";

const createSummaryPanel = () => {
  const discussionBucket = document.querySelector("#discussion_bucket div");
  // discussionBucket.classList.add("making-flex");

  // configuring css to add the summary column to the left side
  const children = discussionBucket.children;
  children[0].classList.remove("col-md-9");
  children[0].classList.add("col-md-7");
  children[1].classList.remove("col-md-3");
  children[1].classList.add("col-md-2");


  let summaryPanel = document.createElement("div");
  summaryPanel.className = "col-md-3";
  discussionBucket.insertBefore(
    summaryPanel,
    discussionBucket.firstElementChild
  );

  let subSummaryComponent = document.createElement("div");
  summaryPanel.appendChild(subSummaryComponent);
  let informationTypeTagger = document.createElement("div");
  informationTypeTagger.className = "mt-6";
  summaryPanel.appendChild(informationTypeTagger);

  // let navComponent = document.createElement("div");
  // navComponent.className = "m-1";
  // const discussionTimelineAction = discussionBucket.querySelector("div.discussion-timeline-actions");
  // discussionTimelineAction.insertBefore(navComponent, discussionTimelineAction.firstElementChild);

  ReactDOM.render(<SubSummaryComponent />, subSummaryComponent);
  // ReactDOM.render(<InformationTypeTagger />, informationTypeTagger);
  // ReactDOM.render(<NavigationComponent />, navComponent);
};

const initSummaryPanelComponent = () => {
  createSummaryPanel();
};

export default initSummaryPanelComponent;
