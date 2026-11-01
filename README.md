# SkillProof

SkillProof helps students and developers show what they can do through practical skill assessments and shareable proof of their work. This fresh MVP starts with an assessment catalog backed by a local database.

## Included
- Spring Boot REST API with health, assessment list, search/filter, and detail endpoints
- H2 file database and JDBC-backed login sessions, so accounts and login survive backend restarts
- Sample assessments seeded automatically when the API starts
- React + Vite frontend with the Proving Ground learning hub, the existing assessment catalog, searchable notes, and responsive layout
- Account registration and login, with BCrypt password hashes, server sessions, and CSRF protection
- Editable profile fields and account-specific saved assessments
- Career Workspace with an editable career goal, self-reported skill list, simple roadmap, and recommended next action
- Private-by-default profile sharing controls for career details, skills, and individual projects; the public profile and signed-in preview use the same server-filtered data
- Project title, description, self-reported skills, Planned/In Progress/Completed status, and optional GitHub/demo links
- Account-specific practice score history with saved per-question answers and explanations, clearly marked as practice rather than verified proof
- Career practice tracks for backend, frontend, data, security, cloud/DevOps, UI/UX, product, and QA
- Opt-in public portfolios with career-path practice badges and a copyable resume link
- Gemini-powered AI Career Coach chat, with provider credentials kept on the backend
- GitHub public repository import to prefill portfolio project details
- Code playground for Java, Python, JavaScript, C, and C++ using JDoodle's compiler API
- Five saved color palettes: Meadow, Ocean, Lavender, Sunset, and Midnight

## Practice review and privacy

Signed-in quiz results save the score and a private question-by-question review to the learner's account. Open **My proof** to review answers after signing in again. Older attempts created before this review was added keep their score and date, but do not have saved answer details. Public profiles continue to show only the existing opt-in achievement summary; the private answer review is not included in public profile responses. Practice scores are learning records, not verified certifications.

## Proving Ground

Open **Proving Ground** from the sidebar for five learning areas:

- **MCQs** takes you to the existing assessment catalog and its existing practice, save, and result-history flow.
- **Quizzes** offers short, topic-grouped checks for Java collections, React state, and HTTP APIs. These are distinct from the longer catalog assessments, but signed-in quiz attempts reuse the existing `/api/v1/practice-attempts` persistence and appear under their related assessment in **My proof**. The saved answer review prefixes quiz questions with the quiz title. Guest results are available only in the current session.
- **Coding Arena** contains 12 original Java 21 problems across arrays, strings, hash maps, sorting, binary search, stacks, queues, recursion, linked lists, trees, graphs, and dynamic programming. Search and filter by topic, difficulty, and completion status. Each problem includes constraints, examples, starter code, progressive hints, and an approach/complexity explanation.
- Java samples and hidden-test submissions use the existing authenticated backend JDoodle integration. Credentials remain on the server. The backend keeps hidden test inputs and expected outputs out of browser responses; one submit runs two JDoodle cases, while each sample run sends one request per example. Provider quotas apply. Sample results are practice feedback and do not mark a problem solved; a problem becomes solved in the browser only after every hidden test passes.
- Coding drafts, attempt history, completion status, and daily goal are stored in this browser's `localStorage`, separate from account assessment history. They do not sync to another browser or represent a verified credential. Previous Coding prompts remain in the Arena, and their existing draft keys are read without deleting them; those legacy prompts are preserved but not executable by the Java runner.
- The Arena uses an accessible standard Java textarea instead of an editor dependency. Code execution is never performed in the browser or the Spring process; it is sent to JDoodle through the backend. Sign in and configure the backend JDoodle credentials before running code. If the provider is unconfigured, browsing and editing drafts still work and the UI reports that state.
- **Notes** contains searchable, bundled topic notes with links into the related quiz or coding challenge.
- **Practice** provides repeatable short sets. Each signed-in run is a separate private attempt in the existing account history; guest runs are session-only.

