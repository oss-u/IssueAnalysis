import ReactDOM from "react-dom";
import React from "react";
import "./style.scss";

import InformationTypeTagger from "./tagComment";
import SubSummaryComponent from "./subSummary";

class SummaryPanel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <SubSummaryComponent />
        <InformationTypeTagger />
      </div>
    );
  }
}

const createSummaryPanel = () => {
  const discussionBucket = document.querySelector("#discussion_bucket div");

  // configuring css to add the summary columns to the left side
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
  //   discussionBucket.appendChild(summaryPanel);
  ReactDOM.render(<SummaryPanel />, summaryPanel);
};

const initSummaryPanelComponent = () => {
  createSummaryPanel();
};

export default initSummaryPanelComponent;
