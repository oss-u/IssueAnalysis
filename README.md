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
 - Low Fidelity Prototype - [Framer](https://framer.com/projects/Workflows--uaQXHkOrhF2AM8bJUV5G-dw8tf?node=CyT28blr2)
 
 - Workflow Description - [Google Docs](https://docs.google.com/document/d/1woU-rZdAkzUoJN3JxoqpijYXmlQweyoaSTOqeqH54HU/edit#heading=h.g7m8uvm3vuuu)
