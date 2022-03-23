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
  const input = makeRequestURL("/generate-summary");
  const init = makeRequestArguments("POST", { text });
  const res = await fetch(input, init);
  throwErrorsForResponse(res);
  return res.json();
};

export interface ModelInfoTypeSpan {
  span: { start: number; end: number };
  info_type: InformationType;
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
  issue_number: string,
  comment: ModelComment
): Promise<ModelComment> => {
  const extension = `/${gh_user}/${repo}/${issue_number}/save-information-type`;
  const input = makeRequestURL(extension);
  const init = makeRequestArguments("POST", comment);
  const res = await fetch(input, init);
  throwErrorsForResponse(res);
  return res.json();
};

export interface ModelInfoTypeSummary {
  id: number;
  text: string;
  info_type: string;
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
  throwErrorsForResponse(res);
  return res.json();
};
