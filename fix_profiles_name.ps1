# Script PowerShell para corrigir profiles(name) -> profiles(full_name)
# Data: 2025-01-18 23:15

Write-Host "🔧 Iniciando correção de profiles(name) -> profiles(full_name)..." -ForegroundColor Cyan

$files = @(
    "src\pages\AnalyticsPage.jsx",
    "src\pages\ReportsPage.jsx",
    "src\pages\teacher\TeacherStudentsPage.jsx",
    "src\hooks\useOptimizedQueries.js"
)

$replacements = @{
    "profiles:user_id\(id, name," = "profiles:user_id(id, full_name,"
    "profiles:user_id\(name" = "profiles:user_id(full_name"
    "profiles!activities_created_by_fkey\(name\)" = "profiles!activities_created_by_fkey(full_name)"
}

$totalFixed = 0

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    
    if (Test-Path $fullPath) {
        Write-Host "📝 Processando: $file" -ForegroundColor Yellow
        
        $content = Get-Content $fullPath -Raw
        $originalContent = $content
        
        foreach ($pattern in $replacements.Keys) {
            $replacement = $replacements[$pattern]
            $content = $content -replace [regex]::Escape($pattern), $replacement
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $fullPath -Value $content -NoNewline
            Write-Host "  ✅ Corrigido!" -ForegroundColor Green
            $totalFixed++
        } else {
            Write-Host "  ⏭️  Nenhuma alteração necessária" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ❌ Arquivo não encontrado: $fullPath" -ForegroundColor Red
    }
}

Write-Host "`n✨ Concluído! $totalFixed arquivo(s) corrigido(s)." -ForegroundColor Green
Write-Host "📋 Próximo passo: Rebuild do Docker" -ForegroundColor Cyan
