interface IssueDetails {
  user: string;
  repository: string;
  issueNum: number;
}

export const parseURLForIssueDetails = (): IssueDetails => {
  const url = window.location.href;
  const splitURL = url.split("/");
  const issueDetails: IssueDetails = {
    user: splitURL[3],
    repository: splitURL[4],
    issueNum: parseInt(splitURL[6]),
  };
  return issueDetails;
};

export const getAuthorFromPage = (): string => {
  const authorDoc = document.querySelector(
    "#partial-discussion-header > div.d-flex.flex-items-center.flex-wrap.mt-0.gh-header-meta > div.flex-auto.min-width-0.mb-2 > a"
  );
  const author = authorDoc.textContent;
  return author;
};
