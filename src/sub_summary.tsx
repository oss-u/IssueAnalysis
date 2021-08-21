import React from "dom-chef";

import "./style.scss"
import { comment_parser } from "./utils/comment_parser";
// import { XIcon } from '@primer/octicons-react';

const discussion_bucket = document.querySelector("#discussion_bucket div");

// TODO: Add generated summary box

// configuring css
const children = discussion_bucket.children;
children[0].classList.remove("col-md-9");
children[0].classList.add("col-md-7");
children[1].classList.remove("col-md-3");
children[1].classList.add("col-md-2");

const handleAddComments = () => {
  // add plus button to all comments
  const timeline_headers = document.querySelectorAll('div.timeline-comment-header:not(.summary-sidebar-header)');
  timeline_headers.forEach(header => {
    const comment_id = header.querySelector('h3 a.js-timestamp')['href']
    console.log(comment_id);
    header.prepend(PlusButton({comment_id: comment_id}));
  })
}

const summary_sidebar = (
  <div className="col-md-3">
    <div className="timeline-comment-header summary-sidebar-header p-2">
      <div className="timeline-comment-actions flex-shrink-0">
        <button className="btn btn-sm btn-primary m-0 ml-2 ml-md-2" onClick={handleAddComments}>Add</button>
      </div>
      <h3 className="timeline-comment-header-text f5 text-normal"><strong>Summaries</strong></h3>
    </div>
  </div>
);

// collection of comments present
const comment_tags = document.querySelectorAll('div.TimelineItem.js-comment-container');
const comments = [];
comment_tags.forEach(tag => {
  comments.push(comment_parser(tag))
})
console.log(comments);

const curr_selected_comments = [];

const handleSelectComment = comment_id => {
  // console.log(`[handleSelectComment] ${comment_id}`)
  const comment = comments.find(c => c.id === comment_id);
  curr_selected_comments.push(comment);
  
  if (summary_sidebar.querySelector('.comment_block') === null) {
    summary_sidebar.append(
      <div className='comment_block p-2'>
        <div className='items'></div>
      </div>
    );
  }

  summary_sidebar.querySelector('.comment_block div.items').append(Comment({comment: comment}))

  if (summary_sidebar.querySelector('.comment_block button') === null && curr_selected_comments.length > 0) {
    summary_sidebar.querySelector('.comment_block').append(
      <div className="gen-summary-btn">
        <button className="btn btn-sm btn-primary m-0 ml-2 ml-md-2">Generate Summary</button>
      </div>
    );
  }
}

function Comment(props) {
  const comment = (
    <>
      <h3 className="f6">
        <a className="Link--primary" href={ props.comment.author.profile }>{ props.comment.author.uname }</a>
      </h3>
      <p></p>
    </>
  );
  comment.querySelector('p').innerHTML = props.comment.shortBody;
  return comment;
}

function CommentBlock(props) {
  const comments_list = [];
  props.comments.forEach(comment => {
    comments_list.push(Comment({comment: comment}));
  });
  
  const comment_block = (
    <div className="comment_block">
      { comments_list }
    </div>
  );

  return comment_block;
}

function PlusButton(props) {
  return (
    <button
      className="btn btn-sm btn-primary m-0 ml-2 ml-md-2 plus-button"
      onClick={() => handleSelectComment(props.comment_id)}
    >+</button>
  )
}

discussion_bucket.prepend(summary_sidebar);
