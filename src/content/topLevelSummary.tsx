import ReactDOM from "react-dom";
import React from "react";
import "../style.scss";
import TopLevelSummary from "../components/TopLevelSummary";
import { getTopLevelSummary } from "../endpoints";
import { parseURLForIssueDetails } from "../utils/scraping";
import { modelSummaryToSummaryWithHighlights } from "../utils";

const createTopLevelSummary = () => {
  const discussion_header = document.querySelector(
    "#partial-discussion-header"
  );

  let topLevelSummary = document.createElement("div");
  discussion_header.appendChild(topLevelSummary);
  const issueDetails = parseURLForIssueDetails();

  getTopLevelSummary(issueDetails.user, issueDetails.repository, issueDetails.issueNum).then((initSummariesRes) => {
    console.log(initSummariesRes);
    const initSummaries = modelSummaryToSummaryWithHighlights(initSummariesRes);
    ReactDOM.render(<TopLevelSummary initSummaries={initSummaries}/>, topLevelSummary);
  }).catch((error) => {
    console.error(error);
    ReactDOM.render(<TopLevelSummary initSummaries={[]}/>, topLevelSummary);
  })
  
  
};

const initTopLevelSummaryComponent = () => {
  createTopLevelSummary();
};

export default initTopLevelSummaryComponent;
