import React, {useEffect, useRef} from "react";
import { Highlight } from "../../types";
import { informationTypeMap } from "../../utils/maps";
import { getCircularIndex } from "../../utils/navigation";


interface TopLevelNavBarProps {
    highlights: Highlight[];
    selectedInfoTypeId: number;
    summaryInfoTypeIds: number[];
    onChangeSelectedHightlight: (index: number) => void;
    onChangeInfoType: (id: number) => void;
}

export function TopLevelNavBar(props: TopLevelNavBarProps): JSX.Element {
    const {highlights, selectedInfoTypeId, summaryInfoTypeIds, onChangeSelectedHightlight, onChangeInfoType} = props;
    const [selectedHighlightIndex, setSelectedHighlightIndex] = React.useState<number>(0);
    const [onScreen, setOnScreen] = React.useState<boolean>(true);
    const [thisElement, setThisElement] = React.useState<HTMLDivElement | null>(null)
    const [iObserver, setIObserver] = React.useState<IntersectionObserver | null>(null);

    useEffect(() => {
        let newObserver: IntersectionObserver | null = null;
        if (iObserver) {
            iObserver.disconnect();
        }
        if (thisElement){
            newObserver = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
            newObserver.observe(thisElement);
        }
        setIObserver(newObserver);
        if (newObserver) return () => {newObserver.disconnect()};
    }, [thisElement])

    useEffect(() => {
        setSelectedHighlightIndex(0);
    }, [highlights])

    useEffect(() => {
        onChangeSelectedHightlight(selectedHighlightIndex);
    }, [selectedHighlightIndex]);

    const infoTypeOptions = summaryInfoTypeIds.map((infoTypeId) => (
        <option value={infoTypeId}>{informationTypeMap.get(infoTypeId).title}</option>
    ));

    return (
        <div ref={(ref) => setThisElement(ref)} className="d-flex">
            <div className={onScreen ? "d-flex flex-row" : "d-flex flex-row Box width-full flex-justify-center flex-items-center"} style={!onScreen ? {position: 'fixed', top: 60, left:0, zIndex: 101} : undefined}>
                {!onScreen && (
                    <>
                        <div className="mr-2">Showing</div>
                        <select className="form-select" value={selectedInfoTypeId} onChange={(e) => onChangeInfoType(parseInt(e.target.value))}>
                            {infoTypeOptions}
                        </select>
                    </>
                )}
                <div id="navButtons" className="d-flex flex-row">
                    <button className="btn-octicon my-2" onClick={() => setSelectedHighlightIndex(getCircularIndex(selectedHighlightIndex, highlights.length, '-'))}>&#12296;</button>
                    <button className="btn-octicon my-2" onClick={() => setSelectedHighlightIndex(getCircularIndex(selectedHighlightIndex, highlights.length, '+'))}>&#12297;</button>
                </div>
                <div id="navContainer" className="d-flex flex-row flex-items-center">
                    <div className="mr-2">Sentence</div>
                    <div>{selectedHighlightIndex + 1} of {highlights.length}</div>
                </div>
            </div>
        </div>
    )

}