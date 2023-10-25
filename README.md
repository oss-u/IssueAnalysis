# Issue Analysis Backend

Backend for supporting browser extension for the `Issue Analysis` task. Runs on Python, FastAPI, Postgres.

<!-- Deployment Link for User Studies: [Heroku](https://issue-analysis-backend.herokuapp.com/)

API [docs](https://issue-analysis-backend.herokuapp.com/docs/). -->

For local deployment, create a Python virtual environment and install the packages in requirements.txt. Use python-3.7.10, since this is the Python runtime that was used for development. 

The attached Procfile lets you directly host the backend on Heroku. For running on your local, use
```bash
$ uvicorn api.app:app --host=0.0.0.0 --port=${PORT:-5000}
```