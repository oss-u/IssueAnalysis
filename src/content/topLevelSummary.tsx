import ReactDOM from "react-dom";
import React from "react";
import "../style.scss";
import TopLevelSummary from "../components/TopLevelSummary";
import { getTopLevelHighlights, getTopLevelSummary } from "../endpoints";
import { parseURLForIssueDetails } from "../utils/scraping";
import { modelSummaryToSummaryWithHighlights } from "../utils";

const createTopLevelSummary = () => {
  const discussion_header = document.getElementById(
    "partial-discussion-header"
  );

  let topLevelSummary = document.createElement("div");
  discussion_header.appendChild(topLevelSummary);
  const issueDetails = parseURLForIssueDetails();

  getTopLevelSummary(issueDetails.user, issueDetails.repository, issueDetails.issueNum).then((initSummariesRes) => {
    getTopLevelHighlights(issueDetails.user, issueDetails.repository, issueDetails.issueNum).then((initHighlightsRes) => {
      const initSummaries = modelSummaryToSummaryWithHighlights(initSummariesRes, initHighlightsRes);
      ReactDOM.render(<TopLevelSummary initSummaries={initSummaries}/>, topLevelSummary);
    })
    
  }).catch((error) => {
    console.error(error);
    ReactDOM.render(<TopLevelSummary initSummaries={[]}/>, topLevelSummary);
  })
  
  
};

const initTopLevelSummaryComponent = () => {
  const observer = new MutationObserver(function (mutations, mutationInstance) {
    const discussionBucket = document.getElementById('partial-discussion-header');
    if (discussionBucket) {
      createTopLevelSummary();
      mutationInstance.disconnect();
    }
  });
  
  observer.observe(document, {
    childList: true, 
    subtree: true 
  });
};

export default initTopLevelSummaryComponent;
