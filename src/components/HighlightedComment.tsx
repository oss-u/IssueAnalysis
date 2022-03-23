import React, { useState } from "react"
import ReactDOM from "react-dom";
import "../style.scss";
import { InformationType } from "../types";


export interface Highlight {
  id: string,
  commentId: string,
  span: {start: number, end: number},
  infoType: InformationType
}

interface HighlightProps {
  text: string,
  infoType: InformationType,
  onClick: () => void;
  selected: boolean;
}

const informationTypeToHighlightColorMap = {
  "expectedBehaviour": "#FF0000",
  "motivation": "#00FF00",
  "solutionDiscussion": "#0000FF",
}

export default function Highlight(props: HighlightProps): JSX.Element {
    const {text, infoType, selected} = props

    const [backgroundColor, setBackgroundColor] = useState<string>(selected ? "#3C89D0" : informationTypeToHighlightColorMap[infoType]);

    return (
        <span style={{backgroundColor}} onClick={() => setBackgroundColor("#FF00FF")}>
          {text}
        </span>
      );
}

export function highlightComment(commentEl: Element, selectedHighlightId: string, highlights: Highlight[]) {
  let addedLength = 0;
  const highlightIdsAndInfoTypes: {id: string, infoType: string}[] = [];
  //Create div blocks around highlights with unique ids
  let newInnerHTML: string = commentEl.innerHTML.trim();
  highlights.forEach((highlight) => {
    const highlightId = highlight.id
    const highlightOpenTag = `<span id=${highlightId}>`;
    const highlightCloseTag = '</span>'
    const oldInnerHTML = newInnerHTML;
    newInnerHTML = oldInnerHTML.slice(0, highlight.span.start + addedLength) + highlightOpenTag + oldInnerHTML.slice(highlight.span.start + addedLength, highlight.span.end + addedLength) + highlightCloseTag + oldInnerHTML.slice(highlight.span.end + addedLength);
    addedLength += highlightOpenTag.length + highlightCloseTag.length;
    highlightIdsAndInfoTypes.push({id: highlightId, infoType: highlight.infoType});
  })
  commentEl.innerHTML = newInnerHTML;
  highlightIdsAndInfoTypes.forEach((idInfoTypePair) => {
    const highlightSpan = document.querySelector(`#${idInfoTypePair.id}`);
    if (!highlightSpan){
      return;
    }
    const highlightText = highlightSpan.textContent;
    highlightSpan.textContent = '';
    ReactDOM.render(<Highlight text={highlightText} infoType={idInfoTypePair.infoType} selected={selectedHighlightId === idInfoTypePair.id}/>, highlightSpan);
  })
}