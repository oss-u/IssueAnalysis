import React from 'react';
import { Highlight, InformationType } from '../../types';
import { informationTypeMap } from '../../utils/maps';

interface EditSelectedHighlightProps {
    selectedHighlight: Highlight;
    onEditHighlight: (newHighlight: Highlight) => void;
    onClose: () => void;
}

const informationTypeOptions = Array.from(informationTypeMap).map(([id, infoType]) => (<option value={id}>{infoType.title}</option>));

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