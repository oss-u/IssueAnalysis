import React, {useEffect} from "react";
import "../style.scss";
import { getCurrentUserName } from "../utils";
import { informationTypeMap } from "../utils/maps";
import { Highlight, InformationType } from "../types";
import { TopLevelNavBar } from "./highlight-nav/TopLevelNavBar";
import { editTopLevelSummary, ModelInfoTypeSummary } from "../endpoints";
import { parseURLForIssueDetails } from "../utils/scraping";

export interface SummaryWithHighlights {
  summary: ModelInfoTypeSummary;
  commentHighlights: Highlight[];
}

interface IInformationTypeTabs {
  summaries: SummaryWithHighlights[];
  selectedInfoType: InformationType | null;
  highlights: Highlight[];
  updateSelectedInfoType: (newId: InformationType | null) => void;
  onChangeSelectedHighlight: (index: number) => void;
  updateSummaries: (newSummaries: SummaryWithHighlights[]) => void;
}

const EDIT_SUMMARY_FORM_ID = "editSummaryForm";
const EDIT_SUMMARY_TEXTAREA_ID = "editSummaryContent";

export default function InformationTypeTabs(props: IInformationTypeTabs): JSX.Element {
  const { summaries, updateSummaries, selectedInfoType, updateSelectedInfoType, highlights, onChangeSelectedHighlight } = props;
  const [editing, setEditing] = React.useState<boolean>(false);
  const [authors, setAuthors] = React.useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);

  // Sort summaries: Edit: May 20, 2022 - Avinash
  const sortedSummaries = summaries.sort((a, b) => {
    const aHas = typeof a.commentHighlights !== 'undefined';
    const bHas = typeof b.commentHighlights !== 'undefined';
    return (aHas && bHas)?(b.commentHighlights.length - a.commentHighlights.length): 0;
    // return (b.commentHighlights.length - a.commentHighlights.length)
  });


  useEffect(() => {
    updateSelectedInfoType(sortedSummaries.length > currentIndex ? sortedSummaries[currentIndex].summary.info_type : null);
  }, [])

  useEffect(() => {
    if (editing) {
      onChangeSelectedHighlight(-1);
    }
  }, [editing])

  let curSummaryText = sortedSummaries[currentIndex].summary.text
  const onSave = () => {
    // Create the new summary with updated text
    const summaryAuthor = getCurrentUserName();
    const selectedSummary = sortedSummaries[currentIndex];
    const newSelectedSummary = {...selectedSummary};
    newSelectedSummary.summary.text = curSummaryText;
    newSelectedSummary.summary.author = summaryAuthor;

    // Update the local sortedSummaries
    const newSummaries = [...sortedSummaries];
    newSummaries[currentIndex] = newSelectedSummary
    updateSummaries(newSummaries);

    // Update the backend summary
    const issueDetails = parseURLForIssueDetails();
    editTopLevelSummary(issueDetails.user, issueDetails.repository, issueDetails.issueNum, newSelectedSummary.summary).then((res) => {
      console.log("Successful edited summary in DB");
    })

    // Update local authors
    const newAuthors = new Set(authors)
    newAuthors.add(summaryAuthor);
    setAuthors(Array.from(newAuthors.values()));
    setEditing(false);
  };

  const onBack = () => {
    setEditing(false);
  }

  const summaryInfoTypes = sortedSummaries.map((summaryWHighlights) => summaryWHighlights.summary.info_type);
  
  function InformationTypeJSX(): JSX.Element {
    if (editing) {
      return (<textarea 
        id={EDIT_SUMMARY_TEXTAREA_ID} 
        form={EDIT_SUMMARY_FORM_ID}
        className="form-control width-full p-4 mb-2"
        autoFocus={true} 
        onChange={(e) => {curSummaryText = e.target.value}}>
          {sortedSummaries[currentIndex].summary.text}
        </textarea>)
    } else
    return (<div className="p-4" dangerouslySetInnerHTML={{__html: sortedSummaries[currentIndex].summary.text}} />);
  }
  return (
    <div className="Box-body">
      <nav className="UnderlineNav" aria-label="infoTypeTabs">
        <div className="UnderlineNav-body" role="tablist">
          {
            sortedSummaries.map((summary, index) => {
              return (<button className="UnderlineNav-item"
                role="tab"
                type="button"
                aria-selected={(summary.summary.info_type===sortedSummaries[currentIndex].summary.info_type) ? true: false}
                onClick={() => {
                  setCurrentIndex(index);
                  updateSelectedInfoType(sortedSummaries[index].summary.info_type);
                }}>
                {informationTypeMap.get(summary.summary.info_type).title}
              </button>);
            })
          }
        </div>
      </nav>

      <InformationTypeJSX />
      <div id="editButtons" className="d-flex flex-justify-end mt-2">
        {
          editing && (
            <>
              <div className="btn btn-sm mr-2" onClick={onBack}>
                Back
              </div>
              <div className="btn btn-sm btn-primary" onClick={onSave}>
                Save
              </div>
            </>)
        }
        {
          !editing && (
            <>
              {authors.length > 0 && (
                <div className="lh-condensed f6 mr-3 mt-3">
                  Summary by <span className="text-semibold">{authors.join(", ")}</span>
                </div>)}
              <div className="d-flex flex-row flex-items-center">
                {selectedInfoType && 
                  <TopLevelNavBar 
                    highlights={highlights} 
                    onChangeSelectedHighlight={onChangeSelectedHighlight}
                    onChangeInfoType={updateSelectedInfoType}
                    selectedInfoType={selectedInfoType}
                    summaryInfoTypes={summaryInfoTypes}
                  />}
                <div className="btn btn-sm ml-4" onClick={() => {
                  setEditing(true);
                }}>
                  Edit
                </div>
              </div>
            </>)
        }
      </div>
    </div>
  );
}
