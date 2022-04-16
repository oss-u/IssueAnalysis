import React from "react";
import { IconButton } from '@primer/react';
import { TrashIcon, PencilIcon } from '@primer/octicons-react';
import NavigationComponent from '../subsummary/Navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TurndownService from 'turndown';

export default class SummaryComponent extends React.Component<
  { summaries: any; viewExistingSummary; viewing: string; editButtonHandler; deleteButtonHandler; },
  { turndownService }
> {

  constructor(props) {
    super(props);
    this.state = {
      turndownService: new TurndownService()      
    };
  }

  render() {
    let summaryContent: Array<JSX.Element> = [];
    this.props.summaries.forEach((s) => {
      const uniqueAuthors = [
        ...new Set(s.comments.map((comment) => comment.author.uname)),
      ];
      if (this.props.viewing && this.props.viewing === s.id) {
        summaryContent.push(
          <div
            className="Box flex-column m-1 color-border-open-emphasis"
            onClick={() => {
              this.props.viewExistingSummary(s.id);
            }}
          >
            <div className="Box-row Box-row--gray lh-condensed text-normal px-1 pt-1 pb-2 f6 mt-1 mx-1 mb-2">
            <IconButton variant="invisible"
              size="small"
              className="btn btn-sm float-right m-0 p-0"
              aria-label="delete-summary"
              icon={TrashIcon}
              onClick={() => {this.props.deleteButtonHandler(s.id)}} />
            <IconButton variant="invisible"
              size="small"
              className="btn btn-sm float-right mr-2 p-0"
              aria-label="edit-summary"
              icon={PencilIcon}
              onClick={this.props.editButtonHandler} />
              Autogenerated summary of {s.comments.length} comment(s) by{" "}
              <span className="text-bold f6">{uniqueAuthors.join(", ")}</span>
            </div>
            <ReactMarkdown className="pt-2 pl-2" remarkPlugins={[remarkGfm]}>
              {this.state.turndownService.turndown(s.summary)}
              </ReactMarkdown>
            <NavigationComponent navbarContent={s.comments} />
          </div>
        );
      } else {
        summaryContent.push(
          <div
            className="Box flex-column m-1"
            onClick={() => {
              this.props.viewExistingSummary(s.id);
            }}
          >
            <div className="Box-row Box-row--gray p-1 lh-condensed text-normal f6 m-1">
              Autogenerated summary of {s.comments.length} comment(s) by{" "}
              <span className="text-bold f6">{uniqueAuthors.join(", ")}</span>
            </div>
            <ReactMarkdown className="pt-2 pl-2" remarkPlugins={[remarkGfm]}>{s.summary}</ReactMarkdown>
          </div>
        );
      }
    });
    return summaryContent;
  }
}
