import React from "react";
import { IssueComment } from "../../types";

export default class NavigationComponent extends React.Component<
  { navbarContent: Array<IssueComment>; commentParser; doneHandler },
  { currIndex: number }
> {
  constructor(props) {
    super(props);
    this.state = {
      currIndex: 0,
    };
  }

  scrollToComment = () => {
    const commentTags = document.querySelectorAll(
      "div.timeline-comment.unminimized-comment"
    );
    commentTags.forEach((tag) => {
      if (
        this.props.commentParser(tag).id ===
        this.props.navbarContent[this.state.currIndex].id
      ) {
        tag
          .closest("div.TimelineItem")
          .scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
      }
    });
  };

  render() {
    if (!this.props.navbarContent) {
      return <></>;
    }

    const commentTags = document.querySelectorAll(
      "div.timeline-comment.unminimized-comment"
    );
    this.props.navbarContent.forEach((c) => {
      commentTags.forEach((tag) => {
        if (this.props.commentParser(tag).id === c.id) {
          const tagHeader = tag.querySelector(".timeline-comment-header");
          tagHeader.setAttribute("style", "background:#6cc644");
          tag.classList.add("color-border-success-emphasis");
        }
      });
    });
    this.scrollToComment();
    return (
      <div id="navigation-component">
        <div className="clearfix">
          <div className="float-left">
            <div className="my-2 ml-2">
              {this.state.currIndex + 1} of {this.props.navbarContent.length}{" "}
              comments
            </div>
          </div>
          <div className="float-right">
            <div className="float-right my-1 mr-1">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  this.props.doneHandler();
                }}
              >
                Done
              </button>
            </div>
            <div className="float-right">
              <button
                className="btn-octicon my-2"
                onClick={() => {
                  if (this.state.currIndex - 1 >= 0) {
                    this.setState({
                      currIndex: this.state.currIndex - 1,
                    });
                    this.scrollToComment();
                  }
                }}
              >
                &#12296;
              </button>
              <button
                className="btn-octicon my-2"
                onClick={() => {
                  if (
                    this.state.currIndex + 1 <
                    this.props.navbarContent.length
                  ) {
                    this.setState({
                      currIndex: this.state.currIndex + 1,
                    });
                    this.scrollToComment();
                  }
                }}
              >
                &#12297;
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
