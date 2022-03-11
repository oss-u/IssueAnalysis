
import React, { useEffect, useState } from "react"
import ReactDOM from "react-dom";
import "../style.scss";
import { InformationType, IssueComment } from "../types";
import { commentParser, getAllCommentsOnIssue } from "../utils/comment_parser";
import {highlightComment, Highlight} from "./HighlightedComment";
import { v4 as uuidv4 } from "uuid"


interface TopLevelNavBoxProps {
    initInfoType: InformationType;
    hidden: boolean;
    onClose: () => void;
}

export default function TopLevelNavBox(props: TopLevelNavBoxProps): JSX.Element {
    const {initInfoType, hidden, onClose} = props;

    const [editSelectedHighlight, setEditSelectedHighlight] = useState<boolean>(false);
    const [selectedInfoType, setSelectedInfoType] = useState<InformationType>(initInfoType);
    const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number>(0);
    const [allSummarySentences, setAllSummarySentences] = useState<Highlight[]>([]);
    const [filteredHighlights, setFilteredHighlights] = useState<Highlight[]>([]);
    const [comments, setComments] = useState<IssueComment[]>([]);
    const [originalCommentHTML, setOriginalCommentHTML] = useState<string[]>([]);
    const [changeInfoTypeTo, setChangeInfoTypeTo] = useState<InformationType>("none");

    const getOriginalCommentHTMLs = (allComments: IssueComment[]): string[] => {
        const commentHTMLs = allComments.map((comment) => comment.tag.querySelector("div.edit-comment-hide > task-lists > table > tbody > tr > td").innerHTML);
        return commentHTMLs
    }

    const cleanupComments = () => {
        comments.forEach((comment, index) => {
            comment.tag.querySelector("div.edit-comment-hide > task-lists > table > tbody > tr > td").innerHTML = originalCommentHTML[index];
        })
    }

    useEffect(() => {
        const allCommentElements = Array.from(getAllCommentsOnIssue())
        const allComments = allCommentElements.map(commentParser)
        let allHighlights: Highlight[] = []
        allComments.forEach((comment, index) => {
            const newHighlights: Highlight[] = [{id: `h${uuidv4()}`, commentId: comment.id, span: {start: 14, end: 30}, infoType: "expectedBehaviour"}];
            allHighlights = allHighlights.concat(newHighlights);
        })
        setComments(allComments);
        setAllSummarySentences(allHighlights);
        setOriginalCommentHTML(getOriginalCommentHTMLs(allComments));
    }, [])

    useEffect(() => {
        const newFilteredHighlights = allSummarySentences.filter((sentence) => sentence.infoType === selectedInfoType);
        setFilteredHighlights(newFilteredHighlights);
        setSelectedSentenceIndex(0)
        setChangeInfoTypeTo(selectedInfoType);
    }, [selectedInfoType])

    useEffect(() => {
        if (!selectedSentenceIndex){
            return;
        }
        else if (filteredHighlights.length === 0){
            setSelectedSentenceIndex(null)
        }
        else if (selectedSentenceIndex >= filteredHighlights.length){
            setSelectedSentenceIndex(0)
        }
        else if (selectedSentenceIndex < 0){
            setSelectedSentenceIndex(filteredHighlights.length - 1)
        }
    }, [selectedSentenceIndex, filteredHighlights])

    useEffect(() => {
        setSelectedInfoType(initInfoType)
    }, [initInfoType])

    useEffect(() => {
        cleanupComments();
        const selectedSentence = filteredHighlights[selectedSentenceIndex];
        const selectedSentenceId = selectedSentence ? selectedSentence.id : "";
        comments.forEach((comment) => {
            const commentEl = comment.tag.querySelector("div.edit-comment-hide > task-lists > table > tbody > tr > td")
            const commentHighlights = filteredHighlights.filter((highlight) => highlight.commentId === comment.id);
            highlightComment(commentEl, selectedSentenceId, commentHighlights);
        })
    }, [selectedSentenceIndex, filteredHighlights])

    const onSelectInfoType = (infoType: InformationType) => {
        setSelectedInfoType(infoType)
    }

    const cleanUpAndClose = () => {
        cleanupComments();
        onClose();
    }

    const getHighlightedText = (): string => {
        const selectedHighlight = filteredHighlights[selectedSentenceIndex];
        if (!selectedHighlight) {
            return ""
        }
        const highlightSpan = document.querySelector(`#${selectedHighlight.id}`);
        if (!highlightSpan){
            return ""
        }
        return highlightSpan.textContent;
    };

    const onConfirmInfoTypeChange = () => {
        const selectedHighlightId = filteredHighlights[selectedSentenceIndex].id;
        const newSummarySentences = allSummarySentences.map((sentence) => {
            if (sentence.id === selectedHighlightId){
                return {...sentence, infoType: changeInfoTypeTo};
            }
            return sentence;
        })
        setAllSummarySentences(newSummarySentences);
        setEditSelectedHighlight(false);
        cleanUpAndClose();
    }

    if (hidden){
        return <></>
    }
    
    return (
        <div className="Box position-fixed p-2 d-flex flex-column" style={{width: 300, zIndex: 100, right: 8}}>
            {!editSelectedHighlight && (<>
                <div id="navButtons" className="d-flex flex-row flex-justify-end">
                        <button className="btn-octicon my-2" onClick={() => setSelectedSentenceIndex(selectedSentenceIndex-1)}>&#12296;</button>
                        <button className="btn-octicon my-2" onClick={() => setSelectedSentenceIndex(selectedSentenceIndex+1)}>&#12297;</button>
                        <button className="btn-octicon my-2 ml-2" onClick={cleanUpAndClose}>&#12298;</button>
                </div>
                <div className="d-flex flex-row width-full">
                    <div className="mr-4">Showing</div>
                    <select className="form-select" value={selectedInfoType} onChange={(e) => onSelectInfoType(e.target.value as InformationType)}>
                        <option value="expectedBehaviour">Expected Behaviour</option>
                        <option value="motivation">Motivation</option>
                        <option value="solutionDiscussion">Solution Discussion</option>
                    </select>
                </div>
                <div id="navContainer" className="d-flex flex-row width-full">
                    <div className="mr-4">Sentence</div>
                    <div>{selectedSentenceIndex + 1} of {filteredHighlights.length}</div>
                </div>
                <div className="d-flex flex-row width-full flex-justify-end">
                    <div className="btn" onClick={() => setEditSelectedHighlight(true)}>Edit highlight</div>
                </div>
            </>)}
            {editSelectedHighlight && (<>
                <div className="d-flex flex-row width-full">
                    <div className="h4 mr-3">Mark</div>
                    <div className="f5">{getHighlightedText()}</div>
                </div>
                <div className="d-flex flex-row width-full">
                    <div className="h4 mr-3">As</div>
                    <select className="form-select" value={changeInfoTypeTo} onChange={(e) => setChangeInfoTypeTo(e.target.value as InformationType)}>
                        <option value="expectedBehaviour">Expected Behaviour</option>
                        <option value="motivation">Motivation</option>
                        <option value="solutionDiscussion">Solution Discussion</option>
                    </select>
                </div>
                <div className="d-flex flex-row width-full flex-justify-end">
                    <div className="btn btn-primary" onClick={onConfirmInfoTypeChange}>Confirm</div>
                </div>
            </>)}
        </div>
      );
}
