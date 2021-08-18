@import '~primer/css/utilities/index.scss';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // listen for messages sent from background.js
  if (request.message === "hello!") {
    console.log(request.message); // new url is now in content scripts!
    // Run init
  }
});



let tn = document.querySelector('[class^="tabnav-tabs"]');
if (tn) {
  let duplicateTabContainer = tn.parentNode.cloneNode(deep=true);
  let duplicateTabNav = tn.cloneNode(deep=true);
  console.log(duplicateTabNav.childNodes);
}
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

}