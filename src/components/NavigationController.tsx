import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { Highlight, IssueComment } from "../types";
import { CommentNavBox } from "./CommentNavBox";
import { highlightComment } from "./HighlightedComment";
import { ISummaryType } from "./InformationType";

interface NavigationControllerProps {
    selectedInfoTypeId: number | null;
    selectedComment: IssueComment | null;
    onChangeSelectedComment: (newComment: IssueComment| null) => void
    comments: IssueComment[];
    summaries: ISummaryType[];
}

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

export default function NavigationController(props: NavigationControllerProps): JSX.Element {
    const {selectedInfoTypeId, selectedComment, onChangeSelectedComment, comments, summaries} = props;
    const [selectedCommentNavBox, setSelectedCommentNavBox] = React.useState<HTMLDivElement | null>(null);
    const [selectedHighlightIndex, setSelectedHighlightIndex] = React.useState<number>(0);
    const [allHighlights, setAllHighlights] = React.useState<Highlight[]>(getAllHighlightsFromSummaries(summaries));
    const [selectedHighlights, setSelectedHighlights] = React.useState<Highlight[]>([]);
    const [originalCommentHTML, setOriginalCommentHTML] = React.useState<string[]>(getOriginalCommentHTMLs(comments));

    useEffect(() => {
        setAllHighlights(getAllHighlightsFromSummaries(summaries));
    }, [summaries])

    useEffect(() => {
        if (!selectedComment){
            if (selectedCommentNavBox){
                selectedCommentNavBox.remove();
                setSelectedCommentNavBox(null);
            }
            if (!selectedInfoTypeId){
                setSelectedHighlights([]);
            }
            return;
        }
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
        ReactDOM.render(<CommentNavBox highlights={filteredHighlights} onChangeSelectedHightlight={(num) => setSelectedHighlightIndex(num)} onClose={() => onChangeSelectedComment(null)} />, insertedBox);
    }, [selectedComment])
    return (<div id="NavController"/>)
}