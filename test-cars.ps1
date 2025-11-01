# Script para testar endpoint de carros
$uri = "https://buycarrr-1.onrender.com/api/cars"

Write-Host "Testando endpoint de carros..." 
Write-Host "URL: $uri"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec 30
    Write-Host "SUCESSO!" -ForegroundColor Green
    Write-Host "Total de carros:", $response.cars.Count
    Write-Host ""
    Write-Host "Primeiros 3 carros:" 
    $response.cars | Select-Object -First 3 | Format-List id, brand, model, status
} catch {
    Write-Host "ERRO!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Mensagem: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) {
        Write-Host "Detalhes: $($_.ErrorDetails.Message)"
    }
}

