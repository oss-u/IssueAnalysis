import { ISummaryType } from "../components/InformationTypeTabs";
import { ModelInfoTypeSummary } from "../endpoints";
import { Highlight } from "../types";
import { v4 as uuidv4 } from "uuid";

export const getCurrentUserName = () => {
  const userNameEl = document.querySelector('head > meta[name="user-login"]');
  return userNameEl.getAttribute("content");
};

export function guidGenerator() {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (
    S4() +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  );
}

export const modelSummaryToISummary = (
  modelSummaries: ModelInfoTypeSummary[]
): ISummaryType[] =>
  modelSummaries.map((summary) => {
    const highlights: Highlight[] = summary.spans.map((span) => ({
      id: `h${uuidv4()}`,
      commentId: span.comment_id,
      span: span.comment_span,
      infoType: summary.info_type,
    }));
    return {
      infoType: summary.info_type,
      content: summary.text,
      commentHighlights: highlights,
    };
  });
