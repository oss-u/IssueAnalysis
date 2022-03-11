import React, { useState } from "react"
import ReactDOM from "react-dom";
import "../style.scss";
import { InformationType } from "../types";
import { v4 as uuidv4 } from "uuid";


export interface Highlight {
  id: string,
  commentId: string,
  span: {start: number, end: number},
  infoType: InformationType
}

interface HighlightProps {
  text: string,
  onClick: () => void;
  selected: boolean;
}

export default function Highlight(props: HighlightProps): JSX.Element {
    const {text, selected} = props

    const [backgroundColor, setBackgroundColor] = useState<string>(selected ? "#3C89D0" : "#30C5FF");

    return (
        <span style={{backgroundColor}} onClick={() => setBackgroundColor("#FF0000")}>
          {text}
        </span>
      );
}

export function highlightComment(commentEl: Element, selectedHighlightId: string, highlights: Highlight[]) {
  let addedLength = 0;
  let highlightNum = 0;
  const highlightIds: string[] = [];
  //Create div blocks around highlights with unique ids
  let newInnerHTML: string = commentEl.innerHTML.trim();
  highlights.forEach((highlight) => {
    const highlightId = highlight.id
    const highlightOpenTag = `<span id=${highlightId}>`;
    const highlightCloseTag = '</span>'
    const oldInnerHTML = newInnerHTML;
    newInnerHTML = oldInnerHTML.slice(0, highlight.span.start + addedLength) + highlightOpenTag + oldInnerHTML.slice(highlight.span.start + addedLength, highlight.span.end + addedLength) + highlightCloseTag + oldInnerHTML.slice(highlight.span.end + addedLength);
    addedLength += highlightOpenTag.length + highlightCloseTag.length;
    highlightNum += 1;
    highlightIds.push(highlightId);
  })
  commentEl.innerHTML = newInnerHTML;
  highlightIds.forEach((id) => {
    const highlightSpan = document.querySelector(`#${id}`);
    if (!highlightSpan){
      return;
    }
    const highlightText = highlightSpan.textContent;
    highlightSpan.textContent = '';
    ReactDOM.render(<Highlight text={highlightText} selected={selectedHighlightId === id}/>, highlightSpan);
  })
}