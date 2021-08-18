// @import '@primer/css/utilities/index.scss';
// Figure out how to use the git css

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // listen for messages sent from background.js
  if (request.message === "hello!") {
    console.log(request.message); // new url is now in content scripts!
    // Run init
  }
});

let gutter = document.querySelector('[class^="gutter-condensed"]');
console.log(gutter);
let issueThreadComponent = gutter.childNodes[1].cloneNode(deep=true);
issueThreadComponent.class = "flex-shrink-0 col-12 col-md-6 mb-4 mb-md-0";
gutter.replaceChild(issueThreadComponent, gutter.childNodes[1]);


let summaryBox = document.createElement("div");
summaryBox.className = "Box p-2 col-4 .flex-auto";

let closeButtonSvgClass = document.createElementNS("http://www.w3.org/2000/svg", "svg");
closeButtonSvgClass.class = "octicon octicon-x";
closeButtonSvgClass.setAttribute("aria-hidden", "true");
closeButtonSvgClass.setAttribute("width", "12");
closeButtonSvgClass.setAttribute("height", "16");
closeButtonSvgClass.setAttribute("viewBox", "0 0 16 16");

let closeSummaryBoxButton = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
closeSummaryBoxButton.setAttribute(
  "d",
  "M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"
);
closeSummaryBoxButton.setAttribute("fill-rule", "evenodd");
console.log(closeSummaryBoxButton);
closeButtonSvgClass.appendChild(closeSummaryBoxButton);
console.log(closeButtonSvgClass);
summaryBox.appendChild(closeButtonSvgClass);

let summaryBoxTitle = document.createElement("h3");
summaryBoxTitle.className = "Box-title";
summaryBoxTitle.innerText = "Summaries";
summaryBox.appendChild(summaryBoxTitle);

gutter.insertBefore(summaryBox, gutter.firstChild);

// let tn = document.querySelector('[class^="tabnav-tabs"]');
// if (tn) {
//   let duplicateTabContainer = tn.parentNode.cloneNode(deep=true);
//   let duplicateTabNav = tn.cloneNode(deep=true);
//   console.log(duplicateTabNav.childNodes);
// }
// if (tn) {

//   button.innerText = "This is the inserted button, click on me!";
//   button["id"] = "summariseButton";
//   // button.className = "btn-link";
//   button.type = "button";
//   button.onclick = function () {
//     alert("clicked!");
//   };
//   // const app = document.createElement("div");
//   // app.id = "injectedElement";

//   tn.appendChild(button);
//   // console.log(tn);
//   // ReactDOM.render(tn, document.getElementById("injectedElement"));
// }

function init() {
  // Move the code to functions later and add them here
}
