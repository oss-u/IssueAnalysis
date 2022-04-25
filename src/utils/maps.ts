import { InformationType } from "../types";

export interface InformationTypeDisplayInfo {
  title: string;
  tooltip: string;
  tabLink: string;
}

let informationTypeMap = new Map<InformationType, InformationTypeDisplayInfo>();
informationTypeMap.set("Expected Behaviour", {
  title: "Expected Behaviour",
  tooltip: "An expected or ideal situation affected by the issue.",
  tabLink: "#expectedbehaviour",
});
informationTypeMap.set("Motivation", {
  title: "Motivation",
  tooltip:
    "The reason this issue needs to be fixed or a feature needs \
    to be added.",
  tabLink: "#motivation",
});
informationTypeMap.set("Observed Bug Behaviour", {
  title: "Observed Bug Behaviour",
  tooltip: "Description of the original behaviour of the bug.",
  tabLink: "#obsbugbehaviour",
});
informationTypeMap.set("Bug Reproduction", {
  title: "Bug Reproduction",
  tooltip:
    "Any report, request, and/or question regarding the \
    reproduction of the bug.",
  tabLink: "#bugrepro",
});
informationTypeMap.set("Investigation and Exploration", {
  title: "Investigation and Exploration",
  tooltip:
    "Exploration of ideas about the problem that was thought to \
    have caused the issue.",
  tabLink: "#investandexplore",
});
informationTypeMap.set("Solution Discussion", {
  title: "Solution Discussion",
  tooltip:
    "Solution space from the developers’ point of view, in which \
    participants discuss design ideas and implementation details, \
    as well as suggestions, constraints, challenges, and useful \
    references around such topics",
  tabLink: "#soldiscuss",
});
informationTypeMap.set("Contribution and Commitment", {
  title: "Contribution and Commitment",
  tooltip:
    "A call for contributors and/or willingness \
    or unwillingness to contribute to resolving the issue",
  tabLink: "#contributeandcommit",
});
informationTypeMap.set("Task Progress", {
  title: "Task Progress",
  tooltip:
    "A request or report of progress of tasks \
    and sub-tasks towards the solution of the issue,\
    plan of actions by the participants involved.",
  tabLink: "#taskprog",
});
// informationTypeMap.set("Testing", {
//   title: "Testing",
//   tooltip:
//     "Discussion of the testing procedure and \
//     results, as well as the system environment, code, \
//     data, and feedback involved in testing.",
//   tabLink: "#testing",
// });
// informationTypeMap.set("Future Plans", {
//   title: "Future Plan",
//   tooltip:
//     "The long-term plan related to the issue; such plans \
//     usually involve work/ideas that are not required \
//     to close the current issue",
//   tabLink: "#futureplan",
// });
informationTypeMap.set("Potential New Issues and Requests", {
  title: "Potential New Issues and Requests",
  tooltip:
    "Identification and discussion of new bugs or \
  needed features while investigating and addressing \
  the current issue",
  tabLink: "#potentialissues",
});
informationTypeMap.set("Usage", {
  title: "Usage",
  tooltip:
    "Discussion around how the functionality \
    can be potentially used.",
  tabLink: "#usage",
});
informationTypeMap.set("Workarounds", {
  title: "Workarounds",
  tooltip:
    "Discussions about temporary or alternative \
    solutions that can help overcome the issue \
    until the official fix or enhancement is released. ",
  tabLink: "#workarounds",
});
// informationTypeMap.set("Issue Content Management", {
//   title: "Issue Content Management",
//   tooltip:
//     "Redirecting the discussions and controlling \
//     the quality of the comments with respect to the issue.",
//   tabLink: "#issuecontentmgmt",
// });
informationTypeMap.set("Action on Issue", {
  title: "Action on Issue",
  tooltip:
    "Comments on the proper actions to perform \
    on the issue discussion.",
  tabLink: "#actnissue",
});
informationTypeMap.set("Social Conversation", {
  title: "Social Conversation",
  tooltip:
    "Expresssion of emotions such as appreciation, \
    disappointment and others, Small talk.",
  tabLink: "#socialconv",
});

export { informationTypeMap };
