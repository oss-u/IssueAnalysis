import React, { useState } from "react"
import ReactDOM from "react-dom";
import "../style.scss";
import {Highlight, InformationType} from "../types"

interface HighlightProps {
  text: string,
  infoType: InformationType,
  onClick: () => void;
  selected: boolean;
}

// const infoTypeIdToColor = {
//   0: "#FF0000",
//   1: "#00FF00",
//   2: "#0000FF",
// }

export default function Highlight(props: HighlightProps): JSX.Element {
    const {text, infoType, selected} = props

    const [backgroundColor, setBackgroundColor] = useState<string>(selected ? "#3C89D0" : "#6CA9FF");

    return (
        <span style={{backgroundColor}} onClick={() => setBackgroundColor("#FF00FF")} dangerouslySetInnerHTML={{__html: text}}/>
      );
}

export function highlightComment(commentEl: Element, selectedHighlightId: string, highlights: Highlight[]) {
  let addedLength = 0;
  const highlightIdsAndInfoTypes: {id: string, infoType: InformationType}[] = [];
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
    const selected = selectedHighlightId === idInfoTypePair.id;
    if (selected){
      commentEl.scrollIntoView({block: 'center', behavior: 'smooth'})
    }
    ReactDOM.render(<Highlight text={highlightText} infoType={idInfoTypePair.infoType} selected={selected} onClick={() => {}}/>, highlightSpan);
  })
}