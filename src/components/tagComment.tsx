import React from "react";
import "./style.scss";
import { informationTypeMap } from "../utils/maps";

class InformationTypeTagger extends React.Component<{}, {}> {
  render() {
    let infoTypes = [];
    informationTypeMap.forEach((it) => {
      infoTypes.push(<option>{it.title}</option>);
    });
    return (
      <div className="Box flex-justify-end">
        <div className="clearfix">
          <form className="m-3">
            <div className="form-group">
              <div className="form-group-header">
                <label htmlFor="tag-information-types">Comment Preview</label>
              </div>
                // Need to add the content here
            </div>

            <div className="form-group">
              <div className="form-group-header">
                <label htmlFor="example-select">
                  Corresponding Information Type
                </label>
              </div>
              <div className="form-group-body">
                <select
                  className="form-select"
                  id="information-types-selection"
                >
                  {infoTypes}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-sm btn-primary ml-2" type="button">
                Confirm
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default InformationTypeTagger;
