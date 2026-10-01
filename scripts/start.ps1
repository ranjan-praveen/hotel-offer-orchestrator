Write-Host "Starting Hotel Offer Orchestrator..." -ForegroundColor Cyan

Write-Host "`nStarting Docker infrastructure..." -ForegroundColor Yellow
docker compose up -d

Write-Host "`nChecking Docker containers..." -ForegroundColor Yellow
docker compose ps

Write-Host "`nInfrastructure is ready." -ForegroundColor Green

Write-Host "`nStart the Temporal worker in another terminal:" -ForegroundColor Cyan
Write-Host "npm run worker"

Write-Host "`nStart the API in another terminal:" -ForegroundColor Cyan
Write-Host "npm run dev"