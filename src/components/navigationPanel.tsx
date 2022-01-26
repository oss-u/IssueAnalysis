import ReactDOM from "react-dom";
import React from "react";
import "./style.scss";

class NavigationComponent extends React.Component<{commentList: any}, {}> {
    render() {
      let navComponent = (<div id="navigation-component" className="nav-component">
        <div className="Box">
          <div className="Box-row Box-row--gray d-flex flex-row-reverse">
            <button className="btn btn-primary btn-sm">
              Done
            </button>
            <div className="m-1">
                {} of {} sumarized comments
            </div>  
          </div>
        </div>
      </div>);
      return navComponent;
    }
  }


export default NavigationComponent;