MCQ, quiz, notes, and practice content remain bundled in `frontend/src/provingGroundContent.js`. Java Arena problems are bundled separately in `frontend/src/codingArenaContent.js`; hidden cases are held in the authenticated `POST /api/v1/coding-arena/{problemId}/submit` backend route. This adds no database tables, authentication mechanism, or npm dependency. Local setup is unchanged: start the Spring Boot API and Vite frontend using the steps below. Existing JDoodle setup instructions below apply to the Arena too.

## Requirements
- JDK 21+
- Maven 3.9+
- Node.js 22.12+ with npm

## Build and test

```powershell
cd backend
mvn test
cd ..\frontend
npm test
npm run build
```

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

To enable the code playground on an existing Render service, open **SKILL-PROOF > Environment**, add `JDOODLE_CLIENT_ID` and `JDOODLE_CLIENT_SECRET` with the values from your JDoodle API account, then save the changes and wait for Render to redeploy. Return to the playground and select **I added the keys and restarted — check again**. The backend status should report the compiler as enabled. JDoodle may enforce account-specific usage limits.

### Free-tier notes

Render's free web service sleeps after 15 minutes without traffic and may take about a minute to wake up. Its local files disappear on restarts and deploys, which is why this setup uses PostgreSQL instead of H2 for online accounts and sessions. Render's own free Postgres databases expire after 30 days, so this guide uses Neon for the database; check the providers' current limits before relying on the site for important data. Free hosting is suitable for a demo, not a production service.

## API
- `GET /api/v1/health` — API health
- `GET /api/v1/assessments` — list; optional `?q=java` and `?skill=Java`
- `GET /api/v1/assessments/{id}` — assessment details
- `POST /api/v1/auth/register` and `POST /api/v1/auth/login` — account access
- `GET /api/v1/auth/me` and `POST /api/v1/auth/logout` — current persistent session
- `GET/PUT /api/v1/profile` — read or update career details and explicit public-sharing settings
- `GET /api/v1/profile/preview` — signed-in preview of the same filtered projection returned publicly
- `GET /api/v1/saved-assessments` and `POST/DELETE /api/v1/saved-assessments/{assessmentId}` — saved challenges
- `GET/POST /api/v1/practice-attempts` — practice history
- `GET /api/v1/public-profiles/{userId}` — opt-in public projection containing only selected career details, skills, and projects; private practice history is excluded
- `GET/POST /api/v1/portfolio-projects`, `PUT/DELETE /api/v1/portfolio-projects/{id}` — manage your own projects; updates are owner-scoped
- `GET /api/v1/ai/status` and `POST /api/v1/ai/chat` — AI Career Coach; requires a backend `GEMINI_API_KEY`
- `GET /api/v1/integrations/github/repository?url=...` — import metadata for a public GitHub repository
- `GET /api/v1/compiler/status` and `POST /api/v1/compiler/run` — multi-language playground; requires backend JDoodle credentials

Accounts, saved assessments, practice history, and sessions are stored under `backend/data/` and survive backend restarts. Back up that directory if you want to preserve local data. Practice scores are self-reported by this MVP and are not verified credentials.

## Career Workspace and profile privacy

After signing in, open **Career workspace** to edit your goal and selected skills, see a three-step roadmap, and add projects. Projects support Planned, In Progress, and Completed status, an optional GitHub link, an optional demo link, and an optional existing project link. The app only stores what you enter; it does not invent project descriptions or verify skills. Every score and selected skill is labeled as self-reported practice or profile information, not a verified credential.

Public profiles start disabled. Career details, selected skills, and each project also start hidden. To publish a profile, enable **Enable my public profile**, then explicitly select career details and/or skills in the workspace. Each project has its own sharing checkbox. **Preview profile** calls the backend's filtered profile projection, the same projection used by public links. The public API does not return email addresses, password hashes, or practice history. Keep your profile disabled if you do not want a public link to work.

Career details and projects use the app's configured relational database: the default local setup stores them in the H2 files under `backend/data/`; when `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD` are set, they are stored in PostgreSQL instead. Schema changes are currently applied by Hibernate's `ddl-auto: update` setting rather than Flyway migrations, so back up the database before upgrading a deployed instance. Existing project rows keep their existing project link and are treated as Planned and private unless you change those choices.
