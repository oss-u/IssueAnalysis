import React from "react";
import axios from "axios";
import { generateSummary } from "../endpoints";
import "../style.scss";
import { IssueComment, Summary } from "../types";
import { commentParser } from "../utils/comment_parser";
import { Spinner, Truncate } from '@primer/components';
import { IconButton } from '@primer/react';
import { PlusIcon, TriangleRightIcon } from '@primer/octicons-react';

class SummaryComponent extends React.Component<
  { summaries: any; viewExistingSummary; viewing: string; editButtonHandler },
  {}
> {
  render() {
    let summaryContent: Array<JSX.Element> = [];
    this.props.summaries.forEach((s) => {
      const uniqueAuthors = [
        ...new Set(s.comments.map((comment) => comment.author.uname)),
      ];
      if (this.props.viewing && this.props.viewing === s.id) {
        summaryContent.push(
          <div
            className="Box flex-column m-1 p- color-border-info"
            onClick={() => {
              this.props.viewExistingSummary(s.id);
            }}
          >
            <button
              className="btn-octicon float-right"
              type="button"
              aria-label="Pencil icon"
              onClick={this.props.editButtonHandler}
            >
              <svg
                className="octicon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                width="16"
                height="16"
              >
                <path
                  fill-rule="evenodd"
                  d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25a1.75 1.75 0 01.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81l-6.286 6.287a.25.25 0 00-.064.108l-.558 1.953 1.953-.558a.249.249 0 00.108-.064l6.286-6.286z"
                ></path>
              </svg>
            </button>
            <div className="lh-condensed text-normal f6 m-1">
              Autogenerated summary of {s.comments.length} comment(s) by{" "}
              <span className="text-bold f6">{uniqueAuthors.join(", ")}</span>
            </div>
            <div className="markdown-body m-1">
            <div dangerouslySetInnerHTML={{ __html: s.summary }} />
              </div>
          </div>
        );
      } else {
        summaryContent.push(
          <div
            className="Box flex-column m-1 p-1 color-border-info"
            onClick={() => {
              this.props.viewExistingSummary(s.id);
            }}
          >
            <div className="lh-condensed text-normal f6 m-1">
              Autogenerated summary of {s.comments.length} comment(s) by{" "}
              <span className="text-bold f6">{uniqueAuthors.join(", ")}</span>
            </div>
            <div dangerouslySetInnerHTML={{ __html: s.summary }} />
          </div>
        );
      }
    });
    return summaryContent;
  }
}

class NavigationComponent extends React.Component<
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

class SummaryInputComponent extends React.Component<
  {
    existingSummary: string;
    subSummaryObject: Summary;
    backButtonHandler;
    submitHandler;
  },
  {}
> {
  render() {
    let comments = [];
    this.props.subSummaryObject.comments.forEach((e) => {
      let dateFormatting = e.author.createdOn.split(",").slice(0, 2).join(", ");
      comments.push(
        <div className="d-flex flex-row mb-1">
          <div className="Box width-full">
            <div className="Box-row Box-row--gray p-1">
              <div className="clearfix">
                <div className="col-1 float-left">
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
              <p className="markdown-body text-normal">
                <Truncate title="CommentText" expandable maxWidth={250}>
                  <div dangerouslySetInnerHTML={{ __html: e.text }} />
                </Truncate>
              </p>
            </div>
          </div>
        </div>
      );
    });

    // This cannot be set as HTML because it is a text area
    return (
      <div className="Box flex-column m-1 p-1 color-border-success-emphasis">
        <h5>Edit Summary</h5>
        <form onSubmit={this.props.submitHandler}>
          {comments}
          <textarea
            className="form-control input-block textarea-vertical-resize-only"
            aria-label="summary-input"
            name="summary-textarea"
          >
            {this.props.existingSummary}
          </textarea>
          <div className="clearfix flex-row">
            <button
              className="btn btn-sm btn-primary m-1 float-right"
              type="submit"
            >
              Done
            </button>
            <button
              className="btn btn-sm m-1 float-right"
              type="button"
              onClick={() => {
                this.props.backButtonHandler("comments");
              }}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    );
  }
}

