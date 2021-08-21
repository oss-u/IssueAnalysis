let informationTypeMap = new Map();
informationTypeMap.set(1, {
  title: "Expected Behaviour",
  tooltip: "An expected or ideal situation affected by the issue.",
});
informationTypeMap.set(2, {
  title: "Motivation",
  tooltip:
    "The reason this issue needs to be fixed or a feature needs \
    to be added.",
});
informationTypeMap.set(3, {
  title: "Observed Bug Behaviour",
  tooltip: "Description of the original behaviour of the bug.",
});
informationTypeMap.set(4, {
  title: "Bug Reproduction",
  tooltip:
    "Any report, request, and/or question regarding the \
    reproduction of the bug.",
});
informationTypeMap.set(5, {
  title: "Investigation and Exploration",
  tooltip:
    "Exploration of ideas about the problem that was thought to \
    have caused the issue.",
});
informationTypeMap.set(6, {
  title: "Solution Discussion",
  tooltip:
    "Solution space from the developers’ point of view, in which \
    participants discuss design ideas and implementation details, \
    as well as suggestions, constraints, challenges, and useful \
    references around such topics",
});
informationTypeMap.set(7, {
  title: "Contribution and Commitment",
  tooltip:
    "A call for contributors and/or willingness \
    or unwillingness to contribute to resolving the issue",
});
informationTypeMap.set(8, {
  title: "Task Progress",
  tooltip:
    "A request or report of progress of tasks \
    and sub-tasks towards the solution of the issue,\
    plan of actions by the participants involved.",
});
informationTypeMap.set(9, {
  title: "Testing",
  tooltip:
    "Discussion of the testing procedure and \
    results, as well as the system environment, code, \
    data, and feedback involved in testing.",
});
informationTypeMap.set(10, {
  title: "Future Plan",
  tooltip:
    "The long-term plan related to the issue; such plans \
    usually involve work/ideas that are not required \
    to close the current issue",
});
informationTypeMap.set(11, {
  title: "Potential New Issues and Requests",
  tooltip:
    "Identification and discussion of new bugs or \
  needed features while investigating and addressing \
  the current issue",
});
informationTypeMap.set(12, {
  title: "Solution Usage",
  tooltip:
    "Discussion around how the functionality \
    can be potentially used.",
});
informationTypeMap.set(13, {
  title: "Workarounds",
  tooltip:
    "Discussions about temporary or alternative \
    solutions that can help overcome the issue \
    until the official fix or enhancement is released. ",
});
informationTypeMap.set(14, {
  title: "Issue Content Management",
  tooltip:
    "Redirecting the discussions and controlling \
    the quality of the comments with respect to the issue.",
});
informationTypeMap.set(15, {
  title: "Action on Issue",
  tooltip:
    "Comments on the proper actions to perform \
    on the issue discussion.",
});
informationTypeMap.set(16, {
  title: "Social Conversation",
  tooltip:
    "Expresssion of emotions such as appreciation, \
    disappointment and others, Small talk.",
});

export { informationTypeMap };
