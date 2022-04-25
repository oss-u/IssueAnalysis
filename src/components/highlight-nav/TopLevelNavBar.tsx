import React, {useEffect} from "react";
import { Highlight, InformationType } from "../../types";
import { informationTypeMap } from "../../utils/maps";
import { getCircularIndex } from "../../utils/navigation";


interface TopLevelNavBarProps {
    highlights: Highlight[];
    selectedInfoType: InformationType;
    summaryInfoTypes: InformationType[];
    onChangeSelectedHightlight: (index: number) => void;
    onChangeInfoType: (newInfoType: InformationType) => void;
}

export function TopLevelNavBar(props: TopLevelNavBarProps): JSX.Element {
    const {highlights, selectedInfoType, summaryInfoTypes, onChangeSelectedHightlight, onChangeInfoType} = props;
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

    const infoTypeOptions = summaryInfoTypes.map((infoType) => (<option value={infoType}>{informationTypeMap.get(infoType).title}</option>));

    return (
        <div ref={(ref) => setThisElement(ref)} className="d-flex">
            <div className={onScreen ? "d-flex flex-row" : "d-flex flex-row Box width-full flex-justify-center flex-items-center"} style={!onScreen ? {position: 'fixed', top: 60, left:0, zIndex: 101} : undefined}>
                {!onScreen && (
                    <>
                        <div className="mr-2">Showing</div>
                        <select className="form-select" value={selectedInfoType} onChange={(e) => onChangeInfoType(e.target.value as InformationType)}>
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