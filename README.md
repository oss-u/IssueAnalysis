# Installation Instructions
There are three parts to this repo, the extension elements are located in the `extension` branch, the backend is located in the `backend` branch and the code and the model for the summarization engine is located in the `engine` branch. 

### To install the summarization engine
Use the `engine` branch. We deployed the engine on GCP, and the code reflects this deployment. However, if you want to deploy the content locally, then use the function to deploy. 

### To run the backend
Use the `backend` branch. 

### To install the extension
Ensure that you have Node v18. run `npm run install` to install the necessary packages. Then run `npm run build` to build the extension. The extension should build in `dist` folder. Once the extension is built, go to the extension tab of Chrome or a Chromium based browse, and select the `load unpacked` option and select the `dist` folder. The extension should be loaded. Note that if the extension is loaded before the backend and the summarization engine, it is possible for the plugin to crash. 

### Troubleshooting
Feel free to raise an issue, and tag (@avinashbhat) so that I receive a notification. Contributions are always welcome! 
