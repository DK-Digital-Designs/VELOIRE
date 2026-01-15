@echo off
echo Starting Veloire Ecosystem...
start cmd /k "echo Starting Server... && cd server && npm run dev"
start cmd /k "echo Starting Client... && cd client && npm run dev"
echo Both services are spinning up in separate windows.
pause
