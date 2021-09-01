class Author {
  uname: string;
  createdOn: string;
  profile: string;

  constructor(u, c, p) {
    this.uname = u;
    this.createdOn = c;
    this.profile = p;
  }
}

class Comment {
  body: string;
  id: string;
  author: Author;
  bodyText: string;

  constructor(id, b, bt, a) {
    this.id = id;
    this.body = b;
    this.author = a;
    this.bodyText = bt;
  }

  get shortBody(): string {
    const n = 100;
    return (this.bodyText.length > n) ? this.bodyText.substr(0, n-1) + '&hellip;' : this.bodyText;
  }
}

export function comment_parser(comment: Element) {
  const a_profile = (<HTMLImageElement>comment.querySelector('img.avatar')).src;
  const a_uname = comment.querySelector('a.author').textContent;
  const a_createdOn = comment.querySelector('a.js-timestamp relative-time')['title'];
  const c_body = Array.from(comment.querySelectorAll('td.comment-body p')).map(elem => (<HTMLElement>elem).innerHTML).join(' ');
  const c_bodytext = Array.from(comment.querySelectorAll('td.comment-body p')).map(elem => (<HTMLElement>elem).innerText).join(' ');
  const c_id = comment.querySelector('a.js-timestamp')['href'];

  const author = new Author(a_uname, a_createdOn, a_profile);

  return new Comment(c_id, c_body, c_bodytext, author);
}