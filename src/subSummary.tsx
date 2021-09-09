import React from "react";
import ReactDOM from "react-dom";
import "./style.scss";
import { StyledOcticon } from "@primer/components";
import { PlusIcon } from "@primer/octicons-react";

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
  selected: boolean;

  constructor(id: string, b: string, bt: string, a: Author) {
    this.id = id;
    this.body = b;
    this.author = a;
    this.bodyText = bt;
    this.selected = false;
  }

  get shortBody(): string {
    const n = 100;
    return this.bodyText.length > n
      ? this.bodyText.substr(0, n - 1) + "&hellip;"
      : this.bodyText;
  }
}

class PlusButton extends React.Component<{ key; handler }, {}> {
  render() {
    return (
      <button
        className="btn btn-sm btn-primary m-0 ml-2 ml-md-2 plus-button"
        onClick={() => {
          console.log(this.props.key);
          this.props.handler(this.props.key);
        }}
      >
        +
      </button>
    );
  }
}

class SubSummaryComponent extends React.Component<
  {},
  { selectedComments: Array<IssueComment>; summaries: Array<Element> }
> {
  constructor(props) {
    super(props);
    this.state = {
      selectedComments: [],
      summaries: [],
    };
    this.handleSelectEvent = this.handleSelectEvent.bind(this);
  }

  handleSelectEvent = (key) => {
    this.state.selectedComments.forEach((a) => {
      console.log(key);
    });

    // this.setState({

    // });
  };

  toggleVisibility(objId: string, btnId: string) {
    let btn = document.getElementById(btnId);
    let el = document.getElementById(objId);
    if (btn.innerText === "Hide") {
      btn.innerText = "Show";
      el.style.display = "none";
    } else if (btn.innerText === "Show") {
      btn.innerText = "Hide";
      el.style.display = "block";
    }
  }

  addPlusButton = (header: Element) => {
    const commentId = header.querySelector("h3 a.js-timestamp")["href"];
    if (!header.getElementsByClassName(commentId.split().pop()).length) {
      // check to insert only to new comments
      const plusButton = document.createElement("div");
      plusButton.className = commentId.split().pop();
      header.prepend(plusButton);
      ReactDOM.render(
        <PlusButton
          key={commentId.split().pop()}
          handler={this.handleSelectEvent}
        />,
        plusButton
      );
    }
  };

  wrapSummaries = () => {
    var subSummaries = [];
    this.state.selectedComments.forEach((comment) => {
      if (comment.selected) {
        let e = (
          <>
            <div className="comment_block p-2">
              <h3 className="f6">
                <a className="Link--primary" href={comment.author.profile}>
                  {comment.author.uname}
                </a>
              </h3>
              <p>{comment.shortBody}</p>
            </div>
          </>
        );
      }
    });
  };

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

  modifyCommentBucket = () => {
    const commentTags = document.querySelectorAll(
      "div.TimelineItem.js-comment-container"
    );
    var comments = [];
    commentTags.forEach((tag) => {
      const timelineHeader = tag.querySelectorAll(
        "div.timeline-comment-header:not(.summary-sidebar-header)"
      )[0];
      this.addPlusButton(timelineHeader);
      comments.push(this.commentParser(tag));
    });
    this.setState({
      selectedComments: comments,
    });
  };

  // toggleButtonFunctionality = () => {
  //   if (this.state.buttonFunctionality === "Add") {
  //     this.setState({
  //       buttonFunctionality: "Generate",
  //     });
  //     this.addPlusButton();
  //   }
  // };

  render() {
    return (
      <div id="topLevelSummary" className="Box">
        <div className="Box-header">
          <div className="clearfix">
            <div className="float-left px-1">
              <h2 className="Box-title p-1">Summaries</h2>
            </div>

            <div className="float-right">
              <div className="float-right px-1 d-inline-flex">
                <button
                  className="btn btn-sm btn-primary m-0 ml-2 ml-md-2"
                  onClick={this.modifyCommentBucket}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
        <div id="subSummaries">{this.state.summaries}</div>
      </div>
    );
  }
}

export default SubSummaryComponent;
