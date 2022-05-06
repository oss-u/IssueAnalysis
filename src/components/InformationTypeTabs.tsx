import React, {useEffect} from "react";
import "../style.scss";
import { getCurrentUserName } from "../utils";
import { informationTypeMap } from "../utils/maps";
import { Highlight, InformationType } from "../types";
import { TopLevelNavBar } from "./highlight-nav/TopLevelNavBar";

export interface ISummaryType {
  infoType: InformationType;
  content: string;
  commentHighlights: Highlight[];
}

interface IInformationTypeTabs {
  summaries: ISummaryType[];
  selectedInfoType: InformationType | null;
  highlights: Highlight[];
  updateSelectedInfoType: (newId: InformationType | null) => void;
  onChangeSelectedHighlight: (index: number) => void;
  updateSummaries: (newSummaries: ISummaryType[]) => void;
}

const EDIT_SUMMARY_FORM_ID = "editSummaryForm";
const EDIT_SUMMARY_TEXTAREA_ID = "editSummaryContent";

export default function InformationTypeTabs(props: IInformationTypeTabs): JSX.Element {
  const { summaries, updateSummaries, selectedInfoType, updateSelectedInfoType, highlights, onChangeSelectedHighlight } = props;
  const [editing, setEditing] = React.useState<boolean>(false);
  const [authors, setAuthors] = React.useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);

  useEffect(() => {
    updateSelectedInfoType(summaries.length > currentIndex ? summaries[currentIndex].infoType : null);
  }, [])

  let curSummaryContent = summaries[currentIndex].content
  const onSave = () => {
    const selectedSummary = summaries[currentIndex];
    const newSelectedSummary = {...selectedSummary};
    newSelectedSummary.content = curSummaryContent;
    const newSummaries = [...summaries];
    newSummaries[currentIndex] = newSelectedSummary
    updateSummaries(newSummaries);

    const newAuthors = new Set(authors)
    newAuthors.add(getCurrentUserName())
    setAuthors(Array.from(newAuthors.values()));
    setEditing(false);
  };

  const onBack = () => {
    setEditing(false);
  }

  const summaryInfoTypes = summaries.map((summary) => summary.infoType);
  
  function InformationTypeJSX(): JSX.Element {
    if (editing) {
      return (<textarea 
        id={EDIT_SUMMARY_TEXTAREA_ID} 
        form={EDIT_SUMMARY_FORM_ID}
        className="form-control width-full p-4 mb-2"
        autoFocus={true} 
        onChange={(e) => {curSummaryContent = e.target.value}}>
          {summaries[currentIndex].content}
        </textarea>)
    } else
    return (<div className="p-4" dangerouslySetInnerHTML={{__html: summaries[currentIndex].content}} />);
  }
  return (
    <div className="Box-body">
      <nav className="UnderlineNav" aria-label="infoTypeTabs">
        <div className="UnderlineNav-body" role="tablist">
          {
            summaries.map((summary, index) => {
              return (<button className="UnderlineNav-item"
                role="tab"
                type="button"
                aria-selected={(summary.infoType===summaries[currentIndex].infoType) ? true: false}
                onClick={() => {
                  setCurrentIndex(index);
                  updateSelectedInfoType(summaries[index].infoType);
                }}>
                {informationTypeMap.get(summary.infoType).title}
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
