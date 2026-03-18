@echo off
echo Starting backend server...
cd /d "c:\Users\Gaana\Desktop\javascript_event\backend"
start "Backend Server" cmd /k "npm start"

echo Starting frontend server...
cd /d "c:\Users\Gaana\Desktop\javascript_event\frontend"
set PORT=3001
start "Frontend Server" cmd /k "npm start"

echo Both servers started.
pause