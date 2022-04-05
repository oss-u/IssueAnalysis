import ReactDOM from "react-dom";
import React, { useEffect } from "react";
import "../style.scss";
import { generateTopLevelSummary } from "../endpoints";
import InformationTypeTabs, { ISummaryType } from "./InformationTypeTabs";
import { getAuthorFromPage, parseURLForIssueDetails } from "../utils/scraping";
import { scrapeAndAddCommentsToDB } from "../scripts/scrape-and-add-comments";
import { v4 as uuidv4 } from "uuid";
import { Highlight, IssueComment } from "../types";
import { commentParser, getAllCommentsOnIssue } from "../utils/comment_parser";
import octicons from "@primer/octicons"

interface TopLevelSummaryBoxProps{
  summaries: ISummaryType[];
  selectedInfoTypeId: number | null;
  updateSummaries: (newSummaries: ISummaryType[]) => void;
  updateSelectedComment: (comment: IssueComment | null) => void;
  updateSelectedInfoTypeId: (newId: number | null) => void;
}

export default function TopLevelSummaryBox(props: TopLevelSummaryBoxProps): JSX.Element {
  const {summaries, selectedInfoTypeId, updateSummaries, updateSelectedComment, updateSelectedInfoTypeId} = props;

  const [visible, setVisible] = React.useState<boolean>(false);

  useEffect(() => {
    if (!visible){
      updateSelectedInfoTypeId(null);
    }
  }, [visible])

  const initializeTopLevelSummary = () => {
    const defaultSummary: ISummaryType[] = [
      {
        typeId: 1,
        content:
          "Generated summary was empty",
        commentHighlights: []
      },
      {
        typeId: 2,
        content:
          "Generated summary was empty",
        commentHighlights: []
      },
    ];
    const issueDetails = parseURLForIssueDetails();
    const author = getAuthorFromPage();
    generateTopLevelSummary(issueDetails.user, issueDetails.repository, issueDetails.issueNum, author).then((resSummaries) => {
      const generatedSummaries: ISummaryType[] = resSummaries.map((summary) => {
        const highlights: Highlight[] = summary.spans.map(
          (span) => ({id: `h${uuidv4()}`, commentId: span.comment_id, span: span.comment_span, infoTypeId: summary.id})
        )
        return {typeId: summary.id, content: summary.text, commentHighlights: highlights}
      });
      const newSummaries = generatedSummaries.length !== 0 ? generatedSummaries : defaultSummary;
      updateSummaries(newSummaries);
      setVisible(true);
      Array.from(getAllCommentsOnIssue()).forEach((comment) => {
        const commentDetails = commentParser(comment);
        const iconContainer = comment.querySelector("div.timeline-comment-header.clearfix.d-block.d-sm-flex > div.timeline-comment-actions.flex-shrink-0");
        const newButton = document.createElement('button');
        newButton.innerHTML = octicons.paintbrush.toSVG();
        newButton.className = "btn-octicon";
        newButton.onclick = (e) => {updateSelectedComment(commentDetails)};
        iconContainer.prepend(newButton);
      })
    });
  };

  return (
    <div>
      <div id="topLevelSummary" className="Box">
        <div className="Box-header width-full">
          <div className="d-flex flex-justify-between width-full">
            <h2 className="Box-title p-1">Information Type Summaries</h2>
            <div className="d-inline-flex">
              <button className="btn btn-sm" type="button" onClick={scrapeAndAddCommentsToDB}>
                Add Comments to DB
              </button>
              <button
                id="minimiseButton"
                className="btn btn-sm ml-2"
                type="button"
                aria-disabled={(summaries.length > 0) ? "false" : "true"}
                onClick={() => {
                  if (summaries.length > 0)
                        setVisible(!visible);
                }}
              >
                {visible ? "Hide" : "Show"}
              </button>
              <button
                className="btn btn-sm btn-primary ml-2"
                type="button"
                onClick={initializeTopLevelSummary}
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>
      {visible && (
          <InformationTypeTabs summaries={summaries} selectedInfoTypeId={selectedInfoTypeId} updateSelectedInfoTypeId={updateSelectedInfoTypeId} />
      )}
    </div>
  );
}