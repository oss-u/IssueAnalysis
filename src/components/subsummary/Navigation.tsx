import React from "react";
import { IssueComment } from "../../types";
import { commentParser } from "../../utils/comment_parser";
import { ChevronRightIcon, ChevronLeftIcon } from '@primer/octicons-react';
import { IconButton, Box } from '@primer/react';

export default class NavigationComponent extends React.Component<
  { navbarContent: Array<IssueComment> },
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
        commentParser(tag).id ===
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
        if (commentParser(tag).id === c.id) {
          const tagHeader = tag.querySelector(".timeline-comment-header");
          tagHeader.setAttribute("style", "background:#6cc644");
          tag.classList.add("color-border-success-emphasis");
        }
      });
    });
    this.scrollToComment();
    return (
      // <div id="navigation-component">
        <Box id="navigation-component" 
              borderColor="border.default" 
              borderTopWidth={1} 
              borderTopStyle="solid" mt={3}>
          
        <div className="clearfix">
          <div className="float-right">
            <div className="float-right my-1 mr-1">
            </div>
            <div className="float-right">
              <IconButton variant="invisible"
              size="small"
              className="btn btn-sm float-right my-1 ml-2"
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
              aria-label="navigate-comment-right"
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
        </Box>
    );
  }
}
