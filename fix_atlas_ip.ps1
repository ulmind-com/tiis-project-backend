# ─────────────────────────────────────────────────────────────────
#  TIIS Project — MongoDB Atlas IP Whitelist Helper
#  Run: .\fix_atlas_ip.ps1
# ─────────────────────────────────────────────────────────────────

Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   TIIS MongoDB Atlas IP Whitelist Helper   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Step 1: Get current public IP
Write-Host "🔍 Getting your current public IP..." -ForegroundColor Yellow
$ip = $null
try {
    $ip = (Invoke-RestMethod -Uri "https://checkip.amazonaws.com" -TimeoutSec 5).Trim()
    Write-Host "✅ Your public IP: $ip" -ForegroundColor Green
} catch {
    try {
        $ip = (Invoke-RestMethod -Uri "http://icanhazip.com" -TimeoutSec 5).Trim()
        Write-Host "✅ Your public IP: $ip" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not detect public IP. Will add 0.0.0.0/0 (allow all) instead." -ForegroundColor Yellow
        $ip = "0.0.0.0"
    }
}

# Step 2: Open Atlas Network Access page directly
$atlasUrl = "https://cloud.mongodb.com/v2#/security/network/accessList"
Write-Host "`n🌐 Opening MongoDB Atlas Network Access page in browser..." -ForegroundColor Yellow
Start-Process $atlasUrl

# Step 3: Instructions
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor White
Write-Host "📋  DO THESE STEPS in the browser that just opened:" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor White
Write-Host ""
Write-Host "  1. Log in to MongoDB Atlas if needed" -ForegroundColor White
Write-Host "  2. Click  [ + ADD IP ADDRESS ]" -ForegroundColor Cyan
Write-Host "  3. Click  [ ALLOW ACCESS FROM ANYWHERE ]" -ForegroundColor Cyan
Write-Host "     OR manually enter IP: $ip" -ForegroundColor Green
Write-Host "  4. Click  [ Confirm ]" -ForegroundColor Cyan
Write-Host "  5. Wait 60 seconds for it to apply" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor White

# Step 4: Wait and auto-restart backend
Write-Host "`n⏳ Waiting 70 seconds for Atlas to apply the whitelist..." -ForegroundColor Yellow
$total = 70
for ($i = 1; $i -le $total; $i++) {
    $percent = [math]::Round(($i / $total) * 100)
    Write-Progress -Activity "Waiting for Atlas whitelist to apply..." -Status "$i/$total seconds" -PercentComplete $percent
    Start-Sleep -Seconds 1
}
Write-Progress -Completed -Activity "Done"

# Step 5: Test the connection
Write-Host "`n🔄 Testing MongoDB connection now..." -ForegroundColor Yellow
Set-Location -Path $PSScriptRoot
$result = node test_connection.js 2>&1
Write-Host $result

Write-Host "`n✅ If connected, please restart your backend:" -ForegroundColor Green
Write-Host "   Stop the backend terminal (Ctrl+C) and run: npm run dev`n" -ForegroundColor Cyan
