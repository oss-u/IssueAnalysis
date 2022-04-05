import React, {useEffect} from "react";
import { Highlight } from "../../types";
import { getCircularIndex } from "../../utils/navigation";


interface TopLevelNavBarProps {
    highlights: Highlight[]
    onChangeSelectedHightlight: (index: number) => void
}

export function TopLevelNavBar(props: TopLevelNavBarProps): JSX.Element {
    const {highlights, onChangeSelectedHightlight} = props;
    const [selectedHighlightIndex, setSelectedHighlightIndex] = React.useState<number>(0);

    useEffect(() => {
        onChangeSelectedHightlight(selectedHighlightIndex);
    }, [selectedHighlightIndex]);

    return (
        <div className="d-flex flex-row">
            <div id="navButtons" className="d-flex flex-row">
                <button className="btn-octicon my-2" onClick={() => setSelectedHighlightIndex(getCircularIndex(selectedHighlightIndex, highlights.length, '-'))}>&#12296;</button>
                <button className="btn-octicon my-2" onClick={() => setSelectedHighlightIndex(getCircularIndex(selectedHighlightIndex, highlights.length, '+'))}>&#12297;</button>
            </div>
            <div id="navContainer" className="d-flex flex-row">
                <div className="mr-4">Sentence</div>
                <div>{selectedHighlightIndex + 1} of {highlights.length}</div>
            </div>
        </div>
    )

}