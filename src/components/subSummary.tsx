import React from "react";
import ReactDOM from "react-dom";
import { generateSummary, saveUserSummaries, getUserSummaries, deleteUserSummaries,
         Author, Subsummary, Comment, getUserSummaryComments, updateUserSummaries, 
         updateUserSummaryComments } from "../endpoints";
import "../style.scss";
import { IssueComment, Summary } from "../types";
import { commentParser } from "../utils/comment_parser";
import { IconButton, StyledOcticon } from '@primer/react';
import { getCurrentUserName } from "../utils";
import { parseURLForIssueDetails } from "../utils/scraping";
import { PlusIcon, TriangleRightIcon, StopIcon,
          TriangleLeftIcon, Icon, XIcon } from '@primer/octicons-react';
import SummaryComponent from './subsummary/Summary';
import SummaryInputComponent from "./subsummary/SummaryInput";
import CommentComponent from "./subsummary/Comment";

class SubSummaryComponent extends React.Component<
  { resizePanel },
  {
    subsummaries: Array<Summary>;
    editing: string;
    visible: string;
    viewing: string;
    genSumm: string;
    arrow: Icon;
    panelState: number;
    addState: boolean;
    saveError: boolean;
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
      panelState: 1,
      addState: false,
      saveError: false
    };
    this.loadCommentComponents = this.loadCommentComponents.bind(this);
    this.saveSummary == this.saveSummary.bind(this);
    // Get the comments and do the initialising
    this.getExistingUserSummaries();
    // add listener to "Load More" items
    const loadMore = document.getElementById("js-progressive-timeline-item-container");
    const observer = new MutationObserver((mutationsList, observer) => {
      for(const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            if (this.state.editing || this.state.addState) {
              const commentTags = document.querySelectorAll(
                "div.timeline-comment.unminimized-comment"
              );

              console.log("this", this.state.editing);
          
              commentTags.forEach((tag) => {
                this.renderCommentPlus(tag, this.state.editing);
              })
            }
            observer.disconnect();
        }
    }
    });
    observer.observe(loadMore, {childList: true});
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


  addCommentsOnClick = (tag: Element, ibElement: Element) => {
    let newComment = commentParser(tag);
    if (!this.addedComments.includes(newComment.id) && this.state.visible !== 'input') {
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
      tagHeader.setAttribute("style", "background:#ABF2BC");
      if (!tag.classList.contains("color-border-success-emphasis")) {
        tag.classList.add("color-border-success-emphasis");
      }
      ReactDOM.render(<IconButton aria-label="add"
                        icon={XIcon} 
                        className="btn btn-sm btn-primary m-0 ml-md-2"
                        onClick={() => {
                          this.removeSpecificComment(tag, ibElement);
                        }} />, ibElement);
    } else {
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
          visible: "input",
        });
        const tagHeader = tag.querySelector(".timeline-comment-header");
      tagHeader.setAttribute("style", "background:#ABF2BC");
      if (!tag.classList.contains("color-border-success-emphasis")) {
        tag.classList.add("color-border-success-emphasis");
      }
        ReactDOM.render(<IconButton aria-label="add"
                        icon={XIcon} 
                        className="btn btn-sm btn-primary m-0 ml-md-2"
                        onClick={() => {
                          this.removeSpecificComment(tag, ibElement);
                        }} />, ibElement);
      }
    }
  };

  removeSpecificComment = (tag: Element, ibElement: Element) => {
    this.deleteCommentFromExistingSummary(this.state.editing, commentParser(tag).id);
    ReactDOM.render(<IconButton aria-label="add"
                        icon={PlusIcon} 
                        className="btn btn-sm btn-primary m-0 ml-md-2"
                        onClick={() => {
                          this.addCommentsOnClick(tag, ibElement);
                        }} />, ibElement)
  }

  renderCommentPlus = (tag: Element, editing: string) => {
    const commentHeader = tag.querySelector(".timeline-comment-actions");
    let ibElement = commentHeader.querySelector("#add-comment-to-summary");
    if (!ibElement) {
      ibElement = document.createElement("div");
      ibElement.id = "add-comment-to-summary";
      ibElement.className = "comment-action-float";
      commentHeader.appendChild(ibElement);
    }

    if (!this.state.addState) {
      let newComment = commentParser(tag);
      let editingSubsummary;
      let foundComment;
      editingSubsummary = this.state.subsummaries.find(o => o.id === editing);
      if (editingSubsummary)
        foundComment = editingSubsummary.comments.find(c => c.id === newComment.id);
      if (foundComment !== undefined) {
        ReactDOM.render(<IconButton aria-label="add"
                        icon={XIcon} 
                        className="btn btn-sm btn-primary m-0 ml-md-2"
                        onClick={() => {
                          this.removeSpecificComment(tag, ibElement);
                        }} />, ibElement);
      } else if (this.addedComments.includes(newComment.id)) {
        ReactDOM.render(<IconButton aria-label="add"
        icon={PlusIcon} 
        aria-disabled="true"
        className="btn btn-sm btn-primary m-0 ml-md-2"
        onClick={() => {
          this.addCommentsOnClick(tag, ibElement);
        }} />, ibElement);
      } else {
        ReactDOM.render(<IconButton aria-label="add"
        icon={PlusIcon} 
        className="btn btn-sm btn-primary m-0 ml-md-2"
        onClick={() => {
          this.addCommentsOnClick(tag, ibElement);
        }} />, ibElement);
      }
    } else {
      const commentHeader = tag.querySelector(".timeline-comment-actions");
      let ibElement = commentHeader.querySelector("#add-comment-to-summary");
      if (!ibElement) {
        ibElement = document.createElement("div");
        ibElement.id = "add-comment-to-summary";
        ibElement.className = "comment-action-float";
        commentHeader.appendChild(ibElement);
      }
      ReactDOM.render(<></>, ibElement);
    }
  }

  addCommentsToSummary = () => {
    // Change this code to add an explicit button 
    // instead of a listener
    this.removeBorderHighlights();

    const commentTags = document.querySelectorAll(
      "div.timeline-comment.unminimized-comment"
    );

    commentTags.forEach((tag) => {
      this.renderCommentPlus(tag, this.state.editing);
    })

    if (!this.state.addState) {
      this.setState({
        visible: "comments",
        addState: true
      });
    } else {
      if (this.state.editing)
        this.resetSession();

      this.setState({
        visible: "summary",
        addState: false,
        editing: ''
      });
    }
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
    this.setState({
      editing: this.state.viewing,
      viewing: "",
      visible: "input",
      // addState: true
    });
    const commentTags = document.querySelectorAll(
      "div.timeline-comment.unminimized-comment"
    );

    commentTags.forEach((tag) => {
      this.renderCommentPlus(tag, this.state.viewing);
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
        // add comments to unsavedSummaryComments
        this.addedComments.splice(this.addedComments.indexOf(deletedComment.id), 1);
        if (tag.classList.contains("color-border-success-emphasis")) {
          const tagHeader = tag.querySelector(".timeline-comment-header");
          tagHeader.removeAttribute("style");
          tag.classList.remove("color-border-success-emphasis");
        }

        const commentHeader = tag.querySelector(".timeline-comment-actions");
        let ibElement = commentHeader.querySelector("#add-comment-to-summary");
        if (!ibElement) {
          ibElement = document.createElement("div");
          ibElement.id = "add-comment-to-summary";
          ibElement.className = "comment-action-float";
          commentHeader.appendChild(ibElement);
        }

        ReactDOM.render(<IconButton aria-label="add"
        icon={PlusIcon} 
        className="btn btn-sm btn-primary m-0 ml-md-2"
        onClick={() => {
          this.addCommentsOnClick(tag, ibElement);
        }} />, ibElement);
      }
    });
    
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
    // update the original summary list
    this.setState({
      subsummaries: newSs,
      addState: false
    });

    // remove from added comments
    const idx = this.addedComments.indexOf(commentId);
    if (idx > -1) {
      this.addedComments.splice(idx, 1);
    }

    // commentTags.forEach((tag) => {
    //   this.renderCommentPlus(tag, this.state.viewing);
    // })
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
  };

  loadCommentComponents = () => {
    let t = [];
    let commentCount = 0;
    this.state.subsummaries.forEach((value, index) => {
      if (value.id === this.state.editing) {
        commentCount = value.comments.length;
        t.push(
          <CommentComponent
            key={index}
            comments={value.comments}
            actionHandler={this.toggleSummaryBoxComponent}
            addCommentsToSummary={this.addCommentsToSummary}
          />
        );
      }
    });
    if (commentCount > 0) {
      return t;
    } else {
      return (<div className="blankslate">
      <p>Click on the '+' icon on comments to add them to the summary.</p>
    </div>)
    }
  };

  loadSummaryComponent = () => {
    if (this.state.subsummaries.length) {
      const summaries = [...this.state.subsummaries];
      if (summaries.length > 0) {
        return (<div className="sub-scroll">
          <SummaryComponent
            summaries={summaries}
            viewExistingSummary={this.viewExistingSummary}
            viewing={this.state.viewing}
            editButtonHandler={this.editExistingSummary}
            deleteButtonHandler={this.deleteExistingSummary}
          /></div>
        );
      }
    }
    return (
      <div className="blankslate">
        <p>Click on the 'Add' button to create a summary.</p>
      </div>
    );
  };

  updateGensumm = (summary) => {
    this.setState({
      genSumm: summary
    });
  }

  loadSummaryInputComponent = () => {
    let existing = false;
    if(this.summaryIdMapping.get(this.state.editing)) {
      existing = true;
    }
    let concatenatedComments = this.concatCommentsOfSubsummary();
    if (!this.state.genSumm && !existing) {
  
    generateSummary(concatenatedComments).then((summaryRes) => {
      this.setState({
        genSumm: summaryRes.summary
      });
    }).catch((e) => {
      console.log("Error in generating the summary.");
      console.log(e);
    });
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
          updateGensumm={this.updateGensumm}
          backButtonHandler={this.toggleSummaryBoxComponent}
          submitHandler={this.saveSummary}
          deleteCommentHandler={this.deleteCommentFromExistingSummary}
        />);
    } else {
      return (
        <div className="Label m-3">
          <span>Loading</span>
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

  removeCommentIcons = () => {
    const commentTags = document.querySelectorAll(
      "div.timeline-comment.unminimized-comment"
    );
    commentTags.forEach((tag) => {
      const commentHeader = tag.querySelector(".timeline-comment-actions");
      let ibElement = commentHeader.querySelector("#add-comment-to-summary");
      if (!ibElement) {
        ibElement = document.createElement("div");
        ibElement.id = "add-comment-to-summary";
        ibElement.className = "comment-action-float";
        commentHeader.appendChild(ibElement);
      }
      ReactDOM.render(<></>, ibElement);
    });
  }

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
    // this.resetBorderHighlights();
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
    console.log("subsummaries", this.state.subsummaries);
    console.log("editing", this.state.editing);
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
        console.log("Error in saving the summary.");
        console.log(e);
        this.setState({
          saveError: true
        });
      });
    } else {
      let edited = this.state.editing;
        saveUserSummaries(issueDetails.user, issueDetails.repository, 
          issueDetails.issueNum, subsummaries).then((response) => {
            this.summaryIdMapping.set(edited, response.id.toString());
        }).catch((e) => {
          console.log("Error in saving the summary.");
          console.log(e);
          this.setState({
            saveError: true
          });
        });
    }

    this.setState({
      subsummaries: items,
      visible: "summary",
      editing: "",
      genSumm: "",
      addState: false
    });

    this.removeCommentIcons();
    // this.resetBorderHighlights();
  };

  toggleSummaryBoxComponent = (visiblePanel: string) => {
    this.setState({
      visible: visiblePanel,
      addState: true
    });
  };

  toggleArrow = () => {
    if (this.state.arrow === TriangleLeftIcon) {
      return TriangleRightIcon;
    } else {
      return TriangleLeftIcon;
    }
  }

  getAddState = () => {
    if (this.state.addState) {
      return "Cancel";
    } else {
      return "New";
    }
  }

  getErrorToast = () => {
    if (this.state.saveError) {
      return (<div className="p-1 toast">
              <div className="Toast">
                <span className="Toast-content toast-padding">Error in saving the summary.</span>
                <button className="Toast-dismissButton toast-padding" onClick={() => {this.setState({saveError: false})}}>
                <StyledOcticon icon={XIcon} size={16}/>
                </button>
              </div>
            </div>);
    }
  }

  render() {    
    // This needs to be here because 
    // 1) Existing long threads can be unminimized
    // 2) New comments can be added to the thread
    // this.addCommentsToSummary();
    // this.resetBorderHighlights();
    return (
      <>
      {this.getErrorToast()}
      <div id="sub-summary" className="Box" >
        <div className="Box-header px-2 py-3">
          <div className="clearfix">
            <div className="float-left">
              <h2 className="Box-title my-1 ml-2">User Summaries</h2>
            </div>
            <div className="float-right">
              <div className="float-right d-inline-flex">
              <button className="btn btn-sm btn-primary m-0" 
                      type="button"
                      onClick={() => {
                        this.setState({
                          editing: '',
                          viewing: ''
                        });
                        this.addCommentsToSummary();
                      }}>
                  {this.getAddState()}
              </button> 
                <IconButton aria-label="add" 
                size="medium" icon={this.state.arrow} 
                className="btn btn-sm btn-primary m-0 ml-2"
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
        <div id="summary-component" >{this.loadViewBasedOnState()}</div>
      </div></>
    );
  }
}

export default SubSummaryComponent;
