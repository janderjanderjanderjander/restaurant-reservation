#!/bin/bash
set -e

command -v java >/dev/null 2>&1 || { echo "Java is required"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required"; exit 1; }

cd restaurant-backend
mvn spring-boot:run &
echo $! > ../backend.pid

cd ../restaurant-frontend
npm install
npm run dev &
echo $! > ../frontend.pid

sleep 5

URL="http://localhost:5173"

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL"
elif command -v open >/dev/null 2>&1; then
  open "$URL"
fi

sleep 5