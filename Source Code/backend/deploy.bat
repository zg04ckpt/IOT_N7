@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

rem --- Configuration ---
set "SERVER_USER=root"
set "SERVER_HOST=hoangcn.com"
set "SERVER_PATH=/hoangcn/iot"
set "COMPOSE_FILE=docker-compose.yaml"

echo Checking for "%COMPOSE_FILE%" in %CD%...
docker rmi iot-backend iot-mysql

echo 1. Build images with Docker Compose
docker compose -f "%COMPOSE_FILE%" build --pull
if %ERRORLEVEL% neq 0 (
    echo Docker compose build failed.
    pause
    exit /b 1
)

echo 2. Prepare backend image to export
set "BACKEND_IMAGE=iot-backend:latest"
set "BACKEND_TAR=iot-backend.tar"

echo Saving %BACKEND_IMAGE% to %BACKEND_TAR%...
docker save -o "%BACKEND_TAR%" "%BACKEND_IMAGE%"
if %ERRORLEVEL% neq 0 (
    echo ERROR: failed to save %BACKEND_IMAGE%
    echo Listing recent images for debugging:
    docker images --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.Size}}"
    pause
    exit /b 1
)

echo 3. Upload tar files and compose file to remote server
echo Creating remote path and copying files via scp...
scp "%COMPOSE_FILE%" %SERVER_USER%@%SERVER_HOST%:%SERVER_PATH%/ || (
    echo SCP of compose file failed & pause & exit /b 1
)
scp "%BACKEND_TAR%" %SERVER_USER%@%SERVER_HOST%:%SERVER_PATH%/ || (
    echo SCP of backend tar failed & pause & exit /b 1
)
scp "vps.sh" %SERVER_USER%@%SERVER_HOST%:%SERVER_PATH%/ || (
    echo Script for vps failed & pause & exit /b 1
)
scp ".env" %SERVER_USER%@%SERVER_HOST%:%SERVER_PATH%/ || (
    echo ENV failed & pause & exit /b 1
)

echo 4. SSH to remote: load images and restart compose
ssh %SERVER_USER%@%SERVER_HOST% "cd /hoangcn/iot/ && chmod +x vps.sh && ./vps.sh"

echo DONE
pause