class CommentComponent extends React.Component<
  { comments: Array<IssueComment>; actionHandler; resetSession },
  {}
> {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
    };
  }

  render() {
    let comments = [];
    let generateButtonState = this.props.comments.length ? false : true;
    this.props.comments.forEach((e) => {
      let dateFormatting = e.author.createdOn.split(",").slice(0, 2).join(", ");
      comments.push(
        <div className="d-flex flex-row mb-1">
          <div className="Box width-full">
            <div className="Box-row Box-row--gray p-1">
              <div className="clearfix">
                <div className="col-1 float-left">
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
            <div className="Box-row p-1 Truncate">
            <Truncate title="CommentText"  maxWidth={250}>
                  {/* {e.text} */}
                  <div dangerouslySetInnerHTML={{ __html: e.text }} />
                </Truncate>
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
              this.props.resetSession();
              this.props.actionHandler("summary");
            }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }
}

class SubSummaryComponent extends React.Component<
  {resizePanel},
  {
    subsummaries: Array<Summary>;
    editing: string;
    visible: string;
    viewing: string;
    genSumm: string;
  }
> {
  addedComments: Array<string>;
  constructor(props) {
    super(props);
    this.addedComments = [];
    this.state = {
      subsummaries: [],
      editing: "",
      visible: "summary",
      viewing: "",
      genSumm: "",
    };
    this.loadCommentComponents = this.loadCommentComponents.bind(this);
    this.saveSummary == this.saveSummary.bind(this);
  }

  addBorderHighlights = () => {
    const commentTags = document.querySelectorAll(
      "div.timeline-comment.unminimized-comment"
    );
    commentTags.forEach((tag) => {
      if (
        this.addedComments.includes(tag.querySelector("a.js-timestamp")["href"])
      ) {
        if (!tag.classList.contains("color-border-success-emphasis")) {
          const tagHeader = tag.querySelector(".timeline-comment-header");
          tagHeader.setAttribute("style", "background:#6cc644");
          tag.classList.add("color-border-success-emphasis");
        }
      }
    });
  };

  // BUG BUG BUG
  // Create 2 different summaries -> Edit a summary -> Go 'Back' -> Summary gets deleted
  //

  showSpecificHighlights = (c: Array<IssueComment>) => {
    this.removeBorderHighlights();
    const commentTags = document.querySelectorAll(
      "div.timeline-comment.unminimized-comment"
    );
    let commentList = c.map((e) => e.id);
    commentTags.forEach((tag) => {
      if (commentList.includes(tag.querySelector("a.js-timestamp")["href"])) {
        if (!tag.classList.contains("color-border-success-emphasis")) {
          const tagHeader = tag.querySelector(".timeline-comment-header");
          tagHeader.setAttribute("style", "background:#6cc644");
          tag.classList.add("color-border-success-emphasis");
        }
      }
    });
  };

  addCommentsOnClick = (tag: Element) => {
    let newComment = commentParser(tag);
    if (!this.addedComments.includes(newComment.id)) {
      if (this.state.editing) {
        let modifiedSummary = this.state.subsummaries.findIndex(
          (e) => e.id === this.state.editing
        );
        let items = [...this.state.subsummaries];
        let item = { ...items[modifiedSummary] };
        if (!item.comments.some((e) => e.id === newComment.id)) {
          item.comments = item.comments.concat(newComment);
          items[modifiedSummary] = item;
        } else {
          item.comments.splice(
            item.comments.findIndex((e) => e.id === newComment.id),
            1
          );
          if (tag.classList.contains("color-border-success-emphasis")) {
            const tagHeader = tag.querySelector(".timeline-comment-header");
            tagHeader.removeAttribute("style");
            tag.classList.remove("color-border-success-emphasis");
          }
        }
        this.setState({
          subsummaries: items,
          visible: "comments",
        });
      } else {
        let newSummary = new Summary("", newComment);
        let tempSubsummary = this.state.subsummaries;
        tempSubsummary.push(newSummary);
        this.setState({
          subsummaries: tempSubsummary,
          editing: newSummary.id,
          visible: "comments",
        });
      }
      const tagHeader = tag.querySelector(".timeline-comment-header");
      tagHeader.setAttribute("style", "background:#6cc644");
      tag.classList.add("color-border-success-emphasis");
    } else {
      if (this.state.editing) {
        let modifiedSummary = this.state.subsummaries.findIndex(
          (e) => e.id === this.state.editing
        );
        let items = [...this.state.subsummaries];
        let item = { ...items[modifiedSummary] };
        if (item.comments.some((e) => e.id === newComment.id)) {
          item.comments.splice(
            item.comments.findIndex((e) => e.id === newComment.id),
            1
          );
          this.addedComments.splice(
            this.addedComments.findIndex((e) => e === newComment.id),
            1
          );
          if (tag.classList.contains("color-border-success-emphasis")) {
            const tagHeader = tag.querySelector(".timeline-comment-header");
            tagHeader.removeAttribute("style");
            tag.classList.remove("color-border-success-emphasis");
          }
        }
        this.setState({
          subsummaries: items,
          visible: "comments",
        });
      }
    }
  };

  addCommentsToSummary = () => {
    const commentTags = document.querySelectorAll(
      "div.timeline-comment.unminimized-comment"
    );
    commentTags.forEach((tag) => {
      if (tag.getAttribute("listener") !== "true") {
        tag.addEventListener("click", () => {
          this.addCommentsOnClick(tag);
        });
        tag.setAttribute("listener", "true");
      }
    });
  };

  concatCommentsOfSubsummary = () => {
    // get the subsummary from the editing state
    let modifiedSummary = this.state.subsummaries.findIndex(
      (e) => e.id === this.state.editing
    );
    let items = [...this.state.subsummaries];
    let item = { ...items[modifiedSummary] };
    let concatComments = "";
    // merge all the summaries in concatComments
    for (let i = 0; i < item.comments.length; i++) {
      concatComments = concatComments.concat(item.comments[i].text, ' ');
    }
    concatComments = concatComments.trim();
    return concatComments;
  };

  exitNavBar = () => {
    this.setState({
      viewing: "",
    });
  };

  editExistingSummary = () => {
    this.resetBorderHighlights();
    this.setState({
      editing: this.state.viewing,
      viewing: "",
      visible: "input",
    });
  };

  viewExistingSummary = (id: string) => {
    this.setState({
      viewing: id,
    });
    let currentSummary = this.state.subsummaries.findIndex((e) => e.id === id);
    let items = [...this.state.subsummaries];
    let item = { ...items[currentSummary] };
    this.showSpecificHighlights(item.comments);
  };

  loadCommentComponents = () => {
    let t = [];
    this.state.subsummaries.forEach((value, index) => {
      if (value.id === this.state.editing) {
        t.push(
          <CommentComponent
            key={index}
            comments={value.comments}
            actionHandler={this.toggleSummaryBoxComponent}
            resetSession={this.resetSession}
          />
        );
      }
    });
    return t;
  };

  loadSummaryComponent = () => {
    if (this.state.subsummaries.length) {
      const summaries = [...this.state.subsummaries];
      if (summaries.length > 0) {
        return (
          <SummaryComponent
            summaries={summaries}
            viewExistingSummary={this.viewExistingSummary}
            viewing={this.state.viewing}
            editButtonHandler={this.editExistingSummary}
          />
        );
      }
    }
    return (
      <div className="blankslate">
        <p>Click on the '+' icon to add comments and create a summary.</p>
      </div>
    );
  };

  loadSummaryInputComponent = () => {
    let concatenatedComments = this.concatCommentsOfSubsummary();
    console.log("loadSummary")
    if (!this.state.genSumm) {
      console.log("no gensumm");
      generateSummary(concatenatedComments).then((summaryRes) => this.setState({
        genSumm: summaryRes.summary
      }));
    }

    let editingSubsummary;
    this.state.subsummaries.forEach((value, index) => {
      if (value.id === this.state.editing) {
        editingSubsummary = value;
      }
    });
    if (this.state.genSumm) {
      // Also check if the number of elements have changed
      return (
        <SummaryInputComponent
          existingSummary={this.state.genSumm}
          subSummaryObject={editingSubsummary}
          backButtonHandler={this.toggleSummaryBoxComponent}
          submitHandler={this.saveSummary}
        />
      );
    } else {
      return (
        <span className="Label m-3">
          <span>Loading</span>
          <span className="AnimatedEllipsis"></span>
        </span>
      );
    }
  };

  loadViewBasedOnState = () => {
    if (this.state.visible === "summary") {
      return this.loadSummaryComponent();
    } else if (this.state.visible === "input") {
      return this.loadSummaryInputComponent();
    } else if (this.state.visible === "comments") {
      return this.loadCommentComponents();
    }
  };

  removeBorderHighlights = () => {
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
  };

  resetBorderHighlights = () => {
    this.removeBorderHighlights();
    this.addBorderHighlights();
  };

  resetSession = () => {
    let modifiedSummary = this.state.subsummaries.findIndex(
      (e) => e.id === this.state.editing
    );
    this.state.subsummaries.splice(modifiedSummary, 1);
    let oldState = this.state.subsummaries;
    this.setState({
      subsummaries: oldState,
      editing: "",
    });

    // this.resetBorderHighlights();
  };

  saveSummary = (summary: HTMLFormElement) => {
    summary.preventDefault();
    // make an API call and submit the form
    // response is summary

    let storedSummary = this.state.genSumm; // API response

    let modifiedSummary = this.state.subsummaries.findIndex(
      (e) => e.id === this.state.editing
    );
    let items = [...this.state.subsummaries];
    let item = { ...items[modifiedSummary] };

    item.summary = storedSummary;
    items[modifiedSummary] = item;

    item.comments.forEach((c) => {
      this.addedComments.push(c.id);
    });

    this.setState({
      subsummaries: items,
      visible: "summary",
      editing: "",
      genSumm: "",
    });
    this.resetBorderHighlights();
  };

  toggleSummaryBoxComponent = (visiblePanel: string) => {
    this.setState({
      visible: visiblePanel,
    });
  };

  render() {
    let navbarContent;
    if (
      (this.state.editing || this.state.viewing) &&
      this.state.visible === "summary"
    ) {
      this.state.subsummaries.forEach((ss) => {
        if (ss.id === this.state.viewing) {
          navbarContent = ss.comments;
        }
      });
    }
    return (
      <div id="sub-summary" className="Box sub-scroll" >
        <div className="Box-header">
          <div className="clearfix">
            <div className="float-left">
              <h2 className="Box-title p-1">User Summaries</h2>
            </div>
            <div className="float-right">
              <div className="float-right d-inline-flex">
              <IconButton aria-label="add" 
                size="medium" icon={PlusIcon} 
                className="btn btn-sm btn-primary m-0 ml-2 ml-md-2"
                onClick={this.addCommentsToSummary}/>
                <IconButton aria-label="add" 
                size="medium" icon={TriangleRightIcon} 
                className="btn btn-sm btn-primary m-0 ml-2 ml-md-2"
                onClick={() => {this.props.resizePanel(1)}}/>
              </div>
            </div>
          </div>
        </div>
        <div id="summary-component">{this.loadViewBasedOnState()}</div>
        <NavigationComponent navbarContent={navbarContent} commentParser={commentParser} doneHandler={this.exitNavBar} />
      </div>
    );
  }
}

export default SubSummaryComponent;
