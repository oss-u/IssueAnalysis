import React from "react";
import ReactDOM from "react-dom";
import { Popup } from "./components/popup/popupContent";
import "./style.scss";

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root-summit-chrome-extension")
);