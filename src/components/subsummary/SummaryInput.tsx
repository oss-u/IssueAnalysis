import React from "react";
import { Summary } from "../../types";
import ReactMarkdown from 'react-markdown';
import TurndownService from 'turndown';
import remarkGfm from 'remark-gfm';
import { generateSummary } from "../../endpoints";
import { Popover, Button, Heading, Text } from '@primer/react';

export default class SummaryInputComponent extends React.Component<
  {
    existingSummary: string;
    subSummaryObject: Summary;
    backButtonHandler;
    submitHandler;
  },
  {writing: boolean,
  content: string,
  popover: boolean}
> {

  constructor(props) {
    super(props);
    let turndownService = new TurndownService();
    this.state = {
      writing: true,
      popover: false,
      content: turndownService.turndown(this.props.existingSummary),      
    };
  }

  subsummaryView = () => {

    if (this.state.popover) {
      return (<div className="details">
        <div className="details-reset details-overlay details-overlay-dark">
          <div className = "details-dialog">
            <div className="Box Box--overlay d-flex flex-column anim-fade-in fast">
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
                  ype="submit"
                  onClick={() => {
                  let commentText = this.concatCommentsOfSubsummary();
                  generateSummary(commentText).then((summaryRes) => this.setState({
                    content: summaryRes.summary,
                    popover: false
                  })).catch(() => {

                  });
                }} data-close-dialog>Yes</Button>
                <Button 
                  className="btn btn-sm m-1 float-right"
                  type="button"
                  onClick={() => {
                  this.setState({
                    popover: false
                  });
                }} data-close-dialog>No</Button>
              </div>
            </div>
          </div>
        </div>
      </div>)
    }

    
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
    let concatComments = "";
    // merge all the summaries in concatComments
    for (let i = 0; i < item.length; i++) {
      concatComments = concatComments.concat(item[i].text, ' ');
    }
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
        <div className="d-flex flex-row mb-1">
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
              </div>
            </div>
            <div className="Box-row p-1">
              <p className="text-normal">
                  <div dangerouslySetInnerHTML={{ __html: e.text }} />
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
          {comments}
          <nav className="tabnav-tabs pl-1">
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
              onClick={() => {this.props.submitHandler(this.state.content)}}
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
          </div>
    );
  }
}