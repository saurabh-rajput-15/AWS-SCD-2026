Start-Process powershell -ArgumentList "cd client; npm run dev" -PassThru -NoNewWindow
Start-Process powershell -ArgumentList "cd server; npx tsx watch src/app.ts" -PassThru -NoNewWindow