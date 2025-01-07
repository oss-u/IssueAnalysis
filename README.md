# Issue Analysis Backend
Backend for supporting browser extension for the `Issue Analysis` task. Runs on Python, FastAPI, Postgres.

Use Python version 3.7.10, since this is the Python runtime that was used for development. For local deployment, create a Python virtual environment and install the packages in `requirements.txt`. 

## Setting up the Database
Install [PostgreSQL](https://www.postgresql.org/). 
There are two ways to set up the schema. 

### Using Alembic
Create database and user. You can change the name of `db_user`. 
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
You can change the name of `db_user`. Run the following command to create the tables. Make sure to have the `schema.sql` in the path.
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
### Running the server
```bash
$ uvicorn api.app:app --host=0.0.0.0 --port=${PORT:-5000}
```

### Backend Branch
**Branch Name:** `backend`  
**Purpose:** Houses the server-side implementation and API endpoints  
**Key Components:**
- API routes and controllers
- Server configuration
- Request handling logic
- Database interactions (if applicable)
- API documentation

**Development Guidelines:**
- All API and server-side changes should be made in this branch
- Maintain clear API versioning
- Document all endpoints thoroughly
- Follow RESTful practices where applicable