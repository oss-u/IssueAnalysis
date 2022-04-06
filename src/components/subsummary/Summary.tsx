import React from "react";
import { IconButton } from '@primer/react';
import { TrashIcon, PencilIcon } from '@primer/octicons-react';

export default class SummaryComponent extends React.Component<
  { summaries: any; viewExistingSummary; viewing: string; editButtonHandler; deleteButtonHandler; },
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
            className="Box flex-column m-1 p-1 color-border-info"
            onClick={() => {
              this.props.viewExistingSummary(s.id);
            }}
          >
            <IconButton variant="invisible"
              size="small"
              className="btn btn-sm float-right"
              aria-label="delete-summary"
              icon={TrashIcon}
              onClick={() => {this.props.deleteButtonHandler(s.id)}} />
            <IconButton variant="invisible"
              size="small"
              className="btn btn-sm float-right"
              aria-label="edit-summary"
              icon={PencilIcon}
              onClick={this.props.editButtonHandler} />
            <div className="lh-condensed text-normal f6 m-1">
              Autogenerated summary of {s.comments.length} comment(s) by{" "}
              <span className="text-bold f6">{uniqueAuthors.join(", ")}</span>
            </div>
            <div className="m-1">
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
