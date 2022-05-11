import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { Highlight, InformationType, IssueComment, Summary } from "../types";
import { CommentNavBox } from "./highlight-nav/CommentNavBox";
import { highlightComment } from "./HighlightedComment";
import TopLevelSummaryBox from "./TopLevelSummaryBox";
import { ISummaryType } from "./InformationTypeTabs";
import { commentParser, getAllCommentsOnIssue } from "../utils/comment_parser";
import octicons from "@primer/octicons"

const getAllHighlightsFromSummaries = (summaries: ISummaryType[], allComments: IssueComment[]): Highlight[] => {
    const allHighlights = summaries.flatMap((summary) => summary.commentHighlights);
    const commentIdToClientHeight = {}
    allComments.forEach((comment) => {
        commentIdToClientHeight[comment.id] = comment.tag.getBoundingClientRect().top
    });
    console.log(commentIdToClientHeight);
    const sortedHighlights = allHighlights.sort((h1, h2) => {
        const heightDiff = commentIdToClientHeight[h1.commentId] - commentIdToClientHeight[h2.commentId];
        if (heightDiff !== 0){
            return heightDiff;
        }
        return h1.span.start - h2.span.start;
    })
    console.log(sortedHighlights);
    return sortedHighlights;
}

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

const modifySummaryFromHighlightEdit = (summary: ISummaryType, newHighlight: Highlight): ISummaryType => {
    const editedHighlightIndex = summary.commentHighlights.findIndex((highlight) => highlight.id === newHighlight.id);
    const sameInfoType = summary.infoType === newHighlight.infoType;
    if (editedHighlightIndex < 0 && !sameInfoType){
        return summary;
    }
    let newHighlights = [...summary.commentHighlights]
    if (editedHighlightIndex >= 0){
        newHighlights.splice(editedHighlightIndex, 1)
    }
    if (sameInfoType){
        newHighlights.push(newHighlight);
    }
    return {...summary, commentHighlights: newHighlights};
}

interface TopLevelSummaryProps {
    initSummaries: ISummaryType[];
}

export default function TopLevelSummary(props: TopLevelSummaryProps): JSX.Element {
    const {initSummaries} = props;
    const [comments, setComments] = React.useState<IssueComment[]>(Array.from(getAllCommentsOnIssue()).map((comment) => commentParser(comment)));
    const [summaries, setSummaries] = React.useState<ISummaryType[]>(initSummaries);
    const [selectedInfoType, setSelectedInfoType] = React.useState<InformationType | null>(null);
    const [selectedComment, setSelectedComment] = React.useState<IssueComment | null>(null);
    const [selectedCommentNavBox, setSelectedCommentNavBox] = React.useState<HTMLDivElement | null>(null);
    const [selectedHighlightIndex, setSelectedHighlightIndex] = React.useState<number>(0);
    const [allHighlights, setAllHighlights] = React.useState<Highlight[]>([]);
    const [selectedHighlights, setSelectedHighlights] = React.useState<Highlight[]>([]);
    const [originalCommentHTML, setOriginalCommentHTML] = React.useState<string[]>(getOriginalCommentHTMLs(comments));

    const onEditHighlight = (newHighlight: Highlight) => {
        const newSummaries = summaries.map((summary) => modifySummaryFromHighlightEdit(summary, newHighlight));
        // TODO: Add DB call
        setSummaries(newSummaries);
        // setSelectedComment(null);
    }

    useEffect(() => {
        Array.from(getAllCommentsOnIssue()).forEach((comment) => {
            const commentDetails = commentParser(comment);
            const iconContainer = comment.querySelector("div.timeline-comment-header.clearfix.d-block.d-sm-flex > div.timeline-comment-actions.flex-shrink-0");
            const newButton = document.createElement('button');
            newButton.innerHTML = octicons.paintbrush.toSVG();
            newButton.className = "btn-octicon";
            newButton.onclick = (e) => {setSelectedComment(commentDetails)};
            iconContainer.prepend(newButton);
          })
    }, [])
    

    useEffect(() => {
        setAllHighlights(getAllHighlightsFromSummaries(summaries, comments));
    }, [summaries])

    useEffect(() => {
        if (!selectedInfoType){
            if (!selectedComment){
                setSelectedHighlights([]);
            }
            return;
        }
        setSelectedComment(null);
        const newFilteredHighlights = allHighlights.filter((highlight) => highlight.infoType === selectedInfoType);
        setSelectedHighlights(newFilteredHighlights);
    }, [selectedInfoType])

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
        if (selectedCommentNavBox){
            selectedCommentNavBox.remove();
            setSelectedCommentNavBox(null);
        }
        if (!selectedComment){
            if (!selectedInfoType){
                setSelectedHighlights([]);
            }
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
        filteredHighlights.sort((h1, h2) => h1.span.start - h2.span.start);
        setSelectedHighlights(filteredHighlights);
        setSelectedCommentNavBox(insertedBox);
        setSelectedInfoType(null);
        ReactDOM.render(
            <CommentNavBox 
                highlights={filteredHighlights} 
                onChangeSelectedHightlight={(num) => setSelectedHighlightIndex(num)} 
                onClose={() => setSelectedComment(null)}
                onEditHighlight={onEditHighlight}
            />, insertedBox);
    }, [selectedComment, allHighlights])

    const onChangeSelectedHighlightIndexTopLevel = (newIndex) => {
        setSelectedHighlightIndex(newIndex)
        const newSelectedHighlight = selectedHighlights[newIndex];
        if (!newSelectedHighlight) {
            return;
        }
        const highlightEl = document.querySelector(`#${newSelectedHighlight.id}`);
        if (!highlightEl){
            return;
        }
        highlightEl.scrollIntoView({block: 'center', behavior: 'smooth'});
    }
    
    return (<TopLevelSummaryBox 
                summaries={summaries}
                highlights={selectedHighlights}
                selectedInfoType={selectedInfoType}
                updateSummaries={(newSummaries) => setSummaries(newSummaries)} 
                updateSelectedComment={(newSelectedComment) => setSelectedComment(newSelectedComment)} 
                updateSelectedInfoType={(newInfoType) => setSelectedInfoType(newInfoType)}
                updateSelectedHighlightIndex={onChangeSelectedHighlightIndexTopLevel}
            />)
}