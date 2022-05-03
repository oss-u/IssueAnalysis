import ReactDOM from "react-dom";
import React, { useEffect } from "react";
import "../style.scss";
import { generateTopLevelSummary } from "../endpoints";
import InformationTypeTabs, { ISummaryType } from "./InformationTypeTabs";
import { getAuthorFromPage, parseURLForIssueDetails } from "../utils/scraping";
import { scrapeAndAddCommentsToDB } from "../scripts/scrape-and-add-comments";
import { Highlight, InformationType, IssueComment } from "../types";
import { CheckIcon, XIcon } from "@primer/octicons-react"
import { Spinner } from "@primer/react";
import { modelSummaryToISummary } from "../utils";

interface TopLevelSummaryBoxProps{
  summaries: ISummaryType[];
  highlights: Highlight[];
  selectedInfoType: InformationType | null;
  updateSummaries: (newSummaries: ISummaryType[]) => void;
  updateSelectedHighlightIndex: (index: number) => void;
  updateSelectedComment: (comment: IssueComment | null) => void;
  updateSelectedInfoType: (newInfoType: InformationType | null) => void;
}

type LoadingStatus = 'complete' | 'loading' | 'error' | 'none';

const getLoadingSymbolFromStatus = (status: LoadingStatus): JSX.Element => {
  switch (status) {
    case "complete":
      return <CheckIcon className="ml-1"/>
    case "error":
      return <XIcon className="ml-1"/>
    case "loading":
      return (<span className="ml-1">
          <Spinner size="small"/>
        </span>)
    default:
      return <></>
  }
}

export default function TopLevelSummaryBox(props: TopLevelSummaryBoxProps): JSX.Element {
  const {summaries, selectedInfoType, highlights, updateSummaries, updateSelectedComment, updateSelectedInfoType, updateSelectedHighlightIndex} = props;

  const [visible, setVisible] = React.useState<boolean>(summaries.length > 0);
  const [addCommentToDBStatus, setAddCommentToDBStatus] = React.useState<LoadingStatus>('none');
  const [generateStatus, setGenerateStatus] = React.useState<LoadingStatus>('none');

  useEffect(() => {
    if (!visible){
      updateSelectedInfoType(null);
    }
  }, [visible])

  const initializeTopLevelSummary = () => {
    setGenerateStatus('loading');
    const defaultSummary: ISummaryType[] = [
      {
        infoType: "Expected Behaviour",
        content:
          "Generated summary was empty",
        commentHighlights: [{id: "h1", span: {start: 14, end: 24}, commentId: "https://github.com/oss-u/IssueAnalysis/issues/21#issue-1115550022", infoType: "Expected Behaviour"}, {id: "h2", span: {start: 24, end: 34}, commentId: "https://github.com/oss-u/IssueAnalysis/issues/21#issue-1115550022", infoType: "Expected Behaviour"}]
      },
      {
        infoType: "Motivation",
        content:
          "Generated summary was empty",
        commentHighlights: [{id: "h3", span: {start: 14, end: 24}, commentId: "https://github.com/oss-u/IssueAnalysis/issues/21#issuecomment-1035612306", infoType: "Motivation"}, {id: "h4", span: {start: 24, end: 34}, commentId: "https://github.com/oss-u/IssueAnalysis/issues/21#issuecomment-1035612306", infoType: "Motivation"}]
      },
    ];
    const issueDetails = parseURLForIssueDetails();
    const author = getAuthorFromPage();
    generateTopLevelSummary(issueDetails.user, issueDetails.repository, issueDetails.issueNum, author).then((resSummaries) => {
      console.log(resSummaries);
      const generatedSummaries: ISummaryType[] = modelSummaryToISummary(resSummaries);
      const newSummaries = generatedSummaries.length !== 0 ? generatedSummaries : defaultSummary;
      updateSummaries(newSummaries);
      setVisible(true);
      
      setGenerateStatus('complete');
    }).catch((error) => {
      console.error(`Failed to generate summary: ${error}`);
      setGenerateStatus('error');
    });
  };

  const addComments = () => {
    setAddCommentToDBStatus('loading');
    scrapeAndAddCommentsToDB().then((value) => 
      setAddCommentToDBStatus('complete')).catch(
        (value) => setAddCommentToDBStatus('error'))
  }

  return (
    <div>
      <div id="topLevelSummary" className="Box">
        <div className="Box-header width-full">
          <div className="d-flex flex-justify-between width-full">
            <h2 className="Box-title p-1">Information Type Summaries</h2>
            <div className="d-inline-flex">
              <button className="btn btn-sm" type="button" onClick={addComments}>
                Add Comments to DB
                {getLoadingSymbolFromStatus(addCommentToDBStatus)}
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
                {getLoadingSymbolFromStatus(generateStatus)}
              </button>
            </div>
          </div>
        </div>
      </div>
      {visible && (
          <InformationTypeTabs 
            summaries={summaries} 
            selectedInfoType={selectedInfoType} 
            updateSelectedInfoType={updateSelectedInfoType} 
            onChangeSelectedHighlight={updateSelectedHighlightIndex} 
            highlights={highlights}
          />
      )}
    </div>
  );
}