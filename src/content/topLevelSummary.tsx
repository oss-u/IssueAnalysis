import ReactDOM from "react-dom";
import React from "react";
import "../style.scss";
import InformationTypeSummary from "../components/InformationTypeSummary";

const createTopLevelSummary = () => {
  const discussion_header = document.querySelector(
    "#partial-discussion-header"
  );

  let topLevelSummary = document.createElement("div");
  discussion_header.appendChild(topLevelSummary);
  ReactDOM.render(<InformationTypeSummary />, topLevelSummary);
};

const initTopLevelSummaryComponent = () => {
  createTopLevelSummary();
};

export default initTopLevelSummaryComponent;
