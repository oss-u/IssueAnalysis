import React from "react";
import axios from 'axios';
import "../style.scss";

function guidGenerator() {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (
    S4() +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  );
}

class Author {
  uname: string;
  createdOn: string;
  profile: string;

  constructor(u: string, c: string, p: string) {
    this.uname = u;
    this.createdOn = c;
    this.profile = p;
  }
}

class IssueComment {
  body: string;
  id: string;
  author: Author;
  bodyText: string;

  constructor(id: string, b: string, bt: string, a: Author) {
    this.id = id;
    this.body = b;
    this.author = a;
    this.bodyText = bt;
  }
}

class Summary {
  id: string;
  summary: string;
  comments: Array<IssueComment>;

  constructor(summary, comments) {
    this.id = guidGenerator();
    this.summary = summary;
    this.comments = [comments];
  }
}

class SummaryComponent extends React.Component<
  { summaries: any, viewExistingSummary, viewing: string, editButtonHandler },
  {}
> {
  render() {
    let summaryContent: Array<JSX.Element> = [];
    this.props.summaries.forEach((s) => {
      if (this.props.viewing && this.props.viewing === s.id) {
        summaryContent.push(
          <div className="Box flex-column m-1 p- color-border-info"
            onClick={() => { this.props.viewExistingSummary(s.id); }}>
            <button className="btn-octicon float-right" type="button"
              aria-label="Pencil icon" onClick={this.props.editButtonHandler}>
              <svg className="octicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25a1.75 1.75 0 01.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81l-6.286 6.287a.25.25 0 00-.064.108l-.558 1.953 1.953-.558a.249.249 0 00.108-.064l6.286-6.286z"></path></svg>
            </button>
            <div className="m-1">{s.summary}</div>
          </div>
        )
      } else {
        summaryContent.push(
          <div className="Box flex-column m-1 p-1 color-border-info"
            onClick={() => { this.props.viewExistingSummary(s.id); }}>
            {s.summary}
          </div>
        )
      }
    });
    return summaryContent;
  }
}

