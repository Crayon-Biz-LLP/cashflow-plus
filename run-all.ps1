# CashFlow Unified Runner
Write-Host "🚀 Starting CashFlow Ecosystem..." -ForegroundColor Cyan

$root = Get-Location

# 1. Start Node Backend (Port 5000)
Write-Host "📡 Starting Node Backend (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend-node'; npm run dev"

# 2. Start Frontend (Port 3000)
Write-Host "💻 Starting Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

# 3. Start Python AI Backend (Optional - Port 8000)
if (Test-Path "$root\backend-python") {
    Write-Host "🤖 Starting Python AI Backend (Port 8000)..." -ForegroundColor Yellow
    # Try multiple python commands
    $pyCmd = if (Get-Command "python" -ErrorAction SilentlyContinue) { "python" } else { "py" }
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend-python'; $pyCmd main.py"
}

Write-Host "✅ All services initiated. Check the opened terminal windows." -ForegroundColor Green
