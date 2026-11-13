@echo off
setlocal
cd /d "%~dp0.."
if not exist "logs" mkdir "logs"
node "scripts\first-due-sync.mjs" %* >> "logs\first-due-sync.log" 2>&1
exit /b %ERRORLEVEL%
