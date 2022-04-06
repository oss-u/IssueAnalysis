
/**
 * DEPRECATED COMPONENT
 */



import React, { useCallback, useEffect, useState } from "react"
import ReactDOM from "react-dom";
import "../style.scss";
import { Highlight, IssueComment } from "../../types";
import { commentParser, getAllCommentsOnIssue } from "../../utils/comment_parser";
import {highlightComment} from "../HighlightedComment";
import { v4 as uuidv4 } from "uuid"
import { informationTypeMap } from "../../utils/maps";
import { ISummaryType } from "../InformationTypeTabs";


interface TopLevelNavBoxProps {
    selectedComment: IssueComment | null;
    summaries: ISummaryType[];
    initInfoTypeId: number;
    hidden: boolean;
    onClose: () => void;
    onOpen: () => void;
}

const informationTypeOptions = Array.from(informationTypeMap).map(([id, infoType]) => (<option value={id}>{infoType.title}</option>));

const NAVBOX_WIDTH = 300;
const GITHUB_MAX_CONTENT_SIZE = 1280;

export default function TopLevelNavBox(props: TopLevelNavBoxProps): JSX.Element {
    const {selectedComment, summaries, initInfoTypeId, hidden, onClose, onOpen} = props;
    const [editSelectedHighlight, setEditSelectedHighlight] = useState<boolean>(false);
    const [selectedInfoTypeId, setSelectedInfoTypeId] = useState<number>(initInfoTypeId);
    const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number>(0);
    const [allSummarySentences, setAllSummarySentences] = useState<Highlight[]>([]);
    const [filteredHighlights, setFilteredHighlights] = useState<Highlight[]>([]);
    const [comments, setComments] = useState<IssueComment[]>([]);
    const [originalCommentHTML, setOriginalCommentHTML] = useState<string[]>([]);
    const [changeInfoTypeTo, setChangeInfoTypeTo] = useState<number | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement>(document.querySelector("#show_issue") as HTMLElement);
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

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
        const allHighlights = summaries.map((summary) => summary.commentHighlights).flat();
        setComments(allComments);
        setAllSummarySentences(allHighlights);
        setOriginalCommentHTML(getOriginalCommentHTMLs(allComments));
        window.addEventListener('resize', (e) => {
            setWindowWidth(window.innerWidth);
        })
    }, [])

    useEffect(() => {
        if (selectedComment){
            if (hidden) {
                onOpen();
            }
            const newFilteredHighlights = allSummarySentences.filter((highlight) => highlight.commentId === selectedComment.id);
            setFilteredHighlights(newFilteredHighlights);
        }
    }, [selectedComment])

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
    
    const windowWidthMaxed = windowWidth > GITHUB_MAX_CONTENT_SIZE;
    return (
        <div className="Box p-2 d-flex flex-column">
            {!editSelectedHighlight && (<>
                <div id="navButtons" className="d-flex flex-row flex-justify-end">
                        <button className="btn-octicon my-2" onClick={() => setSelectedSentenceIndex(selectedSentenceIndex-1)}>&#12296;</button>
                        <button className="btn-octicon my-2" onClick={() => setSelectedSentenceIndex(selectedSentenceIndex+1)}>&#12297;</button>
                        <button className="btn-octicon my-2 ml-2" onClick={cleanUpAndClose}>&#12298;</button>
                </div>
                <div className="d-flex flex-row width-full">
                    <div className="mr-4">Showing</div>
                    <select className="form-select" style={{maxWidth: 200}} value={selectedInfoTypeId} onChange={(e) => onSelectInfoType(parseInt(e.target.value))}>
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
