import React from "react";
import { IssueComment } from "../../types";
import { commentParser } from "../../utils/comment_parser";

export default class CommentComponent extends React.Component<
  { 
    comments: Array<IssueComment>; 
    actionHandler; 
    addCommentsToSummary; 
  },
  {}
> {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
    };
  }

  scrollToComment = (commentId) => {
    const commentTags = document.querySelectorAll(
      "div.timeline-comment.unminimized-comment"
    );
    commentTags.forEach((tag) => {
      if (
        commentParser(tag).id === commentId
      ) {
        const commentHeader = tag.querySelector("div.timeline-comment-header");
        if (commentHeader !== null)
        {
          commentHeader
          .scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        } else {
          tag
          .closest("div.TimelineItem")
          .scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
        }
      }
    });
  };

  render() {
    let comments = [];
    let generateButtonState = this.props.comments.length ? false : true;
    this.props.comments.forEach((e) => {
      let dateFormatting = e.author.createdOn.split(",").slice(0, 2).join(", ");
      comments.push(
        <div className="d-flex flex-row mb-1" onClick={() => {this.scrollToComment(e.id)}}>
          <div className="Box width-full">
            <div className="Box-row Box-row--gray p-1">
              <div className="clearfix">
                <div className="float-left">
                  <img
                    className="avatar"
                    height="20"
                    width="20"
                    alt={e.author.uname}
                    src={e.author.profile}
                  />
                </div>
                <div className="col-10 float-left pl-2">
                  <h6>commented on {dateFormatting}</h6>
                </div>
              </div>
            </div>
            <div className="Box-row p-1">
              <div className="pl-3" dangerouslySetInnerHTML={{ __html: e.text }} />
            </div>
          </div>
        </div>
      );
    });
    return (
      <div className="Box flex-column m-1 ml-1 p-1 color-border-success-emphasis">
        <h5>Comments to Summarise</h5>
        {comments}
        <div className="container-lg clearfix">
          <button
            className="btn btn-sm btn-primary float-right m-1"
            onClick={() => {
              this.props.actionHandler("input");
            }}
            disabled={generateButtonState}
          >
            Generate
          </button>
          <button
            className="btn btn-sm m-1 float-right"
            type="button"
            onClick={() => {
              this.props.addCommentsToSummary();
              // this.props.actionHandler("summary");
            }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }
}