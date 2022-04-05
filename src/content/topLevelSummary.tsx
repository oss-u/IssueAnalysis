import ReactDOM from "react-dom";
import React from "react";
import "../style.scss";
import TopLevelSummary from "../components/TopLevelSummary";

const createTopLevelSummary = () => {
  const discussion_header = document.querySelector(
    "#partial-discussion-header"
  );

  let topLevelSummary = document.createElement("div");
  discussion_header.appendChild(topLevelSummary);
  ReactDOM.render(<TopLevelSummary />, topLevelSummary);
};

const initTopLevelSummaryComponent = () => {
  createTopLevelSummary();
};

export default initTopLevelSummaryComponent;
