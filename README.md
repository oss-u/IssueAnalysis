# SUMMIT
This repository contains the code for the CSCW 2023 paper [SUMMIT: Scaffolding Open Source Software Issue Discussion Through Summarization](https://dl.acm.org/doi/10.1145/3610088).

Other relevant links: [arXiv](https://arxiv.org/abs/2308.02780), [CSCW Blog Post](https://medium.com/acm-cscw/navigating-open-source-software-discussions-with-summit-e96a5fd096cf). 

## Code
The code is divided into three branches: extension, backend and engine. 
- [`extension` branch](https://github.com/oss-u/IssueAnalysis/tree/extension) contains the code for the extension user interface which works with the GitHub Issues page for Chromium based browsers.
- [`backend` branch](https://github.com/oss-u/IssueAnalysis/tree/backend) contains the code for a Python backend which stores the summaries and other metadata in a Postgres database.
- [`engine` branch](https://github.com/oss-u/IssueAnalysis/tree/engine) contains the code and dataset for training the summarization model and inference service.

`engine` should be installed first, followed by `backend` and then `extension`.

## Prototyping
The descriptions for each of the workflows is described and tracked in GitHub issues. __The included Framer links need an account to access.__

#### Tool Navigation Workflows
1. **See all sentences of a certain type** ([Framer](https://framer.com/projects/Workflows--uaQXHkOrhF2AM8bJUV5G-dw8tf?node=aZC7ECwVT), [GitHub](https://github.com/oss-u/IssueAnalysis/issues/3))

2. **See summarized comments of a subsummary**
([Framer](https://framer.com/projects/Workflows--uaQXHkOrhF2AM8bJUV5G-dw8tf?node=a3yJDj5qI), [GitHub](https://github.com/oss-u/IssueAnalysis/issues/4))

3. **See the definition of an information type** ([Framer](https://framer.com/share/Workflows--gRfRfloFxUTpAkZVUEE2/C6Ob9B7Xy), [GitHub](https://github.com/oss-u/IssueAnalysis/issues/5))

#### Summary Contribution Workflows
4. **Post a new comment** ([Framer](https://framer.com/projects/Workflows--uaQXHkOrhF2AM8bJUV5G-dw8tf?node=GCdpBw6xC), [GitHub](https://github.com/oss-u/IssueAnalysis/issues/14)): Also see `10. Top level info type summary gets automatically added` below. 

5. **Edit the top level summary** ([Framer](https://framer.com/projects/Workflows--uaQXHkOrhF2AM8bJUV5G-dw8tf?node=EekIfJ7VY), [GitHub](https://github.com/oss-u/IssueAnalysis/issues/9))

6. **Edit an existing subsummary** ([Framer](https://framer.com/projects/Workflows--uaQXHkOrhF2AM8bJUV5G-dw8tf?node=g1wVVVzAm), [GitHub](https://github.com/oss-u/IssueAnalysis/issues/10))

7. **Edit existing highlights (information types)** ([Framer](https://framer.com/projects/Workflows--uaQXHkOrhF2AM8bJUV5G-dw8tf?node=Dy_xhO5uy), [GitHub](https://github.com/oss-u/IssueAnalysis/issues/11))

8. **Generate a subsummary of a group of unsummarized comments without posting a new comment** ([Framer](https://framer.com/projects/Workflows--uaQXHkOrhF2AM8bJUV5G-dw8tf?node=h8mANAX3h), [GitHub](https://github.com/oss-u/IssueAnalysis/issues/1))

9. **New info type is added to top level summary** ([Framer](https://framer.com/projects/Workflows--uaQXHkOrhF2AM8bJUV5G-dw8tf?node=ScUVzPFdZ), [GitHub](https://github.com/oss-u/IssueAnalysis/issues/13))

10. **Top level info type summary gets automatically added** ([Framer](https://framer.com/projects/Workflows--uaQXHkOrhF2AM8bJUV5G-dw8tf?node=GCdpBw6xC), [GitHub](https://github.com/oss-u/IssueAnalysis/issues/14))

11. **Top level summary has a sentence that comes from comments that are edited/removed** ([Framer](https://framer.com/share/Workflows--gRfRfloFxUTpAkZVUEE2/ONcho1chM), [GitHub](https://github.com/oss-u/IssueAnalysis/issues/23))

12. **Edit existing highlights by clicking comment** ([Framer](https://framer.com/share/Workflows--gRfRfloFxUTpAkZVUEE2/MG_cWEWeP), [GitHub](https://github.com/oss-u/IssueAnalysis/issues/24))

