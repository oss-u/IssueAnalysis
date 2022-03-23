
import React, { useEffect, useState } from "react"
import "../style.scss";
import { InformationTypes, InfoSentence, IssueComment } from "../types";
import { commentParser, getAllCommentsOnIssue } from "../utils/comment_parser";
import { sentenceSeparatorRegex } from "../utils/constants";


interface TopLevelNavBoxProps {
    initInfoType: InformationTypes;
    onClose: () => void
}

export default function TopLevelNavBox(props: TopLevelNavBoxProps): JSX.Element {
    const {initInfoType, onClose} = props;
    const [selectedInfoType, setSelectedInfoType] = useState<InformationTypes>(initInfoType);
    const [infoTypeSentences, setInfoTypeSentences] = useState<InfoSentence[]>([]);
    const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);
    const [comments, setComments] = useState<IssueComment[]>([]);
    const [sentences, setSentences] = useState<InfoSentence[]>([]);

    useEffect(() => {
        const allCommentElements = Array.from(getAllCommentsOnIssue())
        const allComments = allCommentElements.map(commentParser)
        let allSentences: InfoSentence[] = []
        let testAssignmentIndex = 0
        allComments.forEach((comment) => {
            
            const commentSentenceStrings = comment.text.split(sentenceSeparatorRegex);
            const commentSentences = commentSentenceStrings.map((sentence, index) => {
                // there are 16 of these so moving them into a map would be a good idea
                let infoType: InformationTypes = "none";
                if (index % 3 === 0)
                    infoType = "expectedBehaviour";
                else if (index % 3 === 1)
                    infoType = "motivation";
                else
                    infoType = "solutionDiscussion";
                return new InfoSentence(comment.id, index, infoType);
            });
            allSentences = allSentences.concat(commentSentences);
            testAssignmentIndex = (testAssignmentIndex + 1) % 3;
        })
        setComments(allComments);
        setSentences(allSentences);
    }, [])

    useEffect(() => {
        const categorySentences = sentences.filter((sentence) => sentence.iType === selectedInfoType);
        setInfoTypeSentences(categorySentences)
        setSelectedSentenceIndex(0)
    }, [selectedInfoType])

    useEffect(() => {
        if (!selectedSentenceIndex){
            return;
        }
        else if (infoTypeSentences.length === 0){
            setSelectedSentenceIndex(null)
        }
        else if (selectedSentenceIndex >= infoTypeSentences.length){
            setSelectedSentenceIndex(0)
        }
        else if (selectedSentenceIndex < 0){
            setSelectedSentenceIndex(infoTypeSentences.length - 1)
        }
    }, [selectedSentenceIndex, infoTypeSentences])

    useEffect(() => {
        setSelectedInfoType(initInfoType)
    }, [initInfoType])

    useEffect(() => {
        let totalIndex = -1
        comments.forEach((comment) => {
            const commentSentences = infoTypeSentences.filter((sentence) => sentence.commentId === comment.id);
            const sentenceStrings = comment.text.split(sentenceSeparatorRegex);
            const textContainer = comment.tag.querySelector("div.edit-comment-hide > task-lists > table > tbody > tr:nth-child(1) > td > p")
            const newSentences = sentenceStrings.map((sentence, index) => {
                if (commentSentences.some((cSen) => cSen.sentenceNum === index)){
                    totalIndex += 1
                    if (totalIndex === selectedSentenceIndex){
                        const selectedCommentId = infoTypeSentences[totalIndex].commentId;
                        const selectedComment = comments.find((comment) => comment.id === selectedCommentId);
                        selectedComment.tag.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
                        return '<mark style="background-color: #0000CD">' + sentence + '</mark>'
                    }
                    return '<mark style="background-color: #6495ED">' + sentence + '</mark>'
                }
                return sentence
            })
            const newText = newSentences.join("")
            textContainer.innerHTML = newText
        })
    }, [selectedSentenceIndex, infoTypeSentences])

    const onSelectInfoType = (infoType: InformationTypes) => {
        setSelectedInfoType(infoType)
    }

    const cleanUpAndClose = () => {
        console.log(comments)
        comments.forEach((comment) => {
            const textContainer = comment.tag.querySelector("div.edit-comment-hide > task-lists > table > tbody > tr:nth-child(1) > td > p")
            console.log(comment.text);
            textContainer.innerHTML = comment.text
        });
        onClose();
    }
    
    return (
        <div className="Box position-fixed p-2 d-flex flex-column" style={{width: 300, zIndex: 100, right: 8}}>
            <div id="navButtons" className="d-flex flex-row flex-justify-end">
                    <button className="btn-octicon my-2" onClick={() => setSelectedSentenceIndex(selectedSentenceIndex-1)}>&#12296;</button>
                    <button className="btn-octicon my-2" onClick={() => setSelectedSentenceIndex(selectedSentenceIndex+1)}>&#12297;</button>
                    <button className="btn-octicon my-2 ml-2" onClick={cleanUpAndClose}>&#12298;</button>
            </div>
            <div className="d-flex flex-row width-full">
                <div className="mr-4">Showing</div>
                <select className="form-select" value={selectedInfoType} onChange={(e) => onSelectInfoType(e.target.value as InformationTypes)}>
                    <option value="expectedBehaviour">Expected Behaviour</option>
                    <option value="motivation">Motivation</option>
                    <option value="solutionDiscussion">Solution Discussion</option>
                </select>
            </div>
            <div id="navContainer" className="d-flex flex-row width-full">
                <div className="mr-4">Sentence</div>
                <div>{selectedSentenceIndex + 1} of {infoTypeSentences.length}</div>
            </div>
        </div>
      );
}
