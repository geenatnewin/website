cd $PSScriptRoot

git add -A
$msg = Read-Host "Commit message"
git commit -m $msg
git push

Write-Host "Waiting for deployment to finish..."
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 5
    $out = vercel ls 2>&1 | Select-String "Ready|Building|Error" | Select-Object -First 1
    if ($out -match "Ready") {
        $url = ($out -split "\s+") | Where-Object { $_ -match "https://" } | Select-Object -First 1
        Write-Host "Deployment ready: $url"
        vercel alias set $url navinnguyen.vercel.app
        Write-Host "Site is live at https://navinnguyen.vercel.app"
        $ready = $true
        break
    }
    Write-Host "Still building..."
}
if (-not $ready) { Write-Host "Timed out — run: vercel alias set [url] navinnguyen.vercel.app" }
