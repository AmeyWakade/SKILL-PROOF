# SkillProof — first vertical slice

SkillProof is an assessment catalog for students and developers. This repository contains **only the first working slice**:

- a Spring Boot API with a health check and an assessment browser
- a React page that lists sample assessments and shows their questions
- in-memory sample data (no PostgreSQL, no login, no AI)

Frontend and backend are separate folders. Talk between them is HTTP.

```
skillproof/
  backend/     Java 21 Spring Boot API
  frontend/    React + Vite (JavaScript)
```

## What this slice does

1. `GET /api/v1/health` returns `{ "status": "UP", "service": "skillproof" }`.
2. `GET /api/v1/assessments` returns three sample assessments.
3. `GET /api/v1/assessments/{id}` returns questions and options (no correct answers).
4. The React app shows API status, the catalog, and a detail page.

## Prerequisites

Install these on Windows before the commands below.

| Tool | Why | Check |
|---|---|---|
| JDK 21 or newer | Compiles and runs the API. JDK 25 is fine. | `java -version` |
| Maven 3.9+ | Optional. The repo includes `backend/mvnw.cmd`. | `.\mvnw.cmd -version` |
| Node.js 22 LTS | Builds and runs the React app. | `node -v` and `npm -v` |

Set `JAVA_HOME` if Maven cannot find Java. Example:

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-25.0.2"
```

## Local setup (exact commands)

Open **two** PowerShell windows. Paths assume the repo is `C:\Users\wakad\skillproof`.

### 1. Start the backend

```powershell
cd C:\Users\wakad\skillproof\backend
$env:JAVA_HOME = "C:\Program Files\Java\jdk-25.0.2"
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

Wait until the log shows Tomcat on port **8080**.

Check in a third window or browser:

```powershell
curl http://localhost:8080/api/v1/health
curl http://localhost:8080/api/v1/assessments
```

### 2. Start the frontend

```powershell
cd C:\Users\wakad\skillproof\frontend
npm install
npm test
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` to `http://localhost:8080`, so keep the backend running.

### 3. Production-style frontend build (optional)

```powershell
cd C:\Users\wakad\skillproof\frontend
npm run build
```

This writes static files to `frontend/dist`. It does not start a server.

## Important files

### Backend (`backend/`)

| File | Role |
|---|---|
| `pom.xml` | Maven build, Java 21, Spring Web + Test |
| `src/main/resources/application.yml` | Port 8080 and CORS for Vite |
| `src/main/java/com/skillproof/SkillProofApplication.java` | Spring Boot entry point |
| `health/api/HealthController.java` | HTTP for `/api/v1/health` |
| `health/application/HealthService.java` | Returns `UP` |
| `catalog/api/AssessmentController.java` | HTTP for assessments |
| `catalog/application/AssessmentService.java` | Maps domain objects to JSON |
| `catalog/domain/` | `Assessment`, `Question`, `Option`, `AssessmentRepository` |
| `catalog/infrastructure/InMemoryAssessmentRepository.java` | Sample data (this is the “database” for now) |
| `shared/ApiExceptionHandler.java` | Turns missing assessments into HTTP 404 |
| `src/test/java/...` | MockMvc and service tests |

Flow for one request: **Controller → Service → Repository**. The controller does not load sample data itself.

### Frontend (`frontend/`)

| File | Role |
|---|---|
| `package.json` | npm scripts: `dev`, `build`, `test` |
| `vite.config.js` | Dev server on 5173 and `/api` proxy |
| `src/main.jsx` | Mounts React |
| `src/App.jsx` | Header, health badge, hash routes |
| `src/pages/AssessmentList.jsx` | Catalog |
| `src/pages/AssessmentDetail.jsx` | Questions |
| `src/api/client.js` | `fetch` helpers |
| `src/api/client.test.js` | Client tests with a mocked `fetch` |

## Commands cheat sheet

```powershell
# backend tests + jar
cd C:\Users\wakad\skillproof\backend
$env:JAVA_HOME = "C:\Program Files\Java\jdk-25.0.2"
.\mvnw.cmd test
.\mvnw.cmd package
java -jar target\skillproof-backend-0.1.0-SNAPSHOT.jar

# frontend
cd C:\Users\wakad\skillproof\frontend
npm install
npm test
npm run dev
npm run build
```

## Intentionally not in this slice

- Spring Security / login
- PostgreSQL, JPA, Flyway
- Scoring, attempts, public profiles
- AI features
- Docker

Those belong in later slices.
