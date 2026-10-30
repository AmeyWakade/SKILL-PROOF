# SkillProof

SkillProof helps students and developers show what they can do through practical skill assessments and shareable proof of their work. This fresh MVP starts with an assessment catalog backed by a local database.

## Included
- Spring Boot REST API with health, assessment list, search/filter, and detail endpoints
- H2 file database and JDBC-backed login sessions, so accounts and login survive backend restarts
- Sample assessments seeded automatically when the API starts
- React + Vite frontend with search, filters, challenge details, practice quizzes, and responsive layout
- Account registration and login, with BCrypt password hashes, server sessions, and CSRF protection
- Editable profile fields and account-specific saved assessments
- Account-specific practice score history, clearly marked as practice rather than verified proof
- Career practice tracks for backend, frontend, data, security, cloud/DevOps, UI/UX, product, and QA
- Opt-in public portfolios with career-path practice badges and a copyable resume link
- Gemini-powered AI Career Coach chat, with provider credentials kept on the backend
- GitHub public repository import to prefill portfolio project details
- Code playground for Java, Python, JavaScript, C, and C++ using JDoodle's compiler API
- Five saved color palettes: Meadow, Ocean, Lavender, Sunset, and Midnight

## Requirements
- JDK 21+
- Maven 3.9+
- Node.js 22.12+ with npm

Docker is optional. You can run the MVP with H2 without Docker or administrator access.

## Run on Windows
Double-click `start-backend.bat` and `start-frontend.bat` to start the two parts in separate windows. Keep both windows open while using the site. The frontend launcher installs packages if needed. You can also start them manually as shown below.

### 1. Start the API (persistent local H2 database)

```powershell
cd backend
mvn spring-boot:run
```

The API starts at `http://localhost:8080` and seeds sample assessments on first startup. H2 database files and session records are stored under `backend/data/` and are ignored by Git. Login cookies last up to 14 days, unless you sign out or clear browser cookies.

### 2. Start the web app

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to the backend.

### Configure the AI Career Coach (optional)

Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/app/apikey). In the same PowerShell window used to start the backend, set the key before running Maven:

```powershell
$env:GEMINI_API_KEY = "your-key"
$env:GEMINI_MODEL = "gemini-3.8-flash"
mvn spring-boot:run
```

The key stays in the backend process and is not sent to the browser. The chat sends the messages a user chooses to submit to Google Gemini; the chat panel tells users this. AI chat is unavailable until a key is configured. Review the provider's current privacy and pricing terms before using it with personal student information.

### Configure the code playground (optional)

Create JDoodle Compiler API credentials from the [JDoodle API page](https://www.jdoodle.com/docs/api). The free Compiler API plan currently gives 20 executions per day; each run uses a credit. JDoodle receives submitted source code and input, so do not run code containing secrets or private data. Set these in the same PowerShell window used to start the backend:

```powershell
$env:JDOODLE_CLIENT_ID = "your-client-id"
$env:JDOODLE_CLIENT_SECRET = "your-client-secret"
mvn spring-boot:run
```

Credentials stay on the backend. The compiler supports Java, Python 3, Node.js, C, and C++ 17. See the [JDoodle API credit limits](https://www.jdoodle.com/docs/api/credits).

## Use PostgreSQL instead (optional)
If Docker is available, start the included database with `docker compose up -d`. Then set these variables in the same PowerShell window before starting the backend:

```powershell
$env:DATABASE_URL = "jdbc:postgresql://localhost:5432/skillproof"
$env:DATABASE_USERNAME = "skillproof"
$env:DATABASE_PASSWORD = "skillproof_dev"
mvn spring-boot:run
```

## Deploy online for a free demo (Render + Neon)

The app can run as one Docker web service: Spring Boot serves both the API and the built React frontend. Use a hosted PostgreSQL database because the local H2 files are not durable on free web hosting.

### 1. Put the project in a GitHub repository

This folder is not currently a Git repository. Create an empty repository on GitHub, then open PowerShell in this project folder and run the following commands. Replace the URL with your new repository URL:

```powershell
git init
git add .
git commit -m "Prepare SkillProof for deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Keep the repository private if you do not want the source code to be public. Do not commit API keys, passwords, or local database files.

### 2. Create a PostgreSQL database on Neon

Create a Neon project and copy its connection details. In the connection string, change the prefix `postgresql://` to `jdbc:postgresql://`, and add `?sslmode=require` if the URL does not already include SSL options. Use the resulting JDBC URL for `DATABASE_URL`; keep the database username and password in their own environment variables.

### 3. Deploy on Render

1. Create or sign in to a Render account and choose **New > Web Service**.
2. Connect the GitHub repository you created in step 1.
3. Choose **Docker** as the runtime, set the Dockerfile path to `Dockerfile`, and choose the Free instance for a personal demo.
4. Add these environment variables in the Render service settings:

   - `DATABASE_URL` — the Neon JDBC URL, starting with `jdbc:postgresql://`
   - `DATABASE_USERNAME` — the Neon database username
   - `DATABASE_PASSWORD` — the Neon database password
   - `GEMINI_API_KEY` — optional; only needed for the AI Career Coach
   - `JDOODLE_CLIENT_ID` and `JDOODLE_CLIENT_SECRET` — optional; only needed for the code playground

5. Create the service and wait for the first deploy to finish. Open the generated `onrender.com` address. You can check the API at `/api/v1/health`.

Keep credentials in Render's environment settings, not in GitHub or in frontend variables. After the first deploy, test registration, sign-in, profile saving, and a page refresh.

### Free-tier notes

Render's free web service sleeps after 15 minutes without traffic and may take about a minute to wake up. Its local files disappear on restarts and deploys, which is why this setup uses PostgreSQL instead of H2 for online accounts and sessions. Render's own free Postgres databases expire after 30 days, so this guide uses Neon for the database; check the providers' current limits before relying on the site for important data. Free hosting is suitable for a demo, not a production service.

## API
- `GET /api/v1/health` — API health
- `GET /api/v1/assessments` — list; optional `?q=java` and `?skill=Java`
- `GET /api/v1/assessments/{id}` — assessment details
- `POST /api/v1/auth/register` and `POST /api/v1/auth/login` — account access
- `GET /api/v1/auth/me` and `POST /api/v1/auth/logout` — current persistent session
- `GET/PUT /api/v1/profile` — read or update your profile
- `GET /api/v1/saved-assessments` and `POST/DELETE /api/v1/saved-assessments/{assessmentId}` — saved challenges
- `GET/POST /api/v1/practice-attempts` — practice history
- `GET /api/v1/public-profiles/{userId}` — opt-in public portfolio, achievements, and practice badges
- `GET /api/v1/portfolio-projects`, `POST /api/v1/portfolio-projects`, and `DELETE /api/v1/portfolio-projects/{id}` — manage showcase projects
- `GET /api/v1/ai/status` and `POST /api/v1/ai/chat` — AI Career Coach; requires a backend `GEMINI_API_KEY`
- `GET /api/v1/integrations/github/repository?url=...` — import metadata for a public GitHub repository
- `GET /api/v1/compiler/status` and `POST /api/v1/compiler/run` — multi-language playground; requires backend JDoodle credentials

Accounts, saved assessments, practice history, and sessions are stored under `backend/data/` and survive backend restarts. Back up that directory if you want to preserve local data. Practice scores are self-reported by this MVP and are not verified credentials.
