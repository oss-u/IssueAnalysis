import ReactDOM from "react-dom";
import React from "react";
import "../style.scss";
import { generateTopLevelSummary } from "../endpoints";
import { InformationTypeTabs, ISummaryType } from "./InformationType";
import { getAuthorFromPage, parseURLForIssueDetails } from "../utils/scraping";
import { scrapeAndAddCommentsToDB } from "../scripts/scrape-and-add-comments";
import { v4 as uuidv4 } from "uuid";
import { Highlight } from "../types";

export default function InformationTypeSummary(): JSX.Element {
  const [visible, setVisible] = React.useState<boolean>(false);
  const [tabSummaries, setTabSummaries] = React.useState<ISummaryType[]>([]);

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
      const generatedSummaries: ISummaryType[] = summaries.map((summary) => {
        const highlights: Highlight[] = summary.spans.map(
          (span) => ({id: `h${uuidv4()}`, commentId: span.comment_id, span: span.comment_span, infoTypeId: summary.id})
        )
        return {typeId: summary.id, content: summary.text, commentHighlights: highlights}
      });
      console.log(generatedSummaries);
      const newSummaries = generatedSummaries.length !== 0 ? generatedSummaries : defaultSummary;
      setTabSummaries(newSummaries);
      setVisible(true);
    });
  };

  return (
    <div>
      <div id="topLevelSummary" className="Box">
        <div className="Box-header">
          <div className="clearfix">
            <div className="col-6 float-left px-1">
              <h2 className="Box-title p-1">Information Type Summaries</h2>
            </div>
            <div className="col-3 float-right">
              <div className="clearfix">
                <div className="col-6 float-right px-1 d-inline-flex">
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
        </div>
      </div>
      {visible && (
          <InformationTypeTabs summaries={tabSummaries} />
      )}
    </div>
  );
}



// const onEditSummary = (idNum: number) => {
//   return (content: string) => {
//     const newSummaries = [...editedSummaries]
//     const editedSummary = {
//       typeId: idNum,
//       content
//     }
//     const editedIndex = newSummaries.findIndex((sumType) => sumType.typeId === idNum)
//     newSummaries[editedIndex] = editedSummary;
//     setEditedSummaries(newSummaries);
//   }
// }

// const onSave = () => {
//   setInformationTypeSummaries(editedSummaries);
//   const newAuthors = new Set(authors)
//   newAuthors.add(getCurrentUserName())
//   setAuthors(Array.from(newAuthors.values()));
//   setEditing(false);
// }

// const onClickInfoType = (infoTypeId: number) => {
//   const infoType = mapInfoIdToType[infoTypeId];
//   setInitNavInfoType(infoType);
// }