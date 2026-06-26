param(
    [string]$SubscriptionId = "e3974eb5-9f2a-480d-bca9-b4ef3d42603c",
    [string]$Location = "centralindia",
    [string]$ResourceGroup = "intellihire-rg",
    [string]$NamePrefix = "intellihire",
    [string]$Suffix = "",
    [string]$MysqlAdminUser = "intellihireadmin",
    [string]$MysqlAdminPassword = "",
    [string]$GenKey = "",
    [string]$AdzunaApplicationId = "",
    [string]$AdzunaApplicationApiKey = "",
    [string]$BrevoApiKey = "",
    [string]$GoogleClientId = "",
    [string]$GoogleClientSecret = ""
)

$ErrorActionPreference = "Stop"

$az = "az"
if (-not (Get-Command $az -ErrorAction SilentlyContinue)) {
    $az = "C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd"
}

if (-not (Test-Path $az) -and -not (Get-Command $az -ErrorAction SilentlyContinue)) {
    throw "Azure CLI was not found. Install it from https://aka.ms/installazurecliwindows"
}

if ([string]::IsNullOrWhiteSpace($MysqlAdminPassword)) {
    $securePassword = Read-Host "Enter a MySQL admin password" -AsSecureString
    $MysqlAdminPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    )
}

function Invoke-AzureCli {
    & $az @args
    if ($LASTEXITCODE -ne 0) {
        throw "Azure CLI command failed: az $args"
    }
}

function Register-Provider {
    param([string]$Namespace)

    $state = (& $az provider show --namespace $Namespace --query registrationState --output tsv 2>$null)
    if ($state -ne "Registered") {
        Write-Host "Registering resource provider $Namespace"
        Invoke-AzureCli provider register --namespace $Namespace
        do {
            Start-Sleep -Seconds 10
            $state = (& $az provider show --namespace $Namespace --query registrationState --output tsv)
            Write-Host "$Namespace registration state: $state"
        } while ($state -ne "Registered")
    }
}

if ([string]::IsNullOrWhiteSpace($Suffix)) {
    $Suffix = (Get-Random -Minimum 10000 -Maximum 99999).ToString()
}

$acrName = "$($NamePrefix.Replace('-', ''))acr$suffix".ToLower()
$appName = "$NamePrefix-app-$suffix".ToLower()
$planName = "$NamePrefix-plan"
$mysqlName = "$NamePrefix-mysql-$suffix".ToLower()
$databaseName = "intellihire"
$imageName = "$NamePrefix`:latest"

Write-Host "Using subscription $SubscriptionId"
Invoke-AzureCli account set --subscription $SubscriptionId

Register-Provider -Namespace "Microsoft.ContainerRegistry"
Register-Provider -Namespace "Microsoft.DBforMySQL"
Register-Provider -Namespace "Microsoft.Web"

Write-Host "Creating resource group $ResourceGroup in $Location"
Invoke-AzureCli group create --name $ResourceGroup --location $Location

Write-Host "Creating Azure Container Registry $acrName"
Invoke-AzureCli acr create `
    --resource-group $ResourceGroup `
    --name $acrName `
    --sku Basic `
    --admin-enabled true

$acrLoginServer = (& $az acr show --name $acrName --resource-group $ResourceGroup --query loginServer --output tsv)
if ($LASTEXITCODE -ne 0) {
    throw "Failed to read ACR login server."
}

Write-Host "Building and pushing container image with local Docker"
Invoke-AzureCli acr login --name $acrName
docker build -t "$acrLoginServer/$imageName" .
if ($LASTEXITCODE -ne 0) {
    throw "Docker build failed."
}
docker push "$acrLoginServer/$imageName"
if ($LASTEXITCODE -ne 0) {
    throw "Docker push failed."
}

Write-Host "Creating Azure Database for MySQL Flexible Server $mysqlName"
Invoke-AzureCli mysql flexible-server create `
    --resource-group $ResourceGroup `
    --name $mysqlName `
    --location $Location `
    --admin-user $MysqlAdminUser `
    --admin-password $MysqlAdminPassword `
    --sku-name Standard_B1ms `
    --tier Burstable `
    --version 8.0.21 `
    --storage-size 20 `
    --yes

Write-Host "Allowing Azure services to reach MySQL"
Invoke-AzureCli mysql flexible-server firewall-rule create `
    --resource-group $ResourceGroup `
    --name $mysqlName `
    --rule-name AllowAzureServices `
    --start-ip-address 0.0.0.0 `
    --end-ip-address 0.0.0.0

Write-Host "Creating database $databaseName"
Invoke-AzureCli mysql flexible-server db create `
    --resource-group $ResourceGroup `
    --server-name $mysqlName `
    --database-name $databaseName

Write-Host "Creating Linux App Service plan $planName"
Invoke-AzureCli appservice plan create `
    --resource-group $ResourceGroup `
    --name $planName `
    --is-linux `
    --sku B1

$acrUsername = (& $az acr credential show --name $acrName --query username --output tsv)
$acrPassword = (& $az acr credential show --name $acrName --query "passwords[0].value" --output tsv)
$containerImage = "$acrLoginServer/$imageName"

if ([string]::IsNullOrWhiteSpace($GoogleClientId)) {
    $GoogleClientId = "dev-dummy"
}
if ([string]::IsNullOrWhiteSpace($GoogleClientSecret)) {
    $GoogleClientSecret = "dev-dummy"
}

Write-Host "Creating Web App $appName"
Invoke-AzureCli webapp create `
    --resource-group $ResourceGroup `
    --plan $planName `
    --name $appName `
    --deployment-container-image-name $containerImage

Write-Host "Configuring container registry credentials"
Invoke-AzureCli webapp config container set `
    --resource-group $ResourceGroup `
    --name $appName `
    --docker-custom-image-name $containerImage `
    --docker-registry-server-url "https://$acrLoginServer" `
    --docker-registry-server-user $acrUsername `
    --docker-registry-server-password $acrPassword

$mysqlHost = "$mysqlName.mysql.database.azure.com"
$jdbcUrl = "jdbc:mysql://$mysqlHost`:3306/$databaseName`?sslMode=REQUIRED&serverTimezone=UTC"

Write-Host "Configuring application settings"
Invoke-AzureCli webapp config appsettings set `
    --resource-group $ResourceGroup `
    --name $appName `
    --settings `
        "WEBSITES_PORT=8080" `
        "PORT=8080" `
        "SPRING_DATASOURCE_URL=$jdbcUrl" `
        "SPRING_DATASOURCE_USERNAME=$MysqlAdminUser" `
        "SPRING_DATASOURCE_PASSWORD=$MysqlAdminPassword" `
        "SPRING_DATASOURCE_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver" `
        "SPRING_JPA_HIBERNATE_DDL_AUTO=update" `
        "SPRING_JPA_HIBERNATE_DIALECT=org.hibernate.dialect.MySQLDialect" `
        "GEN_KEY=$GenKey" `
        "ADZUNA_APPLICATION_ID=$AdzunaApplicationId" `
        "ADZUNA_APPLICATION_API_KEY=$AdzunaApplicationApiKey" `
        "BREVO_API_KEY=$BrevoApiKey" `
        "GOOGLE_CLIENT_ID=$GoogleClientId" `
        "GOOGLE_CLIENT_SECRET=$GoogleClientSecret"

Write-Host ""
Write-Host "Azure resources are ready."
Write-Host "App URL: https://$appName.azurewebsites.net"
Write-Host "Resource group: $ResourceGroup"
Write-Host "ACR login server: $acrLoginServer"
Write-Host "MySQL server: $mysqlHost"
