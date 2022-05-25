import { __activationURLs } from './constants';

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url) {
    let url = new URL(changeInfo.url);
    if (url.pathname.match(new RegExp(__activationURLs))) {
        chrome.storage.local.get(["summitChromeExtensionState"], (result) => {
            if (result.summitChromeExtensionState === undefined) {
                chrome.storage.local.set({'summitChromeExtensionState': { state: true }});
            } else {
                if (result.summitChromeExtensionState.state) {
                    let queryOptions = { active: true, currentWindow: true };
                    chrome.tabs.query(queryOptions, function(tabs){
                        chrome.tabs.sendMessage(tabs[0].id, {from:"background", state: true});
                    });
                }
            }
        });
    }
  }
});
