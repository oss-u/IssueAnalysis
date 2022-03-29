import ReactDOM from "react-dom";
import React from "react";
import "../style.scss";

import SubSummaryComponent from "../components/subSummary";

let summaryPanel: HTMLDivElement;

function panelSetup(): HTMLDivElement {
  const summaryPanel = document.createElement("div");
  const discussionBucket = document.getElementById("discussion_bucket");
  const layout = document.querySelector(".Layout");
  layout.classList.add("Layout--sidebar-narrow");
  layout.parentNode.removeChild(layout);

  // The summary panel on the left
  summaryPanel.id = "summary-panel";
  summaryPanel.className = "Layout-sidebar";
  summaryPanel.style.top = "10%";
  summaryPanel.style.position = "sticky";
  // summaryPanel.style.position = "relative";
  // summaryPanel.classList.add("summary-container");

  // The wrapper at the top level
  let contentAndSummaryWrapper = document.createElement("div");
  contentAndSummaryWrapper.id = "content-summary-wrapper";
  // contentAndSummaryWrapper.id = "summary-wrapper";
  contentAndSummaryWrapper.className = "Layout Layout--sidebar-narrow";
  contentAndSummaryWrapper.style.position = "relative";
  

  // Only wrap the content
  let contentWrapper = document.createElement("div");
  contentWrapper.id = "content-wrapper";
  contentWrapper.className = "Layout-main";
  contentWrapper.appendChild(layout);

  // Wrap the panel on the right
  let actionPanel = layout.querySelector(".Layout-sidebar");
  let actionPanelParent = actionPanel.parentNode;
  actionPanelParent.removeChild(actionPanel);
  let actionWrapper = document.createElement("div");
  actionWrapper.id = "action-wrapper";
  actionWrapper.className = "Layout-sidebar";
  actionWrapper.appendChild(actionPanel);
  actionWrapper.style.display = "block";
  actionPanelParent.appendChild(actionWrapper);

  contentAndSummaryWrapper.appendChild(summaryPanel);
  contentAndSummaryWrapper.appendChild(contentWrapper);
  discussionBucket.appendChild(contentAndSummaryWrapper);
  return summaryPanel;
}

const resizeSummaryPanel = (panelState: number) => {
  const summaryPanel = document.getElementById("summary-panel");
  const actionPanel = document.getElementById("action-wrapper");
  const contentWrapper = document.getElementById("content-wrapper");
  const summaryWrapper = document.getElementById("content-summary-wrapper");
  const mainLayoutTimeline = contentWrapper.children[0];

  if (panelState) {
    summaryPanel.classList.replace("Layout-sidebar", "col-6");
    summaryPanel.classList.add("pr-3");
    summaryPanel.classList.add("float-left");
    
    actionPanel.style.display = "none";
    
    contentWrapper.classList.replace("Layout-main", "col-6");
    contentWrapper.classList.add("float-right");
    
    mainLayoutTimeline.classList.replace("Layout", "clearfix");
    mainLayoutTimeline.classList.remove("Layout--sidebar-narrow");
    mainLayoutTimeline.classList.remove("Layout--flowRow-until-md");
    mainLayoutTimeline.classList.remove("Layout--sidebarPosition-end");
    mainLayoutTimeline.classList.remove("Layout--sidebarPosition-flowRow-end");
  
    summaryWrapper.classList.remove("Layout--sidebar-narrow");
    summaryWrapper.classList.replace("Layout", "clearfix");
  } else {
    summaryPanel.classList.remove("pr-3");
    summaryPanel.classList.remove("float-left");
    summaryPanel.classList.replace("col-6", "Layout-sidebar");

    actionPanel.style.display = "block";

    contentWrapper.classList.replace("col-6", "Layout-main");
    contentWrapper.classList.remove("float-right");

    mainLayoutTimeline.classList.replace("clearfix", "Layout");
    mainLayoutTimeline.classList.add("Layout--sidebar-narrow");
    mainLayoutTimeline.classList.add("Layout--flowRow-until-md");
    mainLayoutTimeline.classList.add("Layout--sidebarPosition-end");
    mainLayoutTimeline.classList.add("Layout--sidebarPosition-flowRow-end");

    summaryWrapper.classList.replace("clearfix", "Layout");
    summaryWrapper.classList.add("Layout--sidebar-narrow");
  }

  return summaryPanel;
}

const createSummaryPanel = () => {
  // let summaryPanel: HTMLDivElement = setSidePanelSize(panelType);
  summaryPanel = panelSetup();
  let subSummaryComponent = document.createElement("div");
  subSummaryComponent.id = "subsummary";
  subSummaryComponent.style.top = "10%";
  subSummaryComponent.style.position = "sticky";
  summaryPanel.appendChild(subSummaryComponent);
  // subSummaryComponent.classList.add("summary-sticky");

  // let informationTypeTagger = document.createElement("div");
  // informationTypeTagger.className = "mt-6";
  // summaryPanel.appendChild(informationTypeTagger);

  ReactDOM.render(<SubSummaryComponent resizePanel={resizeSummaryPanel}/>, subSummaryComponent);
};

const initSummaryPanelComponent = () => {
  createSummaryPanel();
};

export default initSummaryPanelComponent;
