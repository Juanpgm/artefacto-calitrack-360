#!/usr/bin/env pwsh
# Script de instalacion y configuracion para CaliTrack 360
# PowerShell compatible con Windows, Linux y macOS

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CaliTrack 360 - Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js no esta instalado" -ForegroundColor Red
    Write-Host "   Descarga Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar npm
Write-Host "Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "npm instalado: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "npm no esta instalado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Instalando dependencias del frontend..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot/frontend"

# Instalar dependencias
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al instalar dependencias" -ForegroundColor Red
    exit 1
}

Write-Host "Dependencias instaladas correctamente" -ForegroundColor Green
Write-Host ""

# Verificar archivo .env.local
Write-Host "Verificando configuracion de Firebase..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "Archivo .env.local no encontrado" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Creando .env.local desde template..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "Archivo .env.local creado" -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANTE: Edita el archivo .env.local con tus credenciales de Firebase" -ForegroundColor Red
        Write-Host "   Ubicacion: frontend/.env.local" -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host "Archivo .env.example no encontrado" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Archivo .env.local encontrado" -ForegroundColor Green
    
    # Verificar que las credenciales esten configuradas
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "tu-api-key-aqui" -or $envContent -match "tu-proyecto") {
        Write-Host "Las credenciales de Firebase parecen ser de ejemplo" -ForegroundColor Yellow
        Write-Host "   Por favor, actualiza .env.local con credenciales reales" -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host "Credenciales de Firebase configuradas" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Instalacion completada" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configura las credenciales de Firebase en:" -ForegroundColor White
Write-Host "   frontend/.env.local" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Inicia el servidor de desarrollo:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Abre en tu navegador:" -ForegroundColor White
Write-Host "   http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para mas informacion, consulta README.md" -ForegroundColor Yellow
Write-Host ""
