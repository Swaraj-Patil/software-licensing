# Test script for License API
# $baseUrl = "https://wtc-licensing.vercel.app/"
$baseUrl = "http://localhost:3000/"
$adminSecret = "qazwsxplmokn"

Write-Host "Testing License API..." -ForegroundColor Cyan

# 1. Create a new license
Write-Host "`n1. Creating new license..." -ForegroundColor Yellow
$headers = @{
    "Content-Type" = "application/json"
    "x-admin-secret" = $adminSecret
}
$body = @{
    plan = "pro"
    max_accounts = 1
    days = 30
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/issue" -Method POST -Headers $headers -Body $body
    $licenseData = $response.Content | ConvertFrom-Json
    $licenseKey = $licenseData.license_key
    Write-Host "License created successfully!" -ForegroundColor Green
    Write-Host "License Key: $licenseKey"
} catch {
    Write-Host "Error creating license: $_" -ForegroundColor Red
    exit
}

# 2. Validate the license
Write-Host "`n2. Testing license validation..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/validate?key=$licenseKey&account=12345&server=Demo-Server" -Method GET
    Write-Host "License validation successful!" -ForegroundColor Green
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error validating license: $_" -ForegroundColor Red
}

# 3. Test duplicate activation
Write-Host "`n3. Testing duplicate activation..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/validate?key=$licenseKey&account=12345&server=Demo-Server" -Method GET
    Write-Host "Duplicate activation test successful!" -ForegroundColor Green
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error in duplicate activation test: $_" -ForegroundColor Red
}

# 4. Test different account activation (should fail if max_accounts=1)
Write-Host "`n4. Testing different account activation..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/validate?key=$licenseKey&account=67890&server=Demo-Server" -Method GET
    Write-Host "Different account activation completed with response:" -ForegroundColor Yellow
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Different account activation failed (expected if max_accounts=1): $_" -ForegroundColor Green
}

# 5. Deactivate the license
Write-Host "`n5. Testing license deactivation..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/deactivate?key=$licenseKey&account=12345&server=Demo-Server" -Method DELETE
    Write-Host "License deactivation successful!" -ForegroundColor Green
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error deactivating license: $_" -ForegroundColor Red
}

Write-Host "`nTest suite completed!" -ForegroundColor Cyan
