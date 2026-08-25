@echo off
cd /d "%~dp0"
echo Building and starting the portfolio container (nginx + Astro static)...
docker compose -f deployments/docker-compose.yml up --build -d
echo.
echo Waiting for container to come up...
ping -n 5 127.0.0.1 >nul
echo.
echo Open: http://localhost:3000
echo Run stop-docker.cmd to stop it.
