import React from "react";
import { IssueComment } from "../../types";
import { commentParser } from "../../utils/comment_parser";
import { ChevronRightIcon, ChevronLeftIcon } from '@primer/octicons-react';
import { IconButton } from '@primer/react';

export default class NavigationComponent extends React.Component<
  { navbarContent: Array<IssueComment> },
  { currIndex: number }
> {
  constructor(props) {
    super(props);
    this.props.navbarContent.sort((a: IssueComment, b: IssueComment) => {
      let aDate = parseInt(a.id.split('/').at(-1).split('-').at(-1));
      let bDate = parseInt(b.id.split('/').at(-1).split('-').at(-1));
      if (aDate > bDate)
        return 1;
      else if (bDate > aDate)
        return -1;
      else
        return 0;
    });
    this.state = {
      currIndex: 0,
    };
  }

  scrollToComment = () => {

    if (this.props.navbarContent[this.state.currIndex] !== undefined) {
      const commentTags = document.querySelectorAll(
        "div.timeline-comment.unminimized-comment"
      );
      commentTags.forEach((tag) => {
        if (
          commentParser(tag).id ===
          this.props.navbarContent[this.state.currIndex].id
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
    }
  };

  render() {
    if (!this.props.navbarContent) {
      return <></>;
    }


    const commentTags = document.querySelectorAll(
      "div.timeline-comment.unminimized-comment"
    );
    
    commentTags.forEach((tag) => {
      if (tag.classList.contains("color-border-success-emphasis")) {
        const tagHeader = tag.querySelector(".timeline-comment-header");    
        tagHeader.removeAttribute("style");
        tag.classList.remove("color-border-success-emphasis");
      }
    });

    this.props.navbarContent.forEach((c) => {
      commentTags.forEach((tag) => {
        if (commentParser(tag).id === c.id) {
          const tagHeader = tag.querySelector(".timeline-comment-header");
          tagHeader.setAttribute("style", "background:#ABF2BC");
          tag.classList.add("color-border-success-emphasis");
        }
      });
    });
    this.scrollToComment();
    return (
        <div className="Box-footer Box-row--gray lh-condensed text-normal f6 m-1 p-0">
        <div className="clearfix">
          <div className="float-right">
            <div className="float-right">
              <IconButton variant="invisible"
              size="small"
              className="btn btn-sm float-right my-1"
              aria-label="navigate-comment-right"
              icon={ChevronRightIcon}
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
              }} />
              <IconButton variant="invisible"
              size="small"
              className="btn btn-sm float-right my-1 ml-2"
              aria-label="navigate-comment-left"
              icon={ChevronLeftIcon}
              onClick={() => {
                if (this.state.currIndex - 1 >= 0) {
                  this.setState({
                    currIndex: this.state.currIndex - 1,
                  });
                  this.scrollToComment();
                }
              }} />
            </div>
          </div>
          <div className="float-right">
            <div className="my-2 ml-2">
              {this.state.currIndex + 1} of {this.props.navbarContent.length}{" "}
              comments
            </div>
          </div>
          </div>
        </div>
    );
  }
}
