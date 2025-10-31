# Script para testar login na API
$uri = "https://buycarrr-1.onrender.com/api/auth/login"
$body = @{
    email = "admin@buycarr.com"
    password = "admin123"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "Testando login na API..." 
Write-Host "URL: $uri"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Body $body -Headers $headers
    Write-Host "SUCESSO!" -ForegroundColor Green
    Write-Host "Resposta:" 
    $response | ConvertTo-Json
} catch {
    Write-Host "ERRO!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Mensagem: $($_.Exception.Message)"
}
