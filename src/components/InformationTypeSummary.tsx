import ReactDOM from "react-dom";
import React from "react";
import "../style.scss";
import { informationTypeMap } from "../utils/maps";
import InformationType from "./InformationType";

interface SummaryType{
  typeId: number,
  content: string
}

export default function InformationTypeSummary(): JSX.Element{
  const [informationTypeSummaries, setInformationTypeSummaries] = React.useState<SummaryType[]>([]);
  const [visible, setVisible] = React.useState<boolean>(true);
  const [editing, setEditing] = React.useState<boolean>(false);

  function toggleVisibility(objId: string, btnId: string) {
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

  const initializeTopLevelSummary = () => {
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
    setInformationTypeSummaries(summaries);

  }
    return (
      <div>
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
                      aria-disabled={informationTypeSummaries.length === 0 ? "true" : "false"}
                      onClick={() => setVisible(!visible)}
                    >
                      {visible ? "Hide" : "Show"}
                    </button>
                    <button
                      className="btn btn-sm btn-primary ml-2"
                      type="button"
                      onClick={initializeTopLevelSummary}
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {visible && <div id="infoTypesSummaryDiv">
            {informationTypeSummaries.map((infoType) => 
              <InformationType
              title={informationTypeMap.get(infoType.typeId).title}
              tooltip={informationTypeMap.get(infoType.typeId).tooltip}
              content={infoType.content}
              editing={editing}
              onClick={()=>{setEditing(true)}}
            />)}
          </div>}
        </div>
        {(visible && editing) && (
          <div id="editButtons" className="d-flex flex-justify-end mt-2">
            <div className="btn mr-2" onClick={() => setEditing(false)}>
              Back
            </div>
            <div className="btn btn-primary">
              Save
            </div>
          </div>)}
      </div>
    );
  }