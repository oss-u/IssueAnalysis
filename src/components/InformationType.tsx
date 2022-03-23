import React, {useEffect} from "react";
import "../style.scss";
import { InformationTypes } from "../types";
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

const mapInfoIdToType: { [id: number]: InformationTypes } = {
  1: "expectedBehaviour",
  2: "motivation",
  6: "solutionDiscussion",
}

let summaries = [
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

interface SummaryType {
  typeId: number;
  content: string;
}

export function InformationTypeTabs(): JSX.Element {
  const [initNavInfoType, setInitNavInfoType] = React.useState<InformationTypes>("none");
  const [editedSummaries, setEditedSummaries] = React.useState<SummaryType[]>(summaries);
  const [editing, setEditing] = React.useState<boolean>(false);
  const [selected, setSelected] = React.useState<number>(null);
  const [authors, setAuthors] = React.useState<string[]>([]);
  const [currentSummary, setCurrentSummary] = React.useState<SummaryType>(summaries[0]);
  const [tabContent, setTabContent] = React.useState<string>(currentSummary.content);

  useEffect(() => {
    setEditedSummaries(summaries)
  }, [summaries]);

  const onClickInfoType = (infoTypeId: number) => {
    const infoType = mapInfoIdToType[infoTypeId];
    setInitNavInfoType(infoType);
  }

  const onNonEditClick = (infoType) => {
    if (!editing) {
      onClickInfoType(infoType.typeId)
    }
  };

  const onEdit = (content: string) => {
    console.log(content);
    // const editedIndex = summaries.findIndex();
  }

  const onSave = () => {
    // navInfoTypeCallback();
    // setTabJSX(<div className="p-4">{tabContent}</div>);
    const newAuthors = new Set(authors)
    newAuthors.add(getCurrentUserName())
    setAuthors(Array.from(newAuthors.values()));
    setEditing(false);
  };

  function InformationTypeJSX(): JSX.Element {
    if (editing) {
      return (<textarea className="form-control width-full p-4">
        {currentSummary.content}
      </textarea>)
    } else
    return (<div className="p-4">{currentSummary.content}</div>);
  }
  

  return (
    <div className="Box-body">
      {initNavInfoType !== "none" && <TopLevelNavBox initInfoType={initNavInfoType} onClose={() => setInitNavInfoType("none")} />}
      <nav className="UnderlineNav" aria-label="infoTypeTabs">
        <div className="UnderlineNav-body" role="tablist">
          {
            summaries.map((summary, index) => {
              return (<button className="UnderlineNav-item"
                role="tab"
                type="button"
                aria-selected={(summary.typeId===currentSummary.typeId)? true: false}
                onClick={() => {
                  setCurrentSummary(summary);
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



// function InformationTypeContent(
//   props: InformationTypeProps
// ): JSX.Element {
//   const { title, content, tooltip, tabLink } = props;

//   // Stores the temporary edited state of the summaries before save
//   const [editedSummaries, setEditedSummaries] = React.useState<SummaryType[]>(
//     informationTypeSummaries
//   );
//   const [informationTypeSummaries, setInformationTypeSummaries] =
//     React.useState<SummaryType[]>([]);

//   const renderContent = (content: string, editing: boolean) => {
//     if (editing) {
//       return (
//         <textarea
//           className="form-control width-full"
//           onChange={(e) => onEdit(e.target.value)}
//         >
//           {content}
//         </textarea>
//       );
//     }
//     return <p>{content}</p>;
//   };


//   const onClickInfoType = (infoTypeId: number) => {
//     const infoType = mapInfoIdToType[infoTypeId];
//     setInitNavInfoType(infoType);
//   }

  // const generateTabs = (summaries) => {
  //   summaries.map((infoType) => {
  //     const newElement = (<TabNav.Link href="#topLevelSummary" onClick={() => {
  //       // add smooth scroll to the box div
  //       generateInfoTypeContents(summaries, informationTypeMap.get(infoType.typeId).tabLink);
  //     }}>
  //       {informationTypeMap.get(infoType.typeId).title}
  //     </TabNav.Link>)
  //     setInfotypes(oldArray => [...oldArray, newElement]);
  //   })
  // }


//   const onEditSummary = (idNum: number) => {
//     return (content: string) => {
//       const newSummaries = [...editedSummaries];
//       const editedSummary = {
//         typeId: idNum,
//         content,
//       };
//       const editedIndex = newSummaries.findIndex(
//         (sumType) => sumType.typeId === idNum
//       );
//       newSummaries[editedIndex] = editedSummary;
//       setEditedSummaries(newSummaries);
//     };
//   };



//   return (
//     <div className="Box-body" onClick={onNonEditClick} id={tabLink}>
//       <div className="tooltipped tooltipped-se" aria-label={tooltip}>
//         <h4>{title}</h4>
//       </div>
//       {renderContent(content, editing)}
//       <div id="editButtons" className="d-flex flex-justify-end mt-2">
//         {
//           editing && (
//             <>
//               <div className="btn btn-sm mr-2" onClick={() => setEditing(false)}>
//                 Back
//               </div>
//               <div className="btn btn-sm btn-primary" onClick={onSave}>
//                 Save
//               </div>
//             </>)
//         }
//         {
//           !editing && (
//             <>
//               {authors.length > 0 && (
//                 <div className="lh-condensed text-semibold f6 mr-3">
//                   Summary by {authors.join(", ")}
//                 </div>)}
//               <div className="btn btn-sm" onClick={() => setEditing(true)}>
//                 Edit
//               </div>
//             </>)
//         }
//       </div>
//     </div>
//   );
// }
