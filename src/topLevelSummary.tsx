import ReactDOM from "react-dom";
import React from "react";
import "./style.scss";
import { informationTypeMap } from "./utils/maps";

interface IInformationType {
  typeId: number;
  title: string;
  tooltip: string;
}

class InformationType
  extends React.Component<{ typeId: number }, { content: string }>
  implements IInformationType
{
  typeId: number;
  title: string;
  tooltip: string;

  constructor(props: IInformationType) {
    super(props);
    this.typeId = props.typeId;
    this.title = informationTypeMap.get(this.typeId).title;
    this.tooltip = informationTypeMap.get(this.typeId).tooltip;
    this.state = { content: "Summary not defined yet." };
  }

  render() {
    return (
      <div className="Box-body">
        <span className="tooltipped tooltipped-se" aria-label={this.tooltip}>
          <h4>{this.title}</h4>
          <p>{this.state.content}</p>
        </span>
      </div>
    );
  }
}

class InformationTypeSummary extends React.Component {
  render() {
    return (
      <div id="topLevelSummary" className="Box Box--condensed">
        {/* Uncomment when the close button needs to be added */}
        {/* <div className="Box-header">
          <button className="Box-btn-octicon btn-octicon float-right">
            <svg
              className="octicon octicon-x"
              viewBox="0 0 12 16"
              version="1.1"
              width="12"
              height="16"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"
              ></path>
            </svg>
          </button>
          <h3 className="Box-title">Information Type Summaries</h3>
        </div> */}
        <InformationType typeId={1} />
        <InformationType typeId={2} />
      </div>
    );
  }
}

const createTopLevelSummary = () => {
  const discussion_header = document.querySelector(
    "#partial-discussion-header"
  );
  // API specifications - to get the summary
  // Should return an array. Array contains
  // tuples with summary and the information type ID.
  let informationTypeSummaries = [
    [
      1,
      "I would like to propose an additional instance method to the ensemble estimators to fit additional sub estimators.",
    ],
    [2, "There is something similar in adaboost!"],
    [6, "I don't know if fit_extends is the best solution to the problem."],
  ];
  let topLevelSummary = document.createElement("div");
  discussion_header.appendChild(topLevelSummary);
  ReactDOM.render(<InformationTypeSummary />, topLevelSummary);
};

const initTopLevelSummaryComponent = () => {
  createTopLevelSummary();
};

export default initTopLevelSummaryComponent;
