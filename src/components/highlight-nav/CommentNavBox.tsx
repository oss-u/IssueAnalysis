import React, { useEffect } from "react";
import { Highlight } from "../../types";
import { informationTypeMap } from "../../utils/maps";
import { getCircularIndex } from "../../utils/navigation";
import { EditSelectedHighlight } from "./EditSelectedHighlight";

interface CommentNavBoxProps {
    highlights: Highlight[]
    onChangeSelectedHightlight: (index: number) => void
    onClose: () => void;
    onEditHighlight: (newHighlight: Highlight) => void;
}

export function CommentNavBox(props: CommentNavBoxProps): JSX.Element {
    const {highlights, onChangeSelectedHightlight, onClose, onEditHighlight} = props;
    const [selectedHighlightIndex, setSelectedHighlightIndex] = React.useState<number>(0);
    const [editingHighlight, setEditingHighlight] = React.useState<boolean>(false);

    useEffect(() => {
        onChangeSelectedHightlight(selectedHighlightIndex);
    }, [selectedHighlightIndex])

    return (
        <div className="Box p-2 d-flex flex-column">
            {!editingHighlight && (<>
                <div id="navButtons" className="d-flex flex-row flex-justify-end">
                        <button className="btn-octicon my-2" onClick={() => setSelectedHighlightIndex(getCircularIndex(selectedHighlightIndex, highlights.length, '-'))}>&#12296;</button>
                        <button className="btn-octicon my-2" onClick={() => setSelectedHighlightIndex(getCircularIndex(selectedHighlightIndex, highlights.length, '+'))}>&#12297;</button>
                        <button className="btn-octicon my-2 ml-2" onClick={onClose}>&#12298;</button>
                </div>
                <div className="d-flex flex-row width-full">
                    <div className="mr-4">Showing</div>
                    <div>{highlights.length > 0 ? informationTypeMap.get(highlights[selectedHighlightIndex].infoTypeId).title : "No Highlights"}</div>
                </div>
                <div id="navContainer" className="d-flex flex-row width-full">
                    <div className="mr-4">Sentence</div>
                    <div>{selectedHighlightIndex + 1} of {highlights.length}</div>
                </div>
                <div className="d-flex flex-row width-full flex-justify-end">
                    <div className="btn" onClick={() => setEditingHighlight(true)}>Edit highlight</div>
                </div>
            </>)}
            {editingHighlight && (<EditSelectedHighlight selectedHighlight={highlights[selectedHighlightIndex]} onEditHighlight={onEditHighlight} onClose={() => setEditingHighlight(false)}/>)}
        </div>
      );
}