@echo off
set "PATH=%PATH%;C:\Users\s4860\AppData\Local\Microsoft\WinGet\Packages\Oven-sh.Bun_Microsoft.Winget.Source_8wekyb3d8bbwe\bun-windows-x64"
cd /d "%~dp0"
echo Starting Chatbot Dev Server on http://localhost:8080 ...
bun dev
pause
