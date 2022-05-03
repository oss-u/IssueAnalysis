import { InformationType } from "../types";
import { makeRequestArguments, makeRequestURL } from "./utils";

const throwErrorsForResponse = (res: Response) => {
  if (res.status < 200 || res.status >= 400) {
    throw Error(`Request failed with code ${res.status} - ${res.statusText}`);
  }
};

export const testAPI = async (): Promise<string> => {
  const input = makeRequestURL("");
  const res = await fetch(input);
  throwErrorsForResponse(res);
  return res.text();
};

export interface ModalSummary {
  summary: string;
}

export const generateSummary = async (text: string): Promise<ModalSummary> => {
  const input = makeRequestURL("/generate-summary/");
  const init = makeRequestArguments("POST", { text });
  const res = await fetch(input, init);
  throwErrorsForResponse(res);
  return res.json();
};

export interface ModelInfoTypeSpan {
  span: { start: number; end: number };
  info_type: InformationType;
}

export interface ModelInfoTypeSpanWithID extends ModelInfoTypeSpan {
  id: number;
}

export const predictInformationType = async (
  text: string
): Promise<ModelInfoTypeSpan[]> => {
  const input = makeRequestURL("/predict-information-type");
  const init = makeRequestArguments("POST", { text });
  const res = await fetch(input, init);
  throwErrorsForResponse(res);
  return res.json();
};

export interface ModelComment {
  comment_id: string;
  comment: string;
  sentences: ModelInfoTypeSpan[];
  datetime: string;
}

export const saveInformationType = async (
  gh_user: string,
  repo: string,
  issue_number: number,
  comment: ModelComment
): Promise<ModelComment> => {
  const extension = `/${gh_user}/${repo}/${issue_number}/save-information-type`;
  const input = makeRequestURL(extension);
  const init = makeRequestArguments("POST", comment);
  const res = await fetch(input, init);
  throwErrorsForResponse(res);
  return res.json();
};

export interface ModelCommentWithSpanIds extends ModelComment {
  sentences: ModelInfoTypeSpanWithID[];
}

export const getInformationType = async (
  gh_user: string,
  repo: string,
  issue_number: number,
  comment_id: string
): Promise<ModelCommentWithSpanIds> => {
  const extension = `/${gh_user}/${repo}/${issue_number}/information-type`;
  const input = makeRequestURL(extension, { comment_id });
  const init = makeRequestArguments("GET");
  const res = await fetch(input, init);
  throwErrorsForResponse(res);
  return res.json();
};

export interface ModelInfoTypeSummary {
  id: number;
  text: string;
  info_type: InformationType;
  issue: string;
  posted_on: string;
  author: string;
  spans: [
    {
      summaryId: number;
      summary_span: { start: number; end: number };
      comment_span: { start: number; end: number };
      commented_on: string;
      comment_id: string;
    }
  ];
}

export const generateTopLevelSummary = async (
  gh_user: string,
  repo: string,
  issue_number: number,
  author: string
): Promise<ModelInfoTypeSummary[]> => {
  const extension = `/${gh_user}/${repo}/${issue_number}/generate-top-level-summary`;
  const input = makeRequestURL(extension, { author });
  const init = makeRequestArguments("POST");
  const res = await fetch(input, init);
  console.log(res.status);
  throwErrorsForResponse(res);
  return res.json();
};

export const getTopLevelSummary = async (
  gh_user: string,
  repo: string,
  issue_number: number
): Promise<ModelInfoTypeSummary[]> => {
  const extension = `/${gh_user}/${repo}/${issue_number}/top-level-summary`;
  const input = makeRequestURL(extension);
  const init = makeRequestArguments("GET");
  const res = await fetch(input, init);
  throwErrorsForResponse(res);
  return res.json();
};

export const updateInfoTypeOfHighlight = async (
  span_id: number,
  info_type: InformationType
): Promise<string> => {
  const extension = `/update-information-type`;
  const input = makeRequestURL(extension);
  const init = makeRequestArguments("POST", {
    span_id,
    info_type,
  });
  const res = await fetch(input, init);
  throwErrorsForResponse(res);
  return res.text();
};

export interface Author {
  user_id: string;
  link: string;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  commented_on: string;
}

export interface Subsummary {
  summary: string;
  author: Author;
  comments: Comment[];
}

interface UserSummaries {
  id: number;
  summary: string;
  author: Author;
  comments: Comment[];
}

export const saveUserSummaries = async (
  gh_user: string,
  repo: string,
  issue_number: number,
  subsummaries: Subsummary
): Promise<UserSummaries> => {
  const extension = `/${gh_user}/${repo}/${issue_number}/comment-summary`;
  const input = makeRequestURL(extension);
  const init = makeRequestArguments("POST", subsummaries);
  const res = await fetch(input, init);
  throwErrorsForResponse(res);
  return res.json();
};

export const updateUserSummaries = async (
  gh_user: string,
  repo: string,
  issue_number: number,
  comment_summary_id: number,
  subsummaries: Subsummary
): Promise<UserSummaries> => {
  console.log(subsummaries.summary);
  const extension = `/${gh_user}/${repo}/${issue_number}/comment-summary/${comment_summary_id}/update-summary`;
  const input = makeRequestURL(extension);
  const init = makeRequestArguments("POST", { text: subsummaries.summary });
  const res = await fetch(input, init);
  throwErrorsForResponse(res);
  return res.json();
};

export const updateUserSummaryComments = async (
  gh_user: string,
  repo: string,
  issue_number: number,
  comment_summary_id: number,
  subsummaries: Subsummary
): Promise<UserSummaries> => {
  const extension = `/${gh_user}/${repo}/${issue_number}/comment-summary/${comment_summary_id}/update-comments`;
  const input = makeRequestURL(extension);
  const init = makeRequestArguments("POST", subsummaries.comments);
  const res = await fetch(input, init);
  throwErrorsForResponse(res);
  return res.json();
};

export const getUserSummaries = async (
  gh_user: string,
  repo: string,
  issue_number: number
): Promise<UserSummaries[]> => {
  const extension = `/${gh_user}/${repo}/${issue_number}/comment-summary`;
  const input = makeRequestURL(extension);
  const init = makeRequestArguments("GET");
  const res = await fetch(input, init);
  throwErrorsForResponse(res);
  return res.json();
};

export const getUserSummaryComments = async (
  gh_user: string,
  repo: string,
  issue_number: number,
  comment_summary_id: number
): Promise<UserSummaries> => {
  const extension = `/${gh_user}/${repo}/${issue_number}/comment-summary/${comment_summary_id}/`;
  const input = makeRequestURL(extension);
  const init = makeRequestArguments("GET");
  const res = await fetch(input, init);
  throwErrorsForResponse(res);
  return res.json();
};

export const deleteUserSummaries = async (
  gh_user: string,
  repo: string,
  issue_number: number,
  comment_summary_id: number
): Promise<string> => {
  const extension = `/${gh_user}/${repo}/${issue_number}/comment-summary/${comment_summary_id}/`;
  const input = makeRequestURL(extension);
  const init = makeRequestArguments("DELETE");
  const res = await fetch(input, init);
  throwErrorsForResponse(res);
  return res.json();
};
