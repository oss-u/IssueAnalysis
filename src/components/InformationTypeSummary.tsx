import ReactDOM from "react-dom";
import React, { useEffect } from "react";
import "../style.scss";
import { informationTypeMap } from "../utils/maps";
import {default as InformationTypeComponent} from "./InformationType";
import { getCurrentUserName } from "../utils";
import TopLevelNavBox from "./TopLevelNavBox";
import { InformationType } from "../types";
import { generateTopLevelSummary, testAPI } from "../endpoints";

interface SummaryType{
  typeId: number,
  content: string
}

interface IssueDetails {
  user: string,
  repository: string,
  issueNum: number
}

const mapInfoIdToType: {[id: number]: InformationType} = {
  1: "expectedBehaviour",
  2: "motivation",
  6: "solutionDiscussion",
}

const parseURLForIssueDetails = (): IssueDetails => {
  const url = window.location.href;
  const splitURL = url.split('/');
  const issueDetails: IssueDetails = {
    user: splitURL[3],
    repository: splitURL[4],
    issueNum: parseInt(splitURL[6])
  }
  return issueDetails;
}

const getAuthorFromPage = (): string => {
  const authorDoc = document.querySelector("#partial-discussion-header > div.d-flex.flex-items-center.flex-wrap.mt-0.gh-header-meta > div.flex-auto.min-width-0.mb-2 > a");
  const author = authorDoc.textContent
  return author
}

export default function InformationTypeSummary(): JSX.Element{
  const [informationTypeSummaries, setInformationTypeSummaries] = React.useState<SummaryType[]>([]);
  // Stores the temporary edited state of the summaries before save
  const [editedSummaries, setEditedSummaries] = React.useState<SummaryType[]>(informationTypeSummaries);
  const [visible, setVisible] = React.useState<boolean>(true);
  const [editing, setEditing] = React.useState<boolean>(false);
  const [authors, setAuthors] = React.useState<string[]>([]);
  const [initNavInfoType, setInitNavInfoType] = React.useState<InformationType>("none");

  useEffect(() => {
    setEditedSummaries(informationTypeSummaries)
  }, [informationTypeSummaries]);


  const initializeTopLevelSummary = () => {
    // API specifications - to get the summary
    // Should return an array. Array contains
    // tuples with summary and the information type ID.
    let newSummaries: SummaryType[] = [
      {
        typeId: 1,
        content:
          "Generated summary was empty",
      },
    ];
    const issueDetails = parseURLForIssueDetails();
    const author = getAuthorFromPage();
    generateTopLevelSummary(issueDetails.user, issueDetails.repository, issueDetails.issueNum, author).then((summaries) => {
      const generatedSummaries: SummaryType[] = summaries.map((summary) => ({typeId: summary.id, content: summary.text}))
      console.log(generatedSummaries);
      if (generatedSummaries.length !== 0){
        newSummaries = generatedSummaries
      }
      setInformationTypeSummaries(newSummaries);
    });
    
  }

  const onEditSummary = (idNum: number) => {
    return (content: string) => {
      const newSummaries = [...editedSummaries]
      const editedSummary = {
        typeId: idNum,
        content
      }
      const editedIndex = newSummaries.findIndex((sumType) => sumType.typeId === idNum)
      newSummaries[editedIndex] = editedSummary;
      setEditedSummaries(newSummaries);
    }
  }

  const onSave = () => {
    setInformationTypeSummaries(editedSummaries);
    const newAuthors = new Set(authors)
    newAuthors.add(getCurrentUserName())
    setAuthors(Array.from(newAuthors.values()));
    setEditing(false);
  }

  const onClickInfoType = (infoTypeId: number) => {
    const infoType = mapInfoIdToType[infoTypeId];
    setInitNavInfoType(infoType);
  }


    return (
      <div>
        <TopLevelNavBox initInfoType={initNavInfoType} hidden={initNavInfoType === "none"} onClose={() => setInitNavInfoType("none")} onOpen={() => {}} />
        <div id="topLevelSummary" className="Box">
          <div className="Box-header">
            <div className="clearfix">
              <div className="col-6 float-left px-1">
                <h2 className="Box-title p-1">Information Type Summaries</h2>
              </div>
              <div className="col-3 float-right">
                <div className="clearfix">
                  <div className="col-6 float-right px-1 d-inline-flex">
                    <button
                      id="minimiseButton"
                      className="btn btn-sm"
                      type="button"
                      aria-disabled={informationTypeSummaries.length === 0 ? "true" : "false"}
                      onClick={() => setVisible(!visible)}
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
          {visible && <div id="infoTypesSummaryDiv">
            {informationTypeSummaries.map((infoType) => 
              <InformationTypeComponent
              title={informationTypeMap.get(infoType.typeId).title}
              tooltip={informationTypeMap.get(infoType.typeId).tooltip}
              content={infoType.content}
              editing={editing}
              onClick={() => onClickInfoType(infoType.typeId)}
              onEdit={onEditSummary(infoType.typeId)}
            />)}
          </div>}
        </div>
        {visible && (
          <div id="editButtons" className="d-flex flex-justify-end mt-2">
              {editing && (
                <>
                <div className="btn mr-2" onClick={() => setEditing(false)}>
                  Back
                </div>
                <div className="btn btn-primary" onClick={onSave}>
                  Save
                </div>
                </> )}
              {
                !editing && (
                  <>
                    {authors.length > 0 && (
                      <div className="lh-condensed text-semibold f6 mr-3">
                        Summary by {authors.join(", ")}
                      </div>)}
                    <div className="btn" onClick={() => setEditing(true)}>
                      Edit
                    </div>
                  </>)}
          </div>)}
      </div>
    );
  }