#!/usr/bin/env pwsh
# Script de verificacion de configuracion para CaliTrack 360
# Verifica que todo este listo para desarrollo local

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CaliTrack 360 - Verificacion" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$hasErrors = $false

# 1. Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js no esta instalado" -ForegroundColor Red
    $hasErrors = $true
}

# 2. Verificar npm
Write-Host "Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "[OK] npm instalado: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] npm no esta instalado" -ForegroundColor Red
    $hasErrors = $true
}

# 3. Verificar estructura de directorios
Write-Host ""
Write-Host "Verificando estructura de directorios..." -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot/frontend") {
    Write-Host "[OK] Directorio frontend/ existe" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Directorio frontend/ no encontrado" -ForegroundColor Red
    $hasErrors = $true
}

if (Test-Path "$PSScriptRoot/frontend/src") {
    Write-Host "[OK] Directorio frontend/src/ existe" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Directorio frontend/src/ no encontrado" -ForegroundColor Red
    $hasErrors = $true
}

# 4. Verificar archivos de configuracion
Write-Host ""
Write-Host "Verificando archivos de configuracion..." -ForegroundColor Yellow

$configFiles = @(
    "frontend/package.json",
    "frontend/vite.config.ts",
    "frontend/tsconfig.json",
    "frontend/index.html"
)

foreach ($file in $configFiles) {
    if (Test-Path "$PSScriptRoot/$file") {
        Write-Host "[OK] $file existe" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] $file no encontrado" -ForegroundColor Red
        $hasErrors = $true
    }
}

# 5. Verificar node_modules
Write-Host ""
Write-Host "Verificando dependencias..." -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot/frontend/node_modules") {
    Write-Host "[OK] Dependencias instaladas (node_modules/ existe)" -ForegroundColor Green
    
    # Verificar dependencias criticas
    $criticalDeps = @(
        "node_modules/svelte",
        "node_modules/vite",
        "node_modules/firebase"
    )
    
    foreach ($dep in $criticalDeps) {
        if (Test-Path "$PSScriptRoot/frontend/$dep") {
            Write-Host "[OK] $(Split-Path $dep -Leaf) instalado" -ForegroundColor Green
        } else {
            Write-Host "[WARN] $(Split-Path $dep -Leaf) no encontrado" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "[ERROR] Dependencias no instaladas (falta node_modules/)" -ForegroundColor Red
    Write-Host "        Ejecuta: npm install en frontend/" -ForegroundColor Yellow
    $hasErrors = $true
}

# 6. Verificar .env.local
Write-Host ""
Write-Host "Verificando configuracion de Firebase..." -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot/frontend/.env.local") {
    Write-Host "[OK] Archivo .env.local existe" -ForegroundColor Green
    
    $envContent = Get-Content "$PSScriptRoot/frontend/.env.local" -Raw
    
    # Verificar variables requeridas
    $requiredVars = @(
        "VITE_API_URL",
        "VITE_FIREBASE_API_KEY",
        "VITE_FIREBASE_AUTH_DOMAIN",
        "VITE_FIREBASE_PROJECT_ID",
        "VITE_FIREBASE_STORAGE_BUCKET",
        "VITE_FIREBASE_MESSAGING_SENDER_ID",
        "VITE_FIREBASE_APP_ID"
    )
    
    foreach ($var in $requiredVars) {
        if ($envContent -match $var) {
            Write-Host "[OK] Variable $var definida" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Variable $var falta en .env.local" -ForegroundColor Red
            $hasErrors = $true
        }
    }
    
    # Verificar si son valores de ejemplo
    if ($envContent -match "tu-api-key-aqui" -or $envContent -match "tu-proyecto") {
        Write-Host "[WARN] Las credenciales parecen ser de ejemplo" -ForegroundColor Yellow
        Write-Host "       Actualiza .env.local con credenciales reales de Firebase" -ForegroundColor Yellow
    } else {
        Write-Host "[OK] Credenciales configuradas (no son valores de ejemplo)" -ForegroundColor Green
    }
    
} else {
    Write-Host "[ERROR] Archivo .env.local no encontrado" -ForegroundColor Red
    Write-Host "        Copia .env.example a .env.local y configura credenciales" -ForegroundColor Yellow
    $hasErrors = $true
}

# 7. Verificar .env.example
Write-Host ""
Write-Host "Verificando template de configuracion..." -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot/frontend/.env.example") {
    Write-Host "[OK] Archivo .env.example existe" -ForegroundColor Green
} else {
    Write-Host "[WARN] Archivo .env.example no encontrado" -ForegroundColor Yellow
}

# 8. Verificar .gitignore
Write-Host ""
Write-Host "Verificando seguridad..." -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot/.gitignore") {
    $gitignoreContent = Get-Content "$PSScriptRoot/.gitignore" -Raw
    if ($gitignoreContent -match ".env.local") {
        Write-Host "[OK] .env.local esta en .gitignore (seguro)" -ForegroundColor Green
    } else {
        Write-Host "[WARN] .env.local no esta en .gitignore" -ForegroundColor Yellow
        Write-Host "       Las credenciales podrian ser expuestas!" -ForegroundColor Red
    }
} else {
    Write-Host "[WARN] Archivo .gitignore no encontrado" -ForegroundColor Yellow
}

# 9. Verificar conectividad con API Backend
Write-Host ""
Write-Host "Verificando API Backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://gestorproyectoapi-production.up.railway.app/docs" -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "[OK] API Backend accesible (https://gestorproyectoapi-production.up.railway.app)" -ForegroundColor Green
    }
} catch {
    Write-Host "[WARN] No se pudo conectar con API Backend" -ForegroundColor Yellow
    Write-Host "       Verifica tu conexion a internet" -ForegroundColor Yellow
}

# Resultado final
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($hasErrors) {
    Write-Host "   Verificacion completada con ERRORES" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Por favor corrige los errores antes de continuar" -ForegroundColor Yellow
    Write-Host "Ejecuta: .\setup.ps1 para instalar dependencias" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "   Todo listo para desarrollo!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Ejecuta estos comandos para iniciar:" -ForegroundColor Yellow
    Write-Host "  cd frontend" -ForegroundColor Cyan
    Write-Host "  npm run dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Abre en tu navegador: http://localhost:5173" -ForegroundColor Cyan
}
Write-Host ""
