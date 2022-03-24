import React, {useEffect} from "react";
import "../style.scss";
import { InformationType } from "../types";
import { getCurrentUserName } from "../utils";
import { informationTypeMap } from "../utils/maps";
import TopLevelNavBox from "../components/TopLevelNavBox";

interface InformationTypeProps {
  title: string;
  content: string;
  tooltip: string;
  tabLink: string;
  // onEdit: (content: string) => void;
}

const mapInfoIdToType: { [id: number]: InformationType } = {
  1: "expectedBehaviour",
  2: "motivation",
  6: "solutionDiscussion",
}

interface ISummaryType {
  typeId: number;
  content: string;
}

interface IInformationTypeTabs {
  summaries: ISummaryType[];
}

export function InformationTypeTabs(props: IInformationTypeTabs): JSX.Element {
  const { summaries } = props;
  const [initNavInfoType, setInitNavInfoType] = React.useState<InformationType>("none");
  const [editedSummaries, setEditedSummaries] = React.useState<ISummaryType[]>(summaries);
  const [editing, setEditing] = React.useState<boolean>(false);
  const [authors, setAuthors] = React.useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);

  useEffect(() => {
    setEditedSummaries(summaries)
  }, [summaries]);

  const onNonEditClick = (infoType) => {
    if (!editing) {
      onClickInfoType(infoType.typeId)
    }
  };

  const onSave = () => {
    // navInfoTypeCallback();
    const newAuthors = new Set(authors)
    newAuthors.add(getCurrentUserName())
    setAuthors(Array.from(newAuthors.values()));
    setEditing(false);
  };

  const onClickInfoType = (infoTypeId: number) => {
    const infoType = mapInfoIdToType[infoTypeId];
    setInitNavInfoType(infoType);
  }

  const onEditSummary = (event) => {
    event.persist();
    const newSummaries = [...editedSummaries];
    const editedSummary = {
      typeId: editedSummaries[currentIndex].typeId,
      content: event.target.value,
    };
    const editedIndex = newSummaries.findIndex(
      (sumType) => sumType.typeId === editedSummaries[currentIndex].typeId
    );
    newSummaries[editedIndex] = editedSummary;
    setEditedSummaries(newSummaries);
  };

  const debounce = (f, delay) => {
    let debounceTimer;
    return function (this) {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => f.apply(context, args), delay);
    }
  }

  // 1 second
  let optimisedEditSummary = debounce(onEditSummary, 1000);
  
  function InformationTypeJSX(): JSX.Element {
    if (editing) {
      // TODO - add a top margin
      return (<textarea className="form-control width-full p-4"
              onChange={optimisedEditSummary}>
        {editedSummaries[currentIndex].content}
      </textarea>)
    } else
    return (<div className="p-4">{editedSummaries[currentIndex].content}</div>);
  }

  return (
    <div className="Box-body" onClick={onNonEditClick}>
      {<TopLevelNavBox initInfoType={initNavInfoType} hidden={initNavInfoType==="none"}
                      onClose={() => setInitNavInfoType("none")} onOpen={() => {}}/>}
      <nav className="UnderlineNav" aria-label="infoTypeTabs">
        <div className="UnderlineNav-body" role="tablist">
          {
            editedSummaries.map((summary, index) => {
              return (<button className="UnderlineNav-item"
                role="tab"
                type="button"
                aria-selected={(summary.typeId===editedSummaries[currentIndex].typeId)? true: false}
                onClick={() => {
                  setCurrentIndex(index);
                }}>
                {informationTypeMap.get(summary.typeId).title}
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
              <div className="btn btn-sm mr-2" onClick={() => {
                setEditing(false);
              }}>
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
              <div className="btn btn-sm" onClick={() => {
                setEditing(true);
              }}>
                Edit
              </div>
            </>)
        }
      </div>
    </div>
  );
}
