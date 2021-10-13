import React from "react";
import "./style.scss";

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
  { summaries: Array<string> },
  {}
> {
  render() {
    let summaryContent: Array<Element> = [];
    this.props.summaries.forEach((s) =>
      summaryContent.push(
        <div className="Box flex-column m-1 p-1 color-border-info">
          {this.props.summaries}
        </div>
      )
    );
    return summaryContent;
  }
}

class SummaryInputComponent extends React.Component<
  { existingSummary: string; backButtonHandler; submitHandler },
  {}
> {
  render() {
    return (
      <div className="Box flex-column m-1 p-1 color-border-success">
        <h5>Edit Summary</h5>
        <form onSubmit={this.props.submitHandler}>
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
  { comments: Array<IssueComment>; handler; backButtonHandler },
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
      <div className="Box flex-column m-1 p-1 color-border-success">
        <h5>Comments to Summarise</h5>
        {comments}
        <div className="container-lg clearfix">
          <button
            className="btn btn-sm btn-primary float-right m-1"
            onClick={() => {
              this.props.handler("input");
            }}
          >
            Generate Summary
          </button>
          <button
            className="btn btn-sm m-1 float-right"
            type="button"
            onClick={() => {
              this.props.backButtonHandler("summary");
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
  { subsummaries: Array<Summary>; editing: string; visible: string }
> {
  addedComments: Array<string>;
  constructor(props) {
    super(props);
    this.addedComments = [];
    this.state = {
      subsummaries: [],
      editing: "",
      visible: "summary",
    };
    this.loadCommentComponents = this.loadCommentComponents.bind(this);
    this.saveSummary == this.saveSummary.bind(this);
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

  removeBorderHighlights = () => {
    const commentTags = document.querySelectorAll(
      "div.timeline-comment.unminimized-comment"
    );
    commentTags.forEach((tag) => {
      tag.classList.remove("color-border-success");
    });
  };

  addBorderHighlights = () => {
    const commentTags = document.querySelectorAll(
      "div.timeline-comment.unminimized-comment"
    );
    commentTags.forEach((tag) => {
      if (
        this.addedComments.includes(tag.querySelector("a.js-timestamp")["href"])
      ) {
        tag.classList.add("color-border-success");
      }
    });
  };

  addCommentsOnClick = (tag: Element) => {
    tag.classList.add("color-border-success");
    let newComment = this.commentParser(tag);
    if (!this.addedComments.includes(newComment.id)) {
      if (this.state.editing) {
        let modifiedSummary = this.state.subsummaries.findIndex(
          (e) => e.id === this.state.editing
        );
        let items = [...this.state.subsummaries];
        let item = { ...items[modifiedSummary] };
        this.addedComments.push(newComment.id);
        item.comments = item.comments.concat(newComment);
        items[modifiedSummary] = item;
        this.setState({
          subsummaries: items,
          visible: "comments",
        });
      } else {
        let newSummary = new Summary("", newComment);
        this.addedComments.push(newComment.id);
        this.setState({
          subsummaries: new Array(newSummary),
          editing: newSummary.id,
          visible: "comments",
        });
      }
    }
  };

  addCommentsToSummary = () => {
    const commentTags = document.querySelectorAll(
      "div.timeline-comment.unminimized-comment"
    );
    this.addBorderHighlights();
    commentTags.forEach((tag) => {
      if (tag.getAttribute("listener") !== "true") {
        tag.addEventListener("click", () => {
          this.addCommentsOnClick(tag);
        });
        tag.setAttribute("listener", "true");
      }
    });
  };

  toggleSummaryBoxComponent = (visiblePanel: string) => {
    this.setState({
      visible: visiblePanel,
    });
  };

  loadCommentComponents = () => {
    let t = [];
    this.state.subsummaries.forEach((value, index) => {
      t.push(
        <CommentComponent
          key={index}
          comments={value.comments}
          handler={this.toggleSummaryBoxComponent}
          backButtonHandler={this.toggleSummaryBoxComponent}
        />
      );
    });
    return t;
  };

  saveSummary = (summary: HTMLFormElement) => {
    summary.preventDefault();
    // make an API call and submit the form
    // response is summary
    let storedSummary = "Sent to backend, summary stored"; // API response
    let modifiedSummary = this.state.subsummaries.findIndex(
      (e) => e.id === this.state.editing
    );
    let items = [...this.state.subsummaries];
    let item = { ...items[modifiedSummary] };
    item.summary = storedSummary;
    items[modifiedSummary] = item;
    this.setState({
      subsummaries: items,
      visible: "summary",
      editing: "",
    });
    this.removeBorderHighlights();

    // const commentTags = document.querySelectorAll(
    //   "div.timeline-comment.unminimized-comment"
    // );
    // commentTags.forEach(tag => {
    //   if (tag.getAttribute('listener') === 'true') {
    //     // tag.removeEventListener("click", this.addCommentsOnClick);
    //     tag.setAttribute('listener', 'false');
    //   }
    // });
  };

  loadSummaryInputComponent = () => {
    let autogeneratedSummary = "Autogenerated summary from the API";
    return (
      <SummaryInputComponent
        existingSummary={autogeneratedSummary}
        backButtonHandler={this.toggleSummaryBoxComponent}
        submitHandler={this.saveSummary}
      />
    );
  };

  loadSummaryComponent = () => {
    console.log(this.state.subsummaries.length);
    if (this.state.subsummaries.length) {
      let allSummaries = [];
      this.state.subsummaries.forEach((s) => {
        allSummaries.push(s.summary);
      });
      return <SummaryComponent summaries={allSummaries} />;
    } else {
      return (
        <div className="blankslate">
          <p>Click on the comments to create a summary.</p>
        </div>
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

  render() {
    return (
      <div id="topLevelSummary" className="Box">
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
      </div>
    );
  }
}

export default SubSummaryComponent;
