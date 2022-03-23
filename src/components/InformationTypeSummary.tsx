import ReactDOM from "react-dom";
import React from "react";
import "../style.scss";
import { InformationType } from "../types";
import { generateTopLevelSummary } from "../endpoints";
import { InformationTypeTabs } from "./InformationType";

interface IssueDetails {
  user: string,
  repository: string,
  issueNum: number
}

interface SummaryType{
  typeId: number,
  content: string
}

// const mapInfoIdToType: {[id: number]: InformationType} = {
//   1: "expectedBehaviour",
//   2: "motivation",
//   6: "solutionDiscussion",
// }

export default function InformationTypeSummary(): JSX.Element {
  const [visible, setVisible] = React.useState<boolean>(false);
  const [infoTypes, setInfotypes] = React.useState<JSX.Element>(null);

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

  const initializeTopLevelSummary = () => {
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
      if (generatedSummaries.length !== 0){
        newSummaries = generatedSummaries;
        setInfotypes(<InformationTypeTabs summaries={newSummaries}/>);
        setVisible(true);
      } else {
        // Load dummy content. Remove this and add some fun react stuff later.
        newSummaries = [
          {
            typeId: 1,
            content:
              "I would like to propose an additional instance method to the ensemble estimators to fit additional sub estimators.",
          },
          { typeId: 2, content: "There is something similar in adaboost!" },
          {
            typeId: 6,
            content:
              "I don't know if fit_extends is the best solution to the problem.",
          },
        ];
      }
      setInfotypes(<InformationTypeTabs summaries={newSummaries}/>);
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
                  <button
                    id="minimiseButton"
                    className="btn btn-sm"
                    type="button"
                    aria-disabled={(infoTypes != null) ? "false" : "true"}
                    onClick={() => {
                      if (infoTypes != null)
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
        <div id="infoTypesSummaryDiv">
          {infoTypes}
        </div>
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