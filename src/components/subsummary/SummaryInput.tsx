import React from "react";
import { Summary } from "../../types";
import ReactMarkdown from 'react-markdown';
import TurndownService from 'turndown';
import { Popover, IconButton, Button, Heading, Text } from '@primer/react';
import { TrashIcon } from '@primer/octicons-react';
import remarkGfm from 'remark-gfm';
import { generateSummary } from "../../endpoints";
import { commentParser } from "../../utils/comment_parser";

export default class SummaryInputComponent extends React.Component<
  {
    existingSummary: string;
    subSummaryObject: Summary;
    backButtonHandler;
    submitHandler;
    deleteCommentHandler;
    updateGensumm;
  },
  {
    writing: boolean,
    content: string,
    popover: boolean
    doneState: boolean
  }
> {

  turndownServiceMarkdown = (content) => {
    let turndownService = new TurndownService();
    return turndownService.turndown(content); 
  }

  constructor(props) {
    super(props);
    this.state = {
      writing: true,
      popover: false,
      doneState: false,
      content: this.turndownServiceMarkdown(this.props.existingSummary),      
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

  setModalState = () => {
    this.setState({
      popover: false
    });
  }

  getSummaryInputView = (comments) => {
    if (this.state.popover) {
      // get the popover view
      return (<div className="Box Box--overlay d-flex flex-column anim-fade-in fast modal-width-auto mt-2">
              <div className="Box-header">
                <h3 className="Box-title">Warning</h3>
              </div>
                <div className="Box-body">
                  <p>
                    Regenerating the summary will overwrite the existing summary. Proceed?
                  </p>
                </div>
              <div className="Box-footer">
              <Button 
                  className="btn btn-sm btn-primary m-1 float-right"
                  type="button"
                  onClick={() => {
                    let concatenatedComments = this.concatCommentsOfSubsummary();
                    generateSummary(concatenatedComments).then((summaryRes) => {
                      console.log(summaryRes.summary);
                      console.log(concatenatedComments);
                      this.setState({
                        content: this.turndownServiceMarkdown(summaryRes.summary),
                        popover: false
                      });
                      this.props.updateGensumm(summaryRes.summary);
                    });
                  }}
                  >Yes</Button>
                <Button 
                  className="btn btn-sm m-1 float-right"
                  type="button"
                  onClick={() => {
                  this.setState({
                    popover: false
                  });
                }} data-close-dialog>No</Button>
              </div>
            </div>);
    } else {
      // get the edit summary view
      return (<>
      <div className="sub-scroll-input">
              {comments}</div>
              <nav className="tabnav-tabs pl-1 mt-1">
              <button className="tabnav-tab" 
                      role="tab" 
                      type="button"
                      aria-selected={this.state.writing?true:false}
                      onClick={()=> {
                        this.setState({
                          writing: true
                        });
                      }}>
                Write
              </button>
              <button className="tabnav-tab ml-1" 
                      role="tab" 
                      type="button"
                      aria-selected={this.state.writing?false:true}
                      onClick={()=> {
                        this.setState({
                          writing: false
                        });
                      }}>
                Preview
              </button>
          </nav>
          {this.subsummaryView()}
          <div className="clearfix flex-row">
            <button
              className="btn btn-sm btn-primary m-1 float-right"
              type="submit"
              disabled={this.state.doneState}
              onClick={() => {
                this.props.submitHandler(this.state.content)
              }}
            >
              Done
            </button>
            <button aria-haspopup="dialog"
              className="btn btn-sm m-1 float-right"
              type="button"
              onClick={() => {
                this.setState({
                  popover: true
                });
              }}
            >
              Regenerate
            </button>
            {/* <button
              className="btn btn-sm m-1 float-right"
              type="button"
              onClick={() => {
                this.props.backButtonHandler("comments");
              }}
            >
              Back
            </button> */}
            </div></>)
    }
  }

  subsummaryView = () => {
    if (this.state.writing) {
      return (<textarea rows={5}
                  className="form-control input-block textarea-vertical-resize-only"
                  aria-label="summary-input"
                  name="summary-textarea"
                  onChange={this.optimisedEditTextArea}
                >
                  
        {this.state.content}
      </textarea>)
    } else
    return (
      <div className="Box">
        <ReactMarkdown className="pt-2 pl-2" remarkPlugins={[remarkGfm]}>{this.state.content}</ReactMarkdown>
      </div>);
  }

  onEditTextArea = (event) => {
    event.persist();
    this.setState({
      content: event.target.value
    });
  };

  concatCommentsOfSubsummary = () => {
    // get the subsummary from the editing state
    let item = { ...this.props.subSummaryObject.comments };
    console.log(item, this.props.subSummaryObject);
    let concatComments = "";
    // merge all the summaries in concatComments change this TODO
    for (let i = 0; i < item.length; i++) {
      console.log(i, item[i].text);
      concatComments = concatComments.concat(item[i].text, ' ');
    }
    console.log("in concat", concatComments);
    concatComments = concatComments.trim();
    return concatComments;
  };

  debounce = (f, delay) => {
    let debounceTimer;
    return function (this) {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => f.apply(context, args), delay);
    }
  }

  // 1 second
  optimisedEditTextArea = this.debounce(this.onEditTextArea, 1000);

  render() {
    let comments = [];
    
    this.props.subSummaryObject.comments.forEach((e) => {
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
                <IconButton variant="invisible"
                  size="small"
                  className="btn btn-sm float-right m-0 p-0"
                  aria-label="delete-summary"
                  icon={ TrashIcon }
                  onClick={() => {
                    this.props.deleteCommentHandler(this.props.subSummaryObject.id, e.id);
                  }} />
              </div>
            </div>
            <div className="Box-row p-1">
              <p className="text-normal">
                  <div className="pl-3" dangerouslySetInnerHTML={{ __html: e.text }} />
              </p>
            </div>
          </div>
        </div>
      );
    });

    if (comments.length === 0 && !this.state.doneState) {
      this.setState({
        doneState: true
      });
    } else if (comments.length > 0 && this.state.doneState) {
      this.setState({
        doneState: false
      })
    }

    // This cannot be set as HTML because it is a text area
    return (<>
      <div className="Box flex-column m-1 p-1 color-border-success-emphasis">
        <h5>Edit Summary</h5>
          {this.getSummaryInputView(comments)}
          </div>
          </>
    );
  }
}