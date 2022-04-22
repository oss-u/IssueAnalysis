import { guidGenerator } from "../utils";

export class Author {
  uname: string;
  createdOn: string;
  profile: string;

  constructor(u: string, c: string, p: string) {
    this.uname = u;
    this.createdOn = c;
    this.profile = p;
  }
}

export class IssueComment {
  id: string;
  tag: Element;
  author: Author;
  text: string;

  constructor(id: string, tag: Element, a: Author, text: string) {
    this.id = id;
    this.tag = tag;
    this.author = a;
    this.text = text;
  }
}

export class Summary {
  id: string;
  summary: string;
  comments: Array<IssueComment>;

  constructor(summary, comments) {
    this.id = guidGenerator();
    this.summary = summary;
    this.comments = [comments];
  }
}

export type InformationType =
  | "Action on Issue"
  | "Bug Reproduction"
  | "Contribution and Commitment"
  | "Expected Behaviour"
  | "Investigation and Exploration"
  | "Motivation"
  | "Observed Bug Behaviour"
  | "Potential New Issues and Requests"
  | "Social Conversation"
  | "Solution Discussion"
  | "Task Progress"
  | "Usage"
  | "Workarounds";

export interface Highlight {
  id: string;
  commentId: string;
  span: { start: number; end: number };
  infoType: InformationType;
}
