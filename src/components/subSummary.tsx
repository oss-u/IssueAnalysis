import React from "react";
import { generateSummary, saveUserSummaries, getUserSummaries, deleteUserSummaries,
         Author, Subsummary, Comment, getUserSummaryComments, updateUserSummaries, 
         updateUserSummaryComments } from "../endpoints";
import "../style.scss";
import { IssueComment, Summary } from "../types";
import { commentParser } from "../utils/comment_parser";
import { IconButton } from '@primer/react';
import { getCurrentUserName } from "../utils";
import { parseURLForIssueDetails } from "../utils/scraping";
import { PlusIcon, TriangleRightIcon, 
          TriangleLeftIcon, Icon } from '@primer/octicons-react';
import SummaryComponent from './subsummary/Summary';
import SummaryInputComponent from "./subsummary/SummaryInput";
import CommentComponent from "./subsummary/Comment";

class SubSummaryComponent extends React.Component<
  {resizePanel},
  {
    subsummaries: Array<Summary>;
    editing: string;
    visible: string;
    viewing: string;
    genSumm: string;
    arrow: Icon;
    panelState: number;
  }
> {

  summaryIdMapping: Map<string, string> = new Map<string, string>();
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
      arrow: TriangleRightIcon,
      panelState: 1
    };
    this.loadCommentComponents = this.loadCommentComponents.bind(this);
    this.saveSummary == this.saveSummary.bind(this);
    // Get the comments and do the initialising
    this.getExistingUserSummaries();
  }

  getExistingUserSummaries = () => {
    let existingSubsummaries: Summary[] = [];
    const issueDetails = parseURLForIssueDetails();
    const allCommentMap = new Map<string, IssueComment>();
    document.querySelectorAll(
      "div.timeline-comment.unminimized-comment"
    ).forEach(ct => {
      let parsed: IssueComment = commentParser(ct);
      allCommentMap.set(parsed.id, parsed);
    });
    getUserSummaries(issueDetails.user, issueDetails.repository, issueDetails.issueNum).then((response) => {
      response.map((s) => {
        getUserSummaryComments(issueDetails.user, issueDetails.repository, issueDetails.issueNum, s.id).then((res) => {
          let issueComments: IssueComment[] = [];
            res.comments.map((c) => {
              let createdOnDate = new Date(c.commented_on).toLocaleString('default', 
                                      {year: "numeric", month:"short", day:"numeric"});
              let auth = {
                uname: c.author,
                createdOn: createdOnDate,
                profile: commentParser(allCommentMap.get(c.id).tag).author.profile,
              }
              let iComment: IssueComment = {
                id: c.id,
                tag: allCommentMap.get(c.id).tag,
                author: auth,
                text: c.text
              }
              issueComments.push(iComment);
              this.addedComments.push(c.id);
            });
          let ess: Summary = {
            id: res.id.toString(),
            summary: res.summary,
            comments: issueComments
          }
          existingSubsummaries.push(ess);
          existingSubsummaries.forEach(s => {
            this.summaryIdMapping.set(s.id, s.id);
          })
          this.setState({
            subsummaries: existingSubsummaries
          });
        }).catch((e) => {
          console.log(e);
        })
      });
    }).catch((e) => {
      // add a toast (maybe?)
      console.log(e);
    });
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
          // tagHeader.setAttribute("style", "background:#6cc644");
          tag.classList.add("color-border-success-emphasis");
        }
      }
    });
  };

  showSpecificHighlights = (c: Array<IssueComment>) => {
    this.removeBorderHighlights();
    const commentTags = document.querySelectorAll(
      "div.timeline-comment.unminimized-comment"
    );
    let commentList = [];
    if (c !== undefined)
      commentList = c.map((e) => e.id);
    commentTags.forEach((tag) => {
      if (commentList.includes(tag.querySelector("a.js-timestamp")["href"])) {
        if (!tag.classList.contains("color-border-success-emphasis")) {
          const tagHeader = tag.querySelector(".timeline-comment-header");
          tagHeader.setAttribute("style", "background:#1a7f37");
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
        }
        this.setState({
          subsummaries: items,
          visible: "comments",
        });
      } else {
        // If not editing, then we are creating a new summary
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
      // tagHeader.setAttribute("style", "background:#9ed2a7");
      tag.classList.add("color-border-success-emphasis");
    } 
  };

  addCommentsToSummary = () => {
    // Change this code to add an explicit button 
    // instead of a listener
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

  editExistingSummary = () => {
    this.resetBorderHighlights();
    this.setState({
      editing: this.state.viewing,
      viewing: "",
      visible: "input",
    });
  };

  deleteCommentFromExistingSummary = (summaryId, commentId) => {
    let newS: Summary;
    let newSs: Array<Summary> = this.state.subsummaries;
    const commentTags = document.querySelectorAll(
      "div.timeline-comment.unminimized-comment"
    );
    commentTags.forEach((tag) => {
      let deletedComment = commentParser(tag);
      if (commentId === deletedComment.id) {
        this.addedComments.splice(this.addedComments.indexOf(deletedComment.id), 1);
        if (tag.classList.contains("color-border-success-emphasis")) {
          const tagHeader = tag.querySelector(".timeline-comment-header");
          tagHeader.removeAttribute("style");
          tag.classList.remove("color-border-success-emphasis");
        }
      }
    });

    // this.state.subsummaries.forEach(ss => {
    //   if (ss.id === summaryId) {
    //     ss.comments.splice(commentId, 1);
    //   }
    // });
    
    // find the summary from the list of summaries
    newSs.forEach(ss => {
      if (ss.id === summaryId) {
        newS = ss;
      }
    });
    // remove the comment from the summary
    let cId;
    newS.comments.forEach((c, index) => {
      if (c.id === commentId) {
        cId = index;
      }
    });
    newS.comments.splice(cId, 1);
    // replace the summary from the summary
    newSs = newSs.map(s => s.id === newS.id ? newS : s);
    console.log(summaryId, commentId, newSs, newS);
    // update the original summary list
    this.setState({
      subsummaries: newSs
    });
    
  }

  deleteExistingSummary = (id: number) => {
    let deleteIndex;
    this.state.subsummaries.forEach((ss, index) => {
      if (ss.id === id.toString()) {
        deleteIndex = index;
      }
    });
    
    const commentTags = document.querySelectorAll(
      "div.timeline-comment.unminimized-comment"
    );
    const deletedComments = this.state.subsummaries[deleteIndex].comments.map(c => c.id);

    commentTags.forEach((tag) => {
      let deletedComment = commentParser(tag);
      if (deletedComments.includes(deletedComment.id)) {
        this.addedComments.splice(this.addedComments.indexOf(deletedComment.id), 1);
        if (tag.classList.contains("color-border-success-emphasis")) {
          const tagHeader = tag.querySelector(".timeline-comment-header");
          tagHeader.removeAttribute("style");
          tag.classList.remove("color-border-success-emphasis");
        }
      }
    });

    this.state.subsummaries.splice(deleteIndex, 1);    

    const issueDetails = parseURLForIssueDetails();
    deleteUserSummaries(issueDetails.user, issueDetails.repository, issueDetails.issueNum, id).then((response) => {
      console.log("Item deleted:");
      console.log(response);
    }).catch((e) => {
      console.log(e);
    });
  }

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
            deleteButtonHandler={this.deleteExistingSummary}
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
    let existing = false;
    if(this.summaryIdMapping.get(this.state.editing)) {
      existing = true;
    }
    let concatenatedComments = this.concatCommentsOfSubsummary();
    if (!this.state.genSumm && !existing) {
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
    let generatedSummary;
    if (this.state.genSumm && !existing) {
      generatedSummary = this.state.genSumm;
    } else if (existing) {
      let modifiedSummary = this.state.subsummaries.findIndex(
        (e) => e.id === this.state.editing
      );
      let items = [...this.state.subsummaries];
      let item = { ...items[modifiedSummary] };
      generatedSummary = item.summary;
    }
    if (generatedSummary) {
      // Also check if the number of elements have changed
      return (<SummaryInputComponent
          existingSummary={generatedSummary}
          subSummaryObject={editingSubsummary}
          backButtonHandler={this.toggleSummaryBoxComponent}
          submitHandler={this.saveSummary}
          deleteCommentHandler={this.deleteCommentFromExistingSummary}
        />);
    } else {
      return (
        <div className="Label m-3">
          <span >Loading</span>
          <span className="AnimatedEllipsis"></span>
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
    if (!this.summaryIdMapping.get(this.state.editing)) {
      let modifiedSummary = this.state.subsummaries.findIndex(
        (e) => e.id === this.state.editing
      );
      this.state.subsummaries.splice(modifiedSummary, 1);
      let oldState = this.state.subsummaries;
      this.setState({
        subsummaries: oldState,
        editing: "",
      });
    }
    this.resetBorderHighlights();
  };

  saveSummary = (summary: string) => {
    let liUser: string = getCurrentUserName();
    let author: Author = {
      "user_id": liUser,
      "link": "https://github.com/" + liUser
    }
    
    let modifiedSummary = this.state.subsummaries.findIndex(
      (e) => e.id === this.state.editing
    );

    let items = [...this.state.subsummaries];
    let item = { ...items[modifiedSummary] };

    item.summary = summary;
    items[modifiedSummary] = item;
    
    let comments: Comment[] = [];
    item.comments.forEach((c) => {
      let comment: Comment = {
        id: c.id,
        text: c.text,
        author: c.author.uname,
        commented_on: new Date(c.author.createdOn).toISOString()
      }
      comments.push(comment);
      this.addedComments.push(c.id);
    });

    const subsummaries: Subsummary = {
      summary: summary,
      author: author,
      comments: comments
    }

    const issueDetails = parseURLForIssueDetails();

    // Generally the put method is distinguished at the backend
    // Just make do with the APIs provided for now
    // Bad design :/
    console.log(this.summaryIdMapping.get(this.state.editing));
    if (this.summaryIdMapping.get(this.state.editing)) {
      updateUserSummaries(issueDetails.user, issueDetails.repository, 
        issueDetails.issueNum, parseInt(this.summaryIdMapping.get(this.state.editing)), 
        subsummaries).then((response) => {
        // save the comments
        updateUserSummaryComments(issueDetails.user, issueDetails.repository, 
          issueDetails.issueNum, parseInt(this.summaryIdMapping.get(this.state.editing)), 
          subsummaries).then((response) => {
            // Nothing to do, its already saved
          }).catch((e) => {
            // Might want to move this to a Toast
            console.log("Error in saving the summary comments.");
            console.log(e);
          });
      }).catch((e) => {
        // Might want to move this to a Toast
        console.log("Error in saving the summary.");
        console.log(e);
      });
    } else {
      let edited = this.state.editing;
      saveUserSummaries(issueDetails.user, issueDetails.repository, 
        issueDetails.issueNum, subsummaries).then((response) => {
          this.summaryIdMapping.set(edited, response.id.toString());
      }).catch((e) => {
        // Might want to move this to a Toast
        console.log("Error in saving the summary.");
        console.log(e);
      });
    }

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

  toggleArrow = () => {
    if (this.state.arrow === TriangleLeftIcon) {
      return TriangleRightIcon;
    } else {
      return TriangleLeftIcon;
    }
  }

  render() {    
    // This needs to be here because 
    // 1) Existing long threads can be unminimized
    // 2) New comments can be added to the thread
    this.addCommentsToSummary();
    this.resetBorderHighlights();
    return (
      <div id="sub-summary" className="Box" >
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
                // onClick={this.addCommentsToSummary}/>
                />
                <IconButton aria-label="add" 
                size="medium" icon={this.state.arrow} 
                className="btn btn-sm btn-primary m-0 ml-2 ml-md-2"
                onClick={() => {
                  this.props.resizePanel(this.state.panelState);
                  this.setState({
                    panelState: 1-this.state.panelState,
                    arrow: this.toggleArrow()
                  });
                  }}/>
              </div>
            </div>
          </div>
        </div>
        <div id="summary-component" className="sub-scroll">{this.loadViewBasedOnState()}</div>
      </div>
    );
  }
}

export default SubSummaryComponent;
