import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { Highlight, IssueComment } from "../types";
import { CommentNavBox } from "./highlight-nav/CommentNavBox";
import { highlightComment } from "./HighlightedComment";
import TopLevelSummaryBox from "./TopLevelSummaryBox";
import { ISummaryType } from "./InformationTypeTabs";
import { commentParser, getAllCommentsOnIssue } from "../utils/comment_parser";

const getAllHighlightsFromSummaries = (summaries: ISummaryType[]): Highlight[] => summaries.flatMap((summary) => summary.commentHighlights);

const getOriginalCommentHTMLs = (allComments: IssueComment[]): string[] => {
    const commentHTMLs = allComments.map((comment) => comment.tag.querySelector("div.edit-comment-hide > task-lists > table > tbody > tr > td").innerHTML);
    return commentHTMLs
}

const cleanupComments = (comments: IssueComment[], originalCommentHTML: string[]) => {
    if (comments.length !== originalCommentHTML.length){
        console.warn("Length of comments is not equal to originalCommentHTML. Maybe a new comment was added?");
    }
    comments.forEach((comment, index) => {
        comment.tag.querySelector("div.edit-comment-hide > task-lists > table > tbody > tr > td").innerHTML = originalCommentHTML[index];
    })
}

export default function TopLevelSummary(): JSX.Element {
    const [comments, setComments] = React.useState<IssueComment[]>(Array.from(getAllCommentsOnIssue()).map((comment) => commentParser(comment)));
    const [summaries, setSummaries] = React.useState<ISummaryType[]>([]);
    const [selectedInfoTypeId, setSelectedInfoTypeId] = React.useState<number | null>(null);
    const [selectedComment, setSelectedComment] = React.useState<IssueComment | null>(null);
    const [selectedCommentNavBox, setSelectedCommentNavBox] = React.useState<HTMLDivElement | null>(null);
    const [selectedHighlightIndex, setSelectedHighlightIndex] = React.useState<number>(0);
    const [allHighlights, setAllHighlights] = React.useState<Highlight[]>([]);
    const [selectedHighlights, setSelectedHighlights] = React.useState<Highlight[]>([]);
    const [originalCommentHTML, setOriginalCommentHTML] = React.useState<string[]>(getOriginalCommentHTMLs(comments));

    useEffect(() => {
        setAllHighlights(getAllHighlightsFromSummaries(summaries));
    }, [summaries])

    useEffect(() => {
        if (selectedCommentNavBox){
            selectedCommentNavBox.remove();
            setSelectedCommentNavBox(null);
        }
        if (!selectedComment){
            if (!selectedInfoTypeId){
                setSelectedHighlights([]);
            }
            return;
        }
        setSelectedInfoTypeId(null);
        const newFilteredHighlights = allHighlights.filter((highlight) => highlight.commentId === selectedComment.id);
        setSelectedHighlights(newFilteredHighlights);
    }, [selectedComment])

    useEffect(() => {
        if (!selectedInfoTypeId){
            if (!selectedComment){
                setSelectedHighlights([]);
            }
            return;
        }
        setSelectedComment(null);
        const newFilteredHighlights = allHighlights.filter((highlight) => highlight.infoTypeId === selectedInfoTypeId);
        setSelectedHighlights(newFilteredHighlights);
    }, [selectedInfoTypeId])

    useEffect(() => {
        cleanupComments(comments, originalCommentHTML);
        if (selectedHighlights.length === 0){
            return;
        }
        const selectedSentence = selectedHighlights[selectedHighlightIndex];
        const selectedSentenceId = selectedSentence ? selectedSentence.id : "";
        comments.forEach((comment) => {
            const commentEl = comment.tag.querySelector("div.edit-comment-hide > task-lists > table > tbody > tr > td")
            const commentHighlights = selectedHighlights.filter((highlight) => highlight.commentId === comment.id);
            highlightComment(commentEl, selectedSentenceId, commentHighlights);
        })
    }, [selectedHighlights, selectedHighlightIndex])

    useEffect(() => {
        if (!selectedComment){
            return;
        }
        const navBox = document.createElement('div');
        navBox.style.width = '300px';
        navBox.style.marginRight = '-300px';
        navBox.style.top = '0';
        navBox.style.right = '0';
        navBox.style.position = 'absolute';
        navBox.style.zIndex = '100';
        const insertedBox = selectedComment.tag.appendChild(navBox);
        const filteredHighlights = allHighlights.filter((h) => h.commentId === selectedComment.id);
        setSelectedHighlights(filteredHighlights);
        setSelectedCommentNavBox(insertedBox);
        ReactDOM.render(<CommentNavBox highlights={filteredHighlights} onChangeSelectedHightlight={(num) => setSelectedHighlightIndex(num)} onClose={() => setSelectedComment(null)} />, insertedBox);
    }, [selectedComment])
    
    return (<TopLevelSummaryBox 
                summaries={summaries}
                selectedInfoTypeId={selectedInfoTypeId}
                updateSummaries={(newSummaries) => setSummaries(newSummaries)} 
                updateSelectedComment={(newSelectedComment) => setSelectedComment(newSelectedComment)} 
                updateSelectedInfoTypeId={(newInfoTypeId) => setSelectedInfoTypeId(newInfoTypeId)}
            />)
}