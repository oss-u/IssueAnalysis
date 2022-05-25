import initTopLevelSummaryComponent from "./content/topLevelSummary";
import initSummaryPanelComponent from "./content/summaryPanel";

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.from === "background" && request.state) {
    loadSummit();
    return true;
  }
});

function loadSummit() {
  chrome.storage.local.get(["summitChromeExtensionState"], (result) => {
    if (result.summitChromeExtensionState === undefined) {
        chrome.storage.local.set({'summitChromeExtensionState': { state: true }});
        init();
    } else {
      if (result.summitChromeExtensionState.state) {
        init();
      }
    }
  });
}

function init() {
  initTopLevelSummaryComponent();
  initSummaryPanelComponent();
}



loadSummit();

