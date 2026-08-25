@echo off
cd /d "%~dp0"
echo Stopping and removing the portfolio container...
docker compose -f deployments/docker-compose.yml down
echo.
echo Done.
