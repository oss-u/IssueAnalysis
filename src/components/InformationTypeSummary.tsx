import ReactDOM from "react-dom";
import React from "react";
import "../style.scss";
import { InformationTypeTabs } from "./InformationType";


export default function InformationTypeSummary(): JSX.Element {
  const [visible, setVisible] = React.useState<boolean>(false);
  const [infoTypes, setInfotypes] = React.useState<JSX.Element>(null);


  const initializeTopLevelSummary = () => {
    setInfotypes(<InformationTypeTabs />);
    setVisible(true);
  };

  return (
    <div>
      {/* {initNavInfoType !== "none" && <TopLevelNavBox initInfoType={initNavInfoType} onClose={() => setInitNavInfoType("none")} />} */}
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
                    aria-disabled={(infoTypes != null) ? "false" : "true"}
                    onClick={() => {
                      if (infoTypes != null)
                        setVisible(!visible);
                    }}
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
      </div>
      {visible && (
        <div id="infoTypesSummaryDiv">
          {infoTypes}
        </div>
      )}
    </div>
  );
}


