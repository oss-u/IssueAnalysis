import ReactDOM from "react-dom";
import React, { useEffect } from "react";
import "../style.scss";
import { informationTypeMap } from "../utils/maps";
import InformationType from "./InformationType";
import { TabNav, Box } from "@primer/components";

interface SummaryType {
  typeId: number;
  content: string;
}

export default function InformationTypeSummary(): JSX.Element {
  const [informationTypeSummaries, setInformationTypeSummaries] =
    React.useState<SummaryType[]>([]);
  // Stores the temporary edited state of the summaries before save
  const [editedSummaries, setEditedSummaries] = React.useState<SummaryType[]>(
    informationTypeSummaries
  );
  const [visible, setVisible] = React.useState<boolean>(false);
  const [editing, setEditing] = React.useState<boolean>(false);

  const [infoTypes, setInfotypes] = React.useState([]);
  const [infoTypeContents, setInfoTypeContents] = React.useState(null);

  useEffect(() => {
    setEditedSummaries(informationTypeSummaries);
  }, [informationTypeSummaries]);

  const initializeTopLevelSummary = () => {
    // API specifications - to get the summary
    // Should return an array. Array contains
    // tuples with summary and the information type ID.
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
    // generateInfoTypeContents(summaries);
    generateTabs(summaries);
    setInformationTypeSummaries(summaries);
    setVisible(true);
  };

  const generateInfoTypeContents = (summaries, hrf) => {
    
    summaries.map((infoType) => {
      if (informationTypeMap.get(infoType.typeId).tabLink === hrf) {
        const newElement = (<InformationType
          title={informationTypeMap.get(infoType.typeId).title}
          tooltip={informationTypeMap.get(infoType.typeId).tooltip}
          content={infoType.content}
          editing={editing}
          tabLink={informationTypeMap.get(infoType.typeId).tabLink}
          onClick={() => { setEditing(true) }}
          onEdit={onEditSummary(infoType.typeId)}
        />)
        setInfoTypeContents(newElement);
      }
      
      // setInfoTypeContents(oldArray => [...oldArray, newElement]);
      
    });

    
  }

  const generateTabs = (summaries) => {
    summaries.map((infoType) => {
      const newElement = (<TabNav.Link href="#topLevelSummary" onClick={() => {
        // add smooth scroll to the box div
        generateInfoTypeContents(summaries, informationTypeMap.get(infoType.typeId).tabLink);
      }}>
        {informationTypeMap.get(infoType.typeId).title}
      </TabNav.Link>)
      setInfotypes(oldArray => [...oldArray, newElement]);
    })
  }

  const onEditSummary = (idNum: number) => {
    return (content: string) => {
      const newSummaries = [...editedSummaries];
      const editedSummary = {
        typeId: idNum,
        content,
      };
      const editedIndex = newSummaries.findIndex(
        (sumType) => sumType.typeId === idNum
      );
      newSummaries[editedIndex] = editedSummary;
      console.log(newSummaries);
      setEditedSummaries(newSummaries);
    };
  };

  const onSave = () => {
    setInformationTypeSummaries(editedSummaries);
    setEditing(false);
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
                    aria-disabled={
                      informationTypeSummaries.length === 0 ? "true" : "false"
                    }
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
        {visible && (
          <div id="infoTypesSummaryDiv">
            <TabNav aria-label="information-types" id="infotype-summary">
              {infoTypes}
            </TabNav>
            <Box>
              {infoTypeContents}
            </Box>
          </div>
        )}
      </div>
      {visible && editing && (
        <div id="editButtons" className="d-flex flex-justify-end mt-2">
          <div className="btn mr-2" onClick={() => setEditing(false)}>
            Back
          </div>
          <div className="btn btn-primary" onClick={onSave}>
            Save
          </div>
        </div>
      )}
    </div>
  );
}


