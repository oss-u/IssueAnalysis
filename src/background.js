// import { __activationURLs } from './constants';

// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//   // read changeInfo data and do something with it (like read the url)
//   if (changeInfo.url) {
//     // do something here
//     let url = new URL(changeInfo.url);
//     if (url.pathname.match(new RegExp(__activationURLs))) {
//       chrome.tabs.sendMessage(tabId, {
//         message: "hello!",
//         url: url.pathname,
//       });
//     }
//   }
// });
