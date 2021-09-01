import React from "react";
import "./style.scss";

class SubSummaryComponent extends React.Component<{}, {}> {
  render() {
    return (
      <div className="timeline-comment-header summary-sidebar-header p-2">
        <div className="timeline-comment-actions flex-shrink-0">
          <button className="btn btn-sm btn-primary m-0 ml-2 ml-md-2">
            Add
          </button>
        </div>
        <h3 className="timeline-comment-header-text f5 text-normal">
          <strong>Summaries</strong>
        </h3>
      </div>
    );
  }
}

export default SubSummaryComponent;
