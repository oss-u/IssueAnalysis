import ReactDOM from "react-dom";
import React from "react";
import "./style.scss";
import { informationTypeMap } from "./utils/maps";

interface IInformationType {
  typeId: number;
  title: string;
  tooltip: string;
  content: string;
}

class InformationType
  extends React.Component<{ typeId: number; content: string }, {}>
  implements IInformationType
{
  typeId: number;
  title: string;
  tooltip: string;
  content: string;

  constructor(props: IInformationType) {
    super(props);
    this.typeId = props.typeId;
    this.title = informationTypeMap.get(this.typeId).title;
    this.tooltip = informationTypeMap.get(this.typeId).tooltip;
    this.content = props.content;
  }

  render() {
    return (
      <div className="Box-body">
        <div className="tooltipped tooltipped-se" aria-label={this.tooltip}>
          <h4>{this.title}</h4>
          <p>{this.content}</p>
        </div>
      </div>
    );
  }
}

class InformationTypeSummary extends React.Component<
  {},
  { informationTypeSummaries: { typeId: number; content: string }[] }
> {
  constructor(props) {
    super(props);
    this.updateTopLevelSummary = this.updateTopLevelSummary.bind(this);
    this.state = {
      informationTypeSummaries: [],
    };
  }

  toggleVisibility(objId: string, btnId: string) {
    let btn = document.getElementById(btnId);
    let el = document.getElementById(objId);
    if (btn.innerText === "Hide") {
      btn.innerText = "Show";
      el.style.display = "none";
    } else if (btn.innerText === "Show") {
      btn.innerText = "Hide";
      el.style.display = "block";
    }
  }

  enableActionOnBox(objId: string) {
    let el = document.getElementById(objId);
    el.setAttribute("aria-disabled", "false");
  }

  updateTopLevelSummary() {
    // API specifications - to get the summary
    // Should return an array. Array contains
    // tuples with summary and the information type ID.
    let summaries = [
      {
        typeId: 1,
        content:
          "I would like to propose an additional instance method to the ensemble estimators to fit additional sub estimators.",
      },
      { typeId: 2, content: "There is something similar in adaboost!" },
      {
        typeId: 6,
        content:
          "I don't know if fit_extends is the best solution to the problem.",
      },
    ];
    this.setState({
      informationTypeSummaries: summaries,
    });

    this.enableActionOnBox('minimiseButton');
  }

  render() {
    let infoTypes = [];
    this.state.informationTypeSummaries.forEach(
      (infoType: { typeId: number; content: string }) => {
        infoTypes.push(
          <InformationType
            typeId={infoType.typeId}
            content={infoType.content}
          />
        );
      }
    );
    return (
      <div id="topLevelSummary" className="Box">
        <div className="Box-header">
          <div className="clearfix">
            <div className="col-6 float-left px-1">
              <h2 className="Box-title p-1">Information Type Summaries</h2>
            </div>

            <div className="col-3 float-right">
              <div className="clearfix">
                <div className="col-6 float-right px-1 d-inline-flex">
                  <button
                    id="minimiseButton"
                    className="btn btn-sm"
                    type="button"
                    aria-disabled="true"
                    onClick={() => {
                      this.toggleVisibility(
                        "infoTypesSummaryDiv",
                        "minimiseButton"
                      );
                    }}
                  >
                    Hide
                  </button>
                  <button
                    className="btn btn-sm btn-primary ml-2"
                    type="button"
                    onClick={this.updateTopLevelSummary}
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="infoTypesSummaryDiv">{infoTypes}</div>
      </div>
    );
  }
}

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
