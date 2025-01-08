# Issue Analysis Backend
The `backend` branch has the code for saving the automated and human created summaries. Runs on Python, FastAPI, Postgres. 

Use Python version 3.7.10, since this is the Python runtime that was used for development. For local deployment, create a Python virtual environment and install the packages in `requirements.txt`. 

## Setting up the Database
Install [PostgreSQL](https://www.postgresql.org/). 
There are two ways to set up the schema. 

### Using Alembic
Create database and user. You can change `db_user` to a different user name if needed. 
```bash
psql postgres

CREATE DATABASE summit;
CREATE USER db_user WITH PASSWORD '<password>';
GRANT ALL PRIVILEGES ON DATABASE summit TO db_user;
```

Create a `.env` file in the project root.
```bash
DATABASE_URL=postgresql://db_user:<password>@localhost:5432/summit
```

Run the migrations. Check that the `alembic/env.py` file is properly configured to find the `.env` file. Then, generate and run migrations.
```bash
alembic revision --autogenerate -m "Initial migration"

alembic upgrade head
```

### Using `schema.sql`
You can change `db_user` to a different user name if needed. Run the following command to create the tables. Make sure to have the `schema.sql` in the path.
```bash
psql -U db_user -d summit_db -f schema.sql
```
To check if all the tables are created, first log in
```bash
psql -U db_user -d summit_db
```
then run,
```sql
\dt
```

### Creating `.env` file
Once the database is created, add the following line to `.env` file. The `.env` file should be in the root folder.
```
DATABASE_URL=postgresql://db_user:<password>@localhost:5432/summit
```

## Running the server
Make sure to run the summarization engine, which is available in the `engine` branch. Once the service is running, add the service endpoint to the `.env` file with `BETA_SUMMARY_SERVICE_ENDPOINT=`.

Next, start the backend server on port 5000. 
```bash
$ uvicorn api.app:app --host=0.0.0.0 --port=${PORT:-5000}
```