import ReactDOM from "react-dom";
import React from "react";
import "./style.scss";

import InformationTypeTagger from "./tagComment";
import SubSummaryComponent from "./subSummary";
import NavigationComponent from "./navigationPanel";
import { informationTypeMap } from "./utils/maps";

const createSummaryPanel = () => {
  const discussionBucket = document.getElementById("discussion_bucket");
  const layout = document.querySelector(".Layout");
  layout.classList.add("Layout--sidebar-narrow");
  layout.parentNode.removeChild(layout);

  // console.log(discussionBucket.children);
  // const discussionBucket = document.querySelector("#discussion_bucket div");
  // discussionBucket.classList.add("making-flex");

  // configuring css to add the summary column to the left side
  // const children = discussionBucket.children;
  // children[1].classList.remove("col-md-9");
  // children[1].classList.add("col-md-7");
  // children[0].classList.remove("col-md-3");
  // children[0].classList.add("col-md-2");

  let summaryPanel = document.createElement("div");
  summaryPanel.className = "Layout-sidebar";
  summaryPanel.classList.add("summary-container");

  // summaryPanel.classList.add("summary-panel-container");
  // discussionBucket.appendChild(summaryPanel);

  let contentAndSummaryWrapper = document.createElement("div");
  contentAndSummaryWrapper.className = "Layout Layout--sidebar-narrow";

  let contentWrapper = document.createElement("div");
  contentWrapper.className = "Layout-main";
  contentWrapper.appendChild(layout);

  contentAndSummaryWrapper.appendChild(summaryPanel);
  contentAndSummaryWrapper.appendChild(contentWrapper);
  discussionBucket.appendChild(contentAndSummaryWrapper);

  // discussionBucket.insertBefore(
  //   summaryPanel,
  //   discussionBucket.firstElementChild
  // );
  // CHanges on October 31, 2021 - GitHub CSS update to Layout Component

  let subSummaryComponent = document.createElement("div");
  summaryPanel.appendChild(subSummaryComponent);
  // subSummaryComponent.classList.add("position-sticky");
  // subSummaryComponent.classList.add("top-0");
  subSummaryComponent.classList.add("summary-sticky");
  
  let informationTypeTagger = document.createElement("div");
  informationTypeTagger.className = "mt-6";
  summaryPanel.appendChild(informationTypeTagger);

  ReactDOM.render(<SubSummaryComponent />, subSummaryComponent);
};

const initSummaryPanelComponent = () => {
  createSummaryPanel();
};

export default initSummaryPanelComponent;
