# Azure Deployment

This project is ready to deploy as a single Docker container:

- Vite builds the React frontend.
- Spring Boot serves the built frontend from `src/main/resources/static`.
- The app listens on port `8080`.
- Azure App Service runs the final Java 21 container.

## Recommended Azure Services

- Azure App Service for Containers
- Azure Container Registry
- Azure Database for MySQL Flexible Server
- GitHub Actions

## App Service Settings

Set these app settings in Azure App Service:

```text
WEBSITES_PORT=8080
PORT=8080
SPRING_DATASOURCE_URL=jdbc:mysql://<mysql-host>:3306/<database>?useSSL=true&requireSSL=false&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=<mysql-user>
SPRING_DATASOURCE_PASSWORD=<mysql-password>
SPRING_DATASOURCE_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_HIBERNATE_DIALECT=org.hibernate.dialect.MySQLDialect
GEN_KEY=<groq-or-xai-api-key>
ADZUNA_APPLICATION_ID=<adzuna-app-id>
ADZUNA_APPLICATION_API_KEY=<adzuna-api-key>
BREVO_API_KEY=<brevo-api-key>
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
```

If Google login is not needed yet, leave `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` unset.

## GitHub Secrets

The workflow in `.github/workflows/azure-app-service.yml` expects:

```text
ACR_LOGIN_SERVER=<registry-name>.azurecr.io
ACR_USERNAME=<registry-username>
ACR_PASSWORD=<registry-password>
AZURE_WEBAPP_NAME=<app-service-name>
AZURE_WEBAPP_PUBLISH_PROFILE=<publish-profile-xml>
```

## Azure Setup Outline

1. Create an Azure Container Registry.
2. Create Azure Database for MySQL Flexible Server and a database.
3. Create an Azure App Service for Linux containers.
4. Add the App Service settings listed above.
5. Add the GitHub repository secrets listed above.
6. Push to `main` or run the workflow manually.

## Provision From This Machine

The script below creates the Azure resources, builds the Docker image in Azure Container Registry, deploys it to App Service, and configures the Spring Boot environment variables:

```powershell
.\scripts\azure-provision.ps1
```

Optional parameters:

```powershell
.\scripts\azure-provision.ps1 `
  -Location centralindia `
  -ResourceGroup intellihire-rg `
  -NamePrefix intellihire
```

This machine used a local Docker build/push because Azure Container Registry Tasks were not enabled for the subscription.

## Current Temporary Deployment

The current Azure App Service is deployed at:

```text
https://intellihire-app-72307.azurewebsites.net
```

It is currently configured with in-memory H2 so the container can run while Azure Database for MySQL capacity/region access is resolved for the subscription.

## Local Container Test

Before deploying, build and run the same container locally:

```powershell
docker build -t intellihire .
docker run --rm -p 8080:8080 intellihire
```

Open `http://localhost:8080`.
