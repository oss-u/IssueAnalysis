import ReactDOM from "react-dom";
import React from "react";
import "../style.scss";

import SubSummaryComponent from "../components/subSummary";

const thinSize = () => {
  const discussionBucket = document.getElementById("discussion_bucket");
  const layout = document.querySelector(".Layout");
  layout.classList.add("Layout--sidebar-narrow");
  layout.parentNode.removeChild(layout);

  let summaryPanel = document.createElement("div");
  summaryPanel.className = "Layout-sidebar";
  summaryPanel.classList.add("summary-container");

  let contentAndSummaryWrapper = document.createElement("div");
  contentAndSummaryWrapper.id = "summary-wrapper";
  contentAndSummaryWrapper.className = "Layout Layout--sidebar-narrow";

  let contentWrapper = document.createElement("div");
  contentWrapper.id = "content-wrapper";
  contentWrapper.className = "Layout-main";
  contentWrapper.appendChild(layout);

  contentAndSummaryWrapper.appendChild(summaryPanel);
  contentAndSummaryWrapper.appendChild(contentWrapper);
  discussionBucket.appendChild(contentAndSummaryWrapper);
  return summaryPanel;
}

const wideSize = () => {
  const discussionBucket = document.getElementById("discussion_bucket");
  const layout = document.querySelector(".Layout");
  layout.classList.remove("Layout--sidebar-narrow");
  // const layout = document.querySelector(".Layout.Layout--sidebar-narrow");
  // layout.classList.add("Layout--sidebar-narrow");
  // layout.parentNode.removeChild(layout);
  console.log(layout);

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
  return summaryPanel;
}

const setSidePanelSize = (panelSize) => {
  if (panelSize === 0) {
    return thinSize();
  }
  else {
    console.log("this got called");
    return wideSize();
  }
}


const createSummaryPanel = (panelType: number) => {
  let summaryPanel: HTMLDivElement = setSidePanelSize(panelType);
  let subSummaryComponent = document.createElement("div");
  summaryPanel.appendChild(subSummaryComponent);
  subSummaryComponent.classList.add("summary-sticky");

  // let informationTypeTagger = document.createElement("div");
  // informationTypeTagger.className = "mt-6";
  // summaryPanel.appendChild(informationTypeTagger);

  ReactDOM.render(<SubSummaryComponent resizePanel={createSummaryPanel}/>, subSummaryComponent);
};

const initSummaryPanelComponent = () => {
  createSummaryPanel(0);
};

export default initSummaryPanelComponent;