class NavigationComponent extends React.Component<
  { navbarContent: Array<IssueComment>, commentParser, doneHandler },
  { currIndex: number }> {
  constructor(props) {
    super(props);
    this.state = {
      currIndex: 0
    };
  }

  scrollToComment = () => {
    const commentTags = document.querySelectorAll(
      "div.timeline-comment.unminimized-comment"
    );
    commentTags.forEach((tag) => {
      if (this.props.commentParser(tag).id === this.props.navbarContent[this.state.currIndex].id) {
        tag.closest("div.TimelineItem").scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }
    });
  }

  render() {
    if (!this.props.navbarContent) {
      return (<></>);
    }

    const commentTags = document.querySelectorAll(
      "div.timeline-comment.unminimized-comment"
    );
    this.props.navbarContent.forEach(c => {
      commentTags.forEach((tag) => {
        if (this.props.commentParser(tag).id === c.id) {
          tag.classList.add("color-border-success-emphasis");
        }
      });
    });
    this.scrollToComment();
    return (<div id="navigation-component">
      <div className="clearfix">
        <div className="float-left">
          <div className="my-2 ml-2">
            {this.state.currIndex + 1} of {this.props.navbarContent.length} comments
          </div>
        </div>
        <div className="float-right">
          <div className="float-right my-1 mr-1">
            <button className="btn btn-primary btn-sm" onClick={() => { this.props.doneHandler(); }}>
              Done
            </button>
          </div>
          <div className="float-right">
            <button className="btn-octicon my-2"
              onClick={() => {
                if (this.state.currIndex - 1 >= 0) {
                  this.setState({
                    currIndex: this.state.currIndex - 1
                  });
                  this.scrollToComment();
                }
              }}>
              &#12296;
            </button>
            <button className="btn-octicon my-2"
              onClick={() => {
                if (this.state.currIndex + 1 < this.props.navbarContent.length) {
                  this.setState({
                    currIndex: this.state.currIndex + 1
                  });
                  this.scrollToComment();
                }
              }}>
              &#12297;
            </button>
          </div>
        </div>
      </div>
    </div>);
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
        <div className="d-flex flex-row m-1">
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
            <div className="Box-row p-1 ">
              <p className="markdown-body">{e.bodyText.slice(0, 50)}...</p>
            </div>
          </div>
        </div>
      );
    });

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
        <div className="d-flex flex-row m-1">
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
            <div className="Box-row p-1 ">
              <p className="markdown-body">{e.bodyText.slice(0, 50)}...</p>
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
            Generate Summary
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
  {},
  { subsummaries: Array<Summary>; editing: string; visible: string; viewing: string; genSumm: string }
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
      genSumm: ""
    };
    this.loadCommentComponents = this.loadCommentComponents.bind(this);
    this.saveSummary == this.saveSummary.bind(this);
  }

  addBorderHighlights = () => {
    const commentTags = document.querySelectorAll(
      "div.timeline-comment.unminimized-comment"
    );
    commentTags.forEach((tag) => {
      if (this.addedComments.includes(tag.querySelector("a.js-timestamp")["href"])) {
        if (!tag.classList.contains("color-border-success-emphasis")) {
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
    let commentList = c.map(e => e.id);
    commentTags.forEach((tag) => {
      if (commentList.includes(tag.querySelector("a.js-timestamp")["href"])) {
        if (!tag.classList.contains("color-border-success-emphasis")) {
          tag.classList.add("color-border-success-emphasis");
        }
      }
    });
  }

  addCommentsOnClick = (tag: Element) => {
    let newComment = this.commentParser(tag);
    if (!this.addedComments.includes(newComment.id)) {
      if (this.state.editing) {
        let modifiedSummary = this.state.subsummaries.findIndex(
          (e) => e.id === this.state.editing
        );
        let items = [...this.state.subsummaries];
        let item = { ...items[modifiedSummary] };
        if (!item.comments.some(e => e.id === newComment.id)) {
          item.comments = item.comments.concat(newComment);
          items[modifiedSummary] = item;
        } else {
          item.comments.splice(item.comments.findIndex(e => e.id === newComment.id), 1)
          if (tag.classList.contains("color-border-success-emphasis")) {
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
      tag.classList.add("color-border-success-emphasis");
    } else {
      if (this.state.editing) {
        let modifiedSummary = this.state.subsummaries.findIndex(
          (e) => e.id === this.state.editing
        );
        let items = [...this.state.subsummaries];
        let item = { ...items[modifiedSummary] };
        if (item.comments.some(e => e.id === newComment.id)) {
          item.comments.splice(item.comments.findIndex(e => e.id === newComment.id), 1)
          this.addedComments.splice(this.addedComments.findIndex(e => e === newComment.id), 1);
          if (tag.classList.contains("color-border-success-emphasis")) {
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
    let concatComments = '';
    // merge all the summaries in concatComments
    for (let i = 0; i < item.comments.length; i++) {
      concatComments = concatComments.concat(item.comments[i].bodyText, ' ');
    }
    concatComments = concatComments.trim();
    return concatComments;
  }

  commentParser = (comment: Element) => {
    const a_profile: string = comment.querySelector("img.avatar")["src"];
    const a_uname: string = comment.querySelector("a.author").textContent;
    const a_createdOn: string = comment.querySelector(
      "a.js-timestamp relative-time"
    )["title"];
    const c_body = Array.from(comment.querySelectorAll("td.comment-body p"))
      .map((elem) => elem.innerHTML)
      .join(" ");
    const c_bodytext = Array.from(comment.querySelectorAll("td.comment-body p"))
      .map((elem) => elem.innerHTML)
      .join(" ");
    const c_id = comment.querySelector("a.js-timestamp")["href"];
    const author = new Author(a_uname, a_createdOn, a_profile);
    return new IssueComment(c_id, c_body, c_bodytext, author);
  };

  exitNavBar = () => {
    this.setState({
      viewing: ""
    })
  }

  editExistingSummary = () => {
    this.resetBorderHighlights();
    this.setState({
      editing: this.state.viewing,
      viewing: "",
      visible: "comments"
    });
  }

  viewExistingSummary = (id: string) => {
    this.setState({
      viewing: id
    });
    let currentSummary = this.state.subsummaries.findIndex(
      (e) => e.id === id
    );
    let items = [...this.state.subsummaries];
    let item = { ...items[currentSummary] };
    this.showSpecificHighlights(item.comments);
  }

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
      let allSummaries = [];
      this.state.subsummaries.forEach((s) => {
        if (s.summary) {
          allSummaries.push({ summary: s.summary, id: s.id });
        }
      });
      if (allSummaries.length) {
        return <SummaryComponent summaries={allSummaries}
          viewExistingSummary={this.viewExistingSummary}
          viewing={this.state.viewing}
          editButtonHandler={this.editExistingSummary}
        />;
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

    if (!this.state.genSumm) {
      fetch('https://issue-analysis-backend.herokuapp.com/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: concatenatedComments
        })
      }).then((resp) => resp.json()).then((data) => {
        this.setState({
          genSumm: data['summary']
        });
      });
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
        <span className="Label mt-3">
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
        tag.classList.remove("color-border-success-emphasis");
      }
    });
  };

  resetBorderHighlights = () => {
    this.removeBorderHighlights();
    this.addBorderHighlights();
  }

  resetSession = () => {
    let modifiedSummary = this.state.subsummaries.findIndex(
      (e) => e.id === this.state.editing
    );
    this.state.subsummaries.splice(modifiedSummary, 1);
    let oldState = this.state.subsummaries;
    this.setState({
      subsummaries: oldState,
      editing: '',

    });


    // this.resetBorderHighlights();
  }

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

    item.comments.forEach(c => {
      this.addedComments.push(c.id);
    });

    this.setState({
      subsummaries: items,
      visible: "summary",
      editing: "",
      genSumm: ""
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
    if ((this.state.editing || this.state.viewing) && (this.state.visible === "summary")) {
      this.state.subsummaries.forEach(ss => {
        if (ss.id === this.state.viewing) {
          navbarContent = ss.comments;
        }
      })
    }
    return (
      <div id="sub-summary" className="Box">
        <div className="Box-header">
          <div className="clearfix">
            <div className="float-left">
              <h2 className="Box-title p-1">User Summaries</h2>
            </div>
            <div className="float-right">
              <div className="float-right d-inline-flex">
                <button
                  className="btn btn-sm btn-primary m-0 ml-2 ml-md-2"
                  onClick={this.addCommentsToSummary}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
        <div id="summary-component">{this.loadViewBasedOnState()}</div>
        <NavigationComponent navbarContent={navbarContent} commentParser={this.commentParser} doneHandler={this.exitNavBar} />
      </div>
    );
  }
}

export default SubSummaryComponent;
