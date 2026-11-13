@echo off
setlocal
cd /d "%~dp0.."
if not exist "logs" mkdir "logs"

call "%~dp0_find-node.cmd"
if not defined NODE_EXE (
  echo Node.js was not found. Install Node.js 20 or newer from https://nodejs.org and try again.>> "logs\first-due-sync.log"
  exit /b 1
)

"%NODE_EXE%" "scripts\first-due-sync.mjs" %* >> "logs\first-due-sync.log" 2>&1
exit /b %ERRORLEVEL%
