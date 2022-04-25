import React from 'react';
import { getInformationType, updateInfoTypeOfHighlight } from '../../endpoints';
import { Highlight, InformationType } from '../../types';
import { informationTypeMap } from '../../utils/maps';
import { parseURLForIssueDetails } from '../../utils/scraping';

interface EditSelectedHighlightProps {
    selectedHighlight: Highlight;
    onEditHighlight: (newHighlight: Highlight) => void;
    onClose: () => void;
}

const informationTypeOptions = Array.from(informationTypeMap).map(([id, infoType]) => (<option value={id}>{infoType.title}</option>));

const saveInfoTypeToDB = async (highlight: Highlight, newInfoType: InformationType) => {
    const issueDetails = parseURLForIssueDetails();
    const allHighlights = await getInformationType(issueDetails.user, issueDetails.repository, issueDetails.issueNum, highlight.commentId);
    const selectedHighlight = allHighlights.sentences.find((modelSpan) => modelSpan.span.start === highlight.span.start && modelSpan.span.end === highlight.span.end);
    if (!selectedHighlight) {
        throw Error(`Could not update ${highlight.id} as it was not found in DB`);
    }
    await updateInfoTypeOfHighlight(selectedHighlight.id, newInfoType);
    console.log(`Successfully updated information type from ${highlight.infoType} to ${newInfoType} in DB`);
}

export function EditSelectedHighlight(props: EditSelectedHighlightProps): JSX.Element {
    const {selectedHighlight, onEditHighlight, onClose} = props;

    const [selectedInfoType, setSelectedInfoType] = React.useState<InformationType>(selectedHighlight.infoType);

    const getHighlightedText = (): string => {
        if (!selectedHighlight) {
            return ""
        }
        const highlightSpan = document.querySelector(`#${selectedHighlight.id}`);
        if (!highlightSpan){
            return ""
        }
        return highlightSpan.textContent;
    };

    const onSave = () => {
        const newHighlight: Highlight = {...selectedHighlight, infoType: selectedInfoType}
        onEditHighlight(newHighlight);
        saveInfoTypeToDB(selectedHighlight, selectedInfoType);
        onClose();
    }

    return (<>
        <div className="d-flex flex-row width-full">
            <div className="h4 mr-3">Mark</div>
            <div className="f5">{getHighlightedText()}</div>
        </div>
        <div className="d-flex flex-row width-full">
            <div className="h4 mr-3">As</div>
            <select className="form-select" value={selectedInfoType} onChange={(e) => setSelectedInfoType(e.target.value as InformationType)}>
                {informationTypeOptions}
            </select>
        </div>
        <div className="d-flex flex-row width-full flex-justify-end">
            <div className="btn btn-primary" onClick={() => onSave()}>Confirm</div>
        </div>
    </>)
}