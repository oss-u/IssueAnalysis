import React, { useEffect } from "react";
import { Highlight } from "../types";
import { informationTypeMap } from "../utils/maps";

interface CommentNavBoxProps {
    highlights: Highlight[]
    onChangeSelectedHightlight: (index: number) => void
    onClose: () => void;
}

const getCircularIndex = (curVal: number, maxVal: number, direction: '+' | '-') => {
    switch(direction){
        case '+':
            return (curVal + 1) % maxVal;
        case '-':
            return curVal - 1 < 0 ? maxVal -1 : curVal - 1
    }
}

export function CommentNavBox(props: CommentNavBoxProps): JSX.Element {
    const {highlights, onChangeSelectedHightlight, onClose} = props;
    const [selectedHighlightIndex, setSelectedHighlightIndex] = React.useState<number>(0);

    useEffect(() => {
        onChangeSelectedHightlight(selectedHighlightIndex);
    }, [selectedHighlightIndex])

    return (
        <div className="Box p-2 d-flex flex-column">
            {(<>
                <div id="navButtons" className="d-flex flex-row flex-justify-end">
                        <button className="btn-octicon my-2" onClick={() => setSelectedHighlightIndex(getCircularIndex(selectedHighlightIndex, highlights.length, '-'))}>&#12296;</button>
                        <button className="btn-octicon my-2" onClick={() => setSelectedHighlightIndex(getCircularIndex(selectedHighlightIndex, highlights.length, '+'))}>&#12297;</button>
                        <button className="btn-octicon my-2 ml-2" onClick={onClose}>&#12298;</button>
                </div>
                <div className="d-flex flex-row width-full">
                    <div className="mr-4">Showing</div>
                    <div>{informationTypeMap.get(highlights[selectedHighlightIndex].infoTypeId).title}</div>
                </div>
                <div id="navContainer" className="d-flex flex-row width-full">
                    <div className="mr-4">Sentence</div>
                    <div>{selectedHighlightIndex + 1} of {highlights.length}</div>
                </div>
                <div className="d-flex flex-row width-full flex-justify-end">
                    <div className="btn" onClick={() => {}}>Edit highlight</div>
                </div>
            </>)}
        </div>
      );
}