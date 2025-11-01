$uri = "https://buycarrr-1.onrender.com/api/cars"
Write-Host "Testando endpoint de carros..."
Write-Host "URL: $uri"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec 60
    Write-Host "SUCESSO!" -ForegroundColor Green
    Write-Host "Total de carros:", $response.cars.Count
    if ($response.cars.Count -gt 0) {
        $firstCar = $response.cars[0]
        Write-Host ""
        Write-Host "Primeiro carro:"
        Write-Host "  ID: $($firstCar.id)"
        Write-Host "  Marca: $($firstCar.brand)"
        Write-Host "  Modelo: $($firstCar.model)"
        $imageLength = if ($firstCar.images) { $firstCar.images.Length } else { 0 }
        Write-Host "  Tamanho da imagem: $imageLength caracteres"
    }
} catch {
    Write-Host "ERRO!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Mensagem: $($_.Exception.Message)"
}

