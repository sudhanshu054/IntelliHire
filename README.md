# IntelliHire

IntelliHire is an AI-powered hiring and career workspace for job seekers and recruiters. It combines resume analysis, role recommendations, coding test practice, career roadmaps, recruiter job posting, candidate applications, email OTP flows, and Google OAuth login in a single Spring Boot + React application.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Run Locally](#run-locally)
- [Docker](#docker)
- [Azure Deployment](#azure-deployment)
- [Google OAuth Setup](#google-oauth-setup)
- [API Overview](#api-overview)
- [Troubleshooting](#troubleshooting)

## Features

- **Authentication**: email/password auth, JWT cookie sessions, OTP email verification, password reset, and Google OAuth login.
- **Resume analysis**: upload resume documents, extract content, score resume quality, and generate improvement feedback.
- **Career roadmap**: generate AI-assisted role/career learning paths.
- **Coding test practice**: generate coding questions and submit answers for evaluation.
- **Job seeker workflows**: browse jobs, apply to roles, and track submitted applications.
- **Recruiter workflows**: post jobs, view recruiter jobs, and inspect applicants for a job.
- **Email delivery**: Brevo integration for OTP and reset email templates.
- **Single-container deployment**: React/Vite frontend is built into Spring Boot static resources and served by the backend.

## Tech Stack

### Backend

- Java 21
- Spring Boot 3.5.5
- Spring Web
- Spring Security
- Spring Data JPA
- Spring OAuth2 Client
- Thymeleaf email templates
- JWT via `jjwt`
- MySQL in production
- H2 for local/default fallback

### Frontend

- React 19
- Vite 7
- React Router
- React Toastify
- CSS modules/assets

### Integrations

- Groq or xAI-compatible chat completion API via `GEN_KEY`
- Adzuna jobs API
- Brevo transactional email API
- Google OAuth
- Azure App Service for Containers
- Azure Container Registry
- Azure Database for MySQL Flexible Server

## Architecture

```text
Browser
  |
  | HTTPS
  v
Azure App Service for Containers
  |
  | runs Docker image
  v
Spring Boot app :8080
  |
  | serves static React build
  | exposes REST APIs
  | stores auth/application/job/resume data
  v
Azure Database for MySQL Flexible Server

External APIs:
  - Google OAuth
  - Brevo
  - Groq/xAI
  - Adzuna
```

The root `Dockerfile` performs a multi-stage build:

1. Builds the React/Vite frontend.
2. Copies `frontend/dist` into `src/main/resources/static`.
3. Builds the Spring Boot JAR.
4. Runs the app on Java 21 and exposes port `8080`.

## Project Structure

```text
.
├── Dockerfile
├── pom.xml
├── docs/
│   └── azure-deployment.md
├── scripts/
│   └── azure-provision.ps1
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
└── src/
    ├── main/
    │   ├── java/com/ai/Resume/analyser/
    │   │   ├── configuration/
    │   │   ├── controller/
    │   │   ├── jwt/
    │   │   ├── mail/
    │   │   ├── model/
    │   │   ├── repository/
    │   │   └── service/
    │   └── resources/
    │       ├── application.properties
    │       ├── static/
    │       └── templates/
    └── test/
```

## Prerequisites

- Java 21
- Maven Wrapper, included as `mvnw` / `mvnw.cmd`
- Node.js 22 or compatible modern Node version
- npm
- Docker Desktop, for container builds
- Azure CLI, for Azure deployment
- MySQL database for production

## Environment Variables

The app reads configuration from `src/main/resources/application.properties`, with local-safe defaults where possible.

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | Runtime port. Defaults to `8080`. |
| `SPRING_DATASOURCE_URL` | Production | JDBC URL. Use MySQL in Azure, H2 locally if omitted. |
| `SPRING_DATASOURCE_USERNAME` | Production | Database username. |
| `SPRING_DATASOURCE_PASSWORD` | Production | Database password. |
| `SPRING_DATASOURCE_DRIVER_CLASS_NAME` | Production | MySQL driver: `com.mysql.cj.jdbc.Driver`. |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | No | Schema mode. Current deployment uses `update`. |
| `SPRING_JPA_HIBERNATE_DIALECT` | No | MySQL dialect if explicitly configured. |
| `GEN_KEY` | AI features | Groq or xAI API key. |
| `ADZUNA_APPLICATION_ID` | Job API | Adzuna application ID. |
| `ADZUNA_APPLICATION_API_KEY` | Job API | Adzuna API key. |
| `BREVO_API_KEY` | Email | Brevo transactional email API key. |
| `GOOGLE_CLIENT_ID` | Google login | Google OAuth client ID. |
| `GOOGLE_CLIENT_SECRET` | Google login | Google OAuth client secret. |
| `WEBSITES_PORT` | Azure | Azure App Service container port, set to `8080`. |
| `WEBSITES_CONTAINER_START_TIME_LIMIT` | Azure | Optional longer startup window for Spring Boot. |

Do not commit real secret values to the repository.

## Run Locally

### Backend

From the repository root:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend starts at:

```text
http://localhost:8080
```

If no MySQL environment variables are provided, the app uses the default H2 in-memory configuration from `application.properties`.

### Frontend Dev Server

From `frontend/`:

```powershell
npm install
npm run dev
```

The Vite dev server runs at:

```text
http://localhost:5173
```

In development, the frontend detects port `5173` and sends API calls to the backend on port `8080`.

### Production-Style Local Build

To build the React app into Spring Boot static resources through Docker:

```powershell
docker build -t intellihire .
docker run --rm -p 8080:8080 intellihire
```

Open:

```text
http://localhost:8080
```

## Docker

The included `Dockerfile` builds the full app into one image.

```powershell
docker build -t intellihire .
docker run --rm -p 8080:8080 intellihire
```

For Azure Container Registry:

```powershell
az acr login --name <acr-name>
docker build -t <acr-login-server>/intellihire:latest .
docker push <acr-login-server>/intellihire:latest
```

## Azure Deployment

Current deployment target:

```text
https://intellihire-app-72307.azurewebsites.net
```

Current Azure resources:

| Resource | Name |
| --- | --- |
| Resource group | `intellihire-rg` |
| App Service | `intellihire-app-72307` |
| App Service Plan | `intellihire-plan` |
| Container Registry | `intellihireacr72307` |
| MySQL Flexible Server | `sudhanshusql` |
| MySQL Database | `intellihire` |

See `docs/azure-deployment.md` for the full Azure walkthrough and provisioning notes.

### Required App Service Settings

In Azure Portal, go to:

```text
App Service > intellihire-app-72307 > Settings > Environment variables
```

Set these values:

```text
WEBSITES_PORT=8080
PORT=8080
WEBSITES_CONTAINER_START_TIME_LIMIT=1800
SPRING_DATASOURCE_URL=jdbc:mysql://sudhanshusql.mysql.database.azure.com:3306/intellihire?sslMode=REQUIRED
SPRING_DATASOURCE_USERNAME=<mysql-admin-user>
SPRING_DATASOURCE_PASSWORD=<mysql-password>
SPRING_DATASOURCE_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_HIBERNATE_DIALECT=org.hibernate.dialect.MySQLDialect
GEN_KEY=<groq-or-xai-key>
ADZUNA_APPLICATION_ID=<adzuna-app-id>
ADZUNA_APPLICATION_API_KEY=<adzuna-api-key>
BREVO_API_KEY=<brevo-api-key>
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
```

Restart the App Service after changing environment variables.

## Google OAuth Setup

In Google Cloud Console:

```text
APIs & Services > Credentials > OAuth 2.0 Client IDs
```

Add this authorized redirect URI:

```text
https://intellihire-app-72307.azurewebsites.net/login/oauth2/code/google
```

Add this authorized JavaScript origin:

```text
https://intellihire-app-72307.azurewebsites.net
```

If the OAuth consent screen is in testing mode, add each test Gmail account under:

```text
APIs & Services > OAuth consent screen > Test users
```

## API Overview

### Authentication

Base path:

```text
/resumeAnalyser/entry/v1
```

Endpoints:

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/register` | Register a user. |
| `POST` | `/verifyEmail` | Verify registration OTP. |
| `POST` | `/login` | Login with email/password. |
| `POST` | `/resetOtpSent` | Send password reset OTP. |
| `POST` | `/verifyResetOtp` | Verify reset OTP. |
| `POST` | `/resetPassword` | Reset password. |

Google OAuth starts at:

```text
/oauth2/authorization/google
```

### Core Resume/User Services

Base path:

```text
/resumeAnalyserCore/service/v1
```

Endpoints:

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/extract` | Upload/extract resume data. |
| `GET` | `/lastReport` | Fetch latest resume report. |
| `POST` | `/logout` | Clear login session. |
| `POST` | `/deleteAccount` | Delete current account. |
| `POST` | `/isValid` | Validate current session. |

### Career Roadmap

Base path:

```text
/resumeAnalyserCore/service/v1/career
```

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/roadmap` | Generate career roadmap. |

### Coding Tests

Base path:

```text
/resumeAnalyserCore/service/v1/codingTest
```

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/generate` | Generate coding test. |
| `POST` | `/submit` | Submit coding test answer. |

### Jobs and Applications

Base path:

```text
/resumeAnalyserCore/service/v1
```

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/recruiter/jobs` | Recruiter creates a job. |
| `GET` | `/recruiter/jobs` | Recruiter lists own jobs. |
| `GET` | `/jobs` | Job seeker lists available jobs. |
| `GET` | `/jobs/applied` | Job seeker lists applied jobs. |
| `POST` | `/jobs/{jobId}/apply` | Job seeker applies to a job. |
| `GET` | `/recruiter/jobs/{jobId}/applications` | Recruiter views applicants. |

## Troubleshooting

### Google OAuth `redirect_uri_mismatch`

Add the exact redirect URI from the Google error screen to the OAuth client:

```text
https://intellihire-app-72307.azurewebsites.net/login/oauth2/code/google
```

Make sure it uses `https`, has no trailing slash, and belongs to the same OAuth client ID configured in Azure.

### App Service returns 503 or times out

Download logs:

```powershell
az webapp log download `
  --resource-group intellihire-rg `
  --name intellihire-app-72307 `
  --log-file app-logs.zip
```

Common causes:

- Wrong database driver for the configured JDBC URL.
- Missing MySQL password.
- Google OAuth client ID set to an empty value.
- App Service not restarted after changing environment variables.
- Container startup takes longer than the default warm-up window.

### MySQL connection fails

Check:

- The database exists: `intellihire`.
- App Service settings use `com.mysql.cj.jdbc.Driver`.
- JDBC URL uses `sslMode=REQUIRED`.
- Azure MySQL firewall allows Azure services.
- Username/password are correct.

### Git says "dubious ownership"

Run:

```powershell
git config --global --add safe.directory D:/IntelliHire
```

### Secrets were exposed

Rotate any exposed key in its provider dashboard, then update Azure App Service environment variables and restart the app.

## Useful Commands

```powershell
# Package backend
.\mvnw.cmd -DskipTests package

# Run backend locally
.\mvnw.cmd spring-boot:run

# Run frontend locally
cd frontend
npm install
npm run dev

# Build Docker image
docker build -t intellihire .

# Check Azure App Service
az webapp show --resource-group intellihire-rg --name intellihire-app-72307

# Restart Azure App Service
az webapp restart --resource-group intellihire-rg --name intellihire-app-72307
```

## Notes

- The frontend is served by Spring Boot in production.
- The app uses cookies for JWT session handling.
- The database schema is currently managed by Hibernate with `ddl-auto=update`.
- Use Azure Portal or GitHub Secrets for sensitive values; never commit secrets to source control.
