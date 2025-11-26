#!/usr/bin/env pwsh
# Script de deployment automático para Vercel
# PowerShell para Windows

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Deploy CaliTrack 360 a Vercel" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Función para verificar comandos
function Test-Command {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Verificar Node.js
Write-Host "📦 Verificando Node.js..." -ForegroundColor Yellow
if (-not (Test-Command "node")) {
    Write-Host "❌ Error: Node.js no está instalado" -ForegroundColor Red
    Write-Host "Descarga Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
$nodeVersion = node --version
Write-Host "✅ Node.js $nodeVersion instalado" -ForegroundColor Green

# Verificar npm
if (-not (Test-Command "npm")) {
    Write-Host "❌ Error: npm no está disponible" -ForegroundColor Red
    exit 1
}
$npmVersion = npm --version
Write-Host "✅ npm $npmVersion instalado" -ForegroundColor Green
Write-Host ""

# Verificar Vercel CLI
Write-Host "🔧 Verificando Vercel CLI..." -ForegroundColor Yellow
if (-not (Test-Command "vercel")) {
    Write-Host "⚠️  Vercel CLI no está instalado" -ForegroundColor Yellow
    Write-Host "📥 Instalando Vercel CLI globalmente..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al instalar Vercel CLI" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Vercel CLI instalado" -ForegroundColor Green
} else {
    Write-Host "✅ Vercel CLI ya está instalado" -ForegroundColor Green
}
Write-Host ""

# Verificar archivo .env.local
Write-Host "🔐 Verificando variables de entorno..." -ForegroundColor Yellow
$envFile = Join-Path $PSScriptRoot "frontend\.env.local"
if (-not (Test-Path $envFile)) {
    Write-Host "⚠️  Archivo .env.local no encontrado" -ForegroundColor Yellow
    Write-Host "❗ Necesitas configurar las variables de entorno de Firebase" -ForegroundColor Red
    Write-Host ""
    Write-Host "Crea el archivo frontend/.env.local con:" -ForegroundColor Yellow
    Write-Host "  VITE_API_URL=https://gestorproyectoapi-production.up.railway.app" -ForegroundColor Cyan
    Write-Host "  VITE_FIREBASE_API_KEY=tu_api_key" -ForegroundColor Cyan
    Write-Host "  VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain" -ForegroundColor Cyan
    Write-Host "  VITE_FIREBASE_PROJECT_ID=tu_project_id" -ForegroundColor Cyan
    Write-Host "  VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket" -ForegroundColor Cyan
    Write-Host "  VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id" -ForegroundColor Cyan
    Write-Host "  VITE_FIREBASE_APP_ID=tu_app_id" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "¿Continuar sin .env.local? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 0
    }
} else {
    Write-Host "✅ Archivo .env.local encontrado" -ForegroundColor Green
}
Write-Host ""

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
Write-Host ""

# Build local para verificar
Write-Host "🔨 Construyendo aplicación..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el build" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build exitoso" -ForegroundColor Green
Write-Host ""

# Preguntar tipo de deployment
Write-Host "🚀 Tipo de deployment:" -ForegroundColor Cyan
Write-Host "  1) Production (main/master branch)" -ForegroundColor White
Write-Host "  2) Preview (testing)" -ForegroundColor White
Write-Host ""
$deployType = Read-Host "Selecciona (1 o 2)"

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Iniciando deployment a Vercel..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Deploy según tipo
if ($deployType -eq "1") {
    Write-Host "🚀 Deployando a PRODUCTION..." -ForegroundColor Green
    vercel --prod
} else {
    Write-Host "🚀 Deployando a PREVIEW..." -ForegroundColor Yellow
    vercel
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host "  ✅ Deployment exitoso!" -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Consejos:" -ForegroundColor Cyan
    Write-Host "  - Configura las variables de entorno en Vercel Dashboard" -ForegroundColor White
    Write-Host "  - El deployment automático funciona con git push" -ForegroundColor White
    Write-Host "  - Revisa los logs en: https://vercel.com/dashboard" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Error en el deployment" -ForegroundColor Red
    exit 1
}
