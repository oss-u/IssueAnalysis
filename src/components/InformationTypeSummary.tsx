import ReactDOM from "react-dom";
import React from "react";
import "../style.scss";
import { generateTopLevelSummary } from "../endpoints";
import { InformationTypeTabs, ISummaryType } from "./InformationType";
import { getAuthorFromPage, parseURLForIssueDetails } from "../utils/scraping";
import { scrapeAndAddCommentsToDB } from "../scripts/scrape-and-add-comments";
import { v4 as uuidv4 } from "uuid";
import { Highlight, IssueComment } from "../types";
import { commentParser, getAllCommentsOnIssue } from "../utils/comment_parser";
import octicons from "@primer/octicons"
import NavigationController from "./NavigationController";

export default function InformationTypeSummary(): JSX.Element {
  const [visible, setVisible] = React.useState<boolean>(false);
  const [tabSummaries, setTabSummaries] = React.useState<ISummaryType[]>([]);
  const [selectedComment, setSelectedComment] = React.useState<IssueComment | null>(null);

  const initializeTopLevelSummary = () => {
    const defaultSummary: ISummaryType[] = [
      {
        typeId: 1,
        content:
          "Generated summary was empty",
        commentHighlights: []
      },
    ];
    const issueDetails = parseURLForIssueDetails();
    const author = getAuthorFromPage();
    generateTopLevelSummary(issueDetails.user, issueDetails.repository, issueDetails.issueNum, author).then((summaries) => {
      console.log(summaries);
      const generatedSummaries: ISummaryType[] = summaries.map((summary) => {
        const highlights: Highlight[] = summary.spans.map(
          (span) => ({id: `h${uuidv4()}`, commentId: span.comment_id, span: span.comment_span, infoTypeId: summary.id})
        )
        return {typeId: summary.id, content: summary.text, commentHighlights: highlights}
      });
      const newSummaries = generatedSummaries.length !== 0 ? generatedSummaries : defaultSummary;
      setTabSummaries(newSummaries);
      setVisible(true);
      Array.from(getAllCommentsOnIssue()).forEach((comment) => {
        const commentDetails = commentParser(comment);
        const iconContainer = comment.querySelector("div.timeline-comment-header.clearfix.d-block.d-sm-flex > div.timeline-comment-actions.flex-shrink-0");
        const newButton = document.createElement('button');
        newButton.innerHTML = octicons.paintbrush.toSVG();
        newButton.className = "btn-octicon";
        newButton.onclick = (e) => {setSelectedComment(commentDetails)};
        iconContainer.prepend(newButton);
      })
    });
  };

  const comments = Array.from(getAllCommentsOnIssue()).map((comment) => commentParser(comment));

  return (
    <div>
      <NavigationController selectedComment={selectedComment} selectedInfoTypeId={null} comments={comments} summaries={tabSummaries} onChangeSelectedComment={(newComment) => setSelectedComment(newComment)} />
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
                aria-disabled={(tabSummaries.length > 0) ? "false" : "true"}
                onClick={() => {
                  if (tabSummaries.length > 0)
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
          <InformationTypeTabs summaries={tabSummaries} selectedComment={selectedComment}/>
      )}
    </div>
  );
}