import initTopLevelSummaryComponent from "./topLevelSummary";
import initNewCommentComponent from "./commentPanel";
import initSummaryPanelComponent from "./summaryPanel";

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // listen for messages sent from background.js
  if (request.message === "hello!") {
    console.log(request.message); // new url is now in content scripts!
    // Run init
  }
});

function init() {
  initTopLevelSummaryComponent();
  initSummaryPanelComponent();
  initNewCommentComponent();
}

init();
