import ReactDOM from "react-dom";
import React from "react";
import "../style.scss";

import SubSummaryComponent from "../components/subSummary";

const createSummaryPanel = () => {
  const discussionBucket = document.getElementById("discussion_bucket");
  const layout = document.querySelector(".Layout");
  layout.classList.add("Layout--sidebar-narrow");
  layout.parentNode.removeChild(layout);

  let summaryPanel = document.createElement("div");
  summaryPanel.className = "Layout-sidebar";
  summaryPanel.classList.add("summary-container");

  let contentAndSummaryWrapper = document.createElement("div");
  contentAndSummaryWrapper.className = "Layout Layout--sidebar-narrow";

  let contentWrapper = document.createElement("div");
  contentWrapper.className = "Layout-main";
  contentWrapper.appendChild(layout);

  contentAndSummaryWrapper.appendChild(summaryPanel);
  contentAndSummaryWrapper.appendChild(contentWrapper);
  discussionBucket.appendChild(contentAndSummaryWrapper);

  let subSummaryComponent = document.createElement("div");
  summaryPanel.appendChild(subSummaryComponent);
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
