import { SummaryWithHighlights } from "../components/InformationTypeTabs";
import { ModelInfoTypeHighlights, ModelInfoTypeSummary } from "../endpoints";
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

export const modelSummaryToSummaryWithHighlights = (
  modelSummaries: ModelInfoTypeSummary[],
  modelHighlights: ModelInfoTypeHighlights[]
): SummaryWithHighlights[] => {
  // Create highlights list for each infoType
  const summaryHighlightMap = {};
  modelHighlights.forEach((infoTypeSpans) => {
    const infoTypeHighlights = infoTypeSpans.sentences.map((sentence) => ({
      id: `h${uuidv4()}`,
      commentId: sentence.comment_id,
      span: sentence.span,
      infoType: infoTypeSpans.info_type,
    }));
    summaryHighlightMap[infoTypeSpans.info_type] = infoTypeHighlights;
  });
  // Combine summaries with their highlights
  return modelSummaries.map((summary) => {
    return {
      summary,
      commentHighlights: summaryHighlightMap[summary.info_type],
    };
  });
};
