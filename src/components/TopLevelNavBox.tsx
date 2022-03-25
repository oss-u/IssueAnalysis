
import React, { useCallback, useEffect, useState } from "react"
import ReactDOM from "react-dom";
import "../style.scss";
import { Highlight, IssueComment } from "../types";
import { commentParser, getAllCommentsOnIssue } from "../utils/comment_parser";
import {highlightComment} from "./HighlightedComment";
import { v4 as uuidv4 } from "uuid"
import { informationTypeMap } from "../utils/maps";
import { ISummaryType } from "./InformationType";


interface TopLevelNavBoxProps {
    summaries: ISummaryType[];
    initInfoTypeId: number;
    hidden: boolean;
    onClose: () => void;
    onOpen: () => void;
}

const informationTypeOptions = Array.from(informationTypeMap).map(([id, infoType]) => (<option value={id}>{infoType.title}</option>));

export default function TopLevelNavBox(props: TopLevelNavBoxProps): JSX.Element {
    const {summaries, initInfoTypeId, hidden, onClose, onOpen} = props;
    const [clickedCommentId, setClickedCommentId] = useState<string | null>(null);
    const [editSelectedHighlight, setEditSelectedHighlight] = useState<boolean>(false);
    const [selectedInfoTypeId, setSelectedInfoTypeId] = useState<number>(initInfoTypeId);
    const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number>(0);
    const [allSummarySentences, setAllSummarySentences] = useState<Highlight[]>([]);
    const [filteredHighlights, setFilteredHighlights] = useState<Highlight[]>([]);
    const [comments, setComments] = useState<IssueComment[]>([]);
    const [originalCommentHTML, setOriginalCommentHTML] = useState<string[]>([]);
    const [changeInfoTypeTo, setChangeInfoTypeTo] = useState<number | null>(null);

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
        //let allHighlights: Highlight[] = []
        // allComments.forEach((comment, index) => {
        //     //const newHighlights: Highlight[] = [{id: `h${uuidv4()}`, commentId: comment.id, span: {start: 14, end: 20}, infoTypeId: 0}, {id: `h${uuidv4()}`, commentId: comment.id, span: {start: 20, end: 25}, infoTypeId: 1}, {id: `h${uuidv4()}`, commentId: comment.id, span: {start: 25, end: 30}, infoTypeId: 2}];
        //     //allHighlights = allHighlights.concat(newHighlights);
            
        //     comment.tag.addEventListener('click', () => setClickedCommentId(comment.id));
        // })
        const allHighlights = summaries.map((summary) => summary.commentHighlights).flat();
        setComments(allComments);
        setAllSummarySentences(allHighlights);
        setOriginalCommentHTML(getOriginalCommentHTMLs(allComments));
    }, [])

    useEffect(() => {
        if (clickedCommentId){
            if (hidden) {
                onOpen();
            }
            const newFilteredHighlights = allSummarySentences.filter((highlight) => highlight.commentId === clickedCommentId);
            setFilteredHighlights(newFilteredHighlights);
            setClickedCommentId(null);
        }
    }, [clickedCommentId])

    useEffect(() => {
        const newFilteredHighlights = allSummarySentences.filter((sentence) => sentence.infoTypeId === selectedInfoTypeId);
        setFilteredHighlights(newFilteredHighlights);
        setSelectedSentenceIndex(0)
        setChangeInfoTypeTo(selectedInfoTypeId);
    }, [selectedInfoTypeId])

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
        setSelectedInfoTypeId(initInfoTypeId)
    }, [initInfoTypeId])

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

    const onSelectInfoType = (infoTypeId: number) => {
        setSelectedInfoTypeId(infoTypeId)
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
                    <select className="form-select" value={selectedInfoTypeId} onChange={(e) => onSelectInfoType(parseInt(e.target.value))}>
                        {informationTypeOptions}
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
                    <select className="form-select" value={changeInfoTypeTo} onChange={(e) => setChangeInfoTypeTo(parseInt(e.target.value))}>
                        {informationTypeOptions}
                    </select>
                </div>
                <div className="d-flex flex-row width-full flex-justify-end">
                    <div className="btn btn-primary" onClick={onConfirmInfoTypeChange}>Confirm</div>
                </div>
            </>)}
        </div>
      );
}
