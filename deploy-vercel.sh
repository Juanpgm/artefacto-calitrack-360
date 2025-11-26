#!/bin/bash
# Script de deployment automático para Vercel
# Bash para Linux/macOS

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=================================================${NC}"
echo -e "${CYAN}  Deploy CaliTrack 360 a Vercel${NC}"
echo -e "${CYAN}=================================================${NC}"
echo ""

# Función para verificar comandos
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar Node.js
echo -e "${YELLOW}📦 Verificando Node.js...${NC}"
if ! command_exists node; then
    echo -e "${RED}❌ Error: Node.js no está instalado${NC}"
    echo -e "${YELLOW}Descarga Node.js desde: https://nodejs.org/${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js $NODE_VERSION instalado${NC}"

# Verificar npm
if ! command_exists npm; then
    echo -e "${RED}❌ Error: npm no está disponible${NC}"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm $NPM_VERSION instalado${NC}"
echo ""

# Verificar Vercel CLI
echo -e "${YELLOW}🔧 Verificando Vercel CLI...${NC}"
if ! command_exists vercel; then
    echo -e "${YELLOW}⚠️  Vercel CLI no está instalado${NC}"
    echo -e "${YELLOW}📥 Instalando Vercel CLI globalmente...${NC}"
    npm install -g vercel
    echo -e "${GREEN}✅ Vercel CLI instalado${NC}"
else
    echo -e "${GREEN}✅ Vercel CLI ya está instalado${NC}"
fi
echo ""

# Verificar archivo .env.local
echo -e "${YELLOW}🔐 Verificando variables de entorno...${NC}"
ENV_FILE="./frontend/.env.local"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  Archivo .env.local no encontrado${NC}"
    echo -e "${RED}❗ Necesitas configurar las variables de entorno de Firebase${NC}"
    echo ""
    echo -e "${YELLOW}Crea el archivo frontend/.env.local con:${NC}"
    echo -e "${CYAN}  VITE_API_URL=https://gestorproyectoapi-production.up.railway.app${NC}"
    echo -e "${CYAN}  VITE_FIREBASE_API_KEY=tu_api_key${NC}"
    echo -e "${CYAN}  VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain${NC}"
    echo -e "${CYAN}  VITE_FIREBASE_PROJECT_ID=tu_project_id${NC}"
    echo -e "${CYAN}  VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket${NC}"
    echo -e "${CYAN}  VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id${NC}"
    echo -e "${CYAN}  VITE_FIREBASE_APP_ID=tu_app_id${NC}"
    echo ""
    read -p "¿Continuar sin .env.local? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
else
    echo -e "${GREEN}✅ Archivo .env.local encontrado${NC}"
fi
echo ""

# Instalar dependencias
echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
npm install
echo -e "${GREEN}✅ Dependencias instaladas${NC}"
echo ""

# Build local para verificar
echo -e "${YELLOW}🔨 Construyendo aplicación...${NC}"
npm run build
echo -e "${GREEN}✅ Build exitoso${NC}"
echo ""

# Preguntar tipo de deployment
echo -e "${CYAN}🚀 Tipo de deployment:${NC}"
echo "  1) Production (main/master branch)"
echo "  2) Preview (testing)"
echo ""
read -p "Selecciona (1 o 2): " DEPLOY_TYPE

echo ""
echo -e "${CYAN}=================================================${NC}"
echo -e "${CYAN}  Iniciando deployment a Vercel...${NC}"
echo -e "${CYAN}=================================================${NC}"
echo ""

# Deploy según tipo
if [ "$DEPLOY_TYPE" = "1" ]; then
    echo -e "${GREEN}🚀 Deployando a PRODUCTION...${NC}"
    vercel --prod
else
    echo -e "${YELLOW}🚀 Deployando a PREVIEW...${NC}"
    vercel
fi

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=================================================${NC}"
    echo -e "${GREEN}  ✅ Deployment exitoso!${NC}"
    echo -e "${GREEN}=================================================${NC}"
    echo ""
    echo -e "${CYAN}💡 Consejos:${NC}"
    echo "  - Configura las variables de entorno en Vercel Dashboard"
    echo "  - El deployment automático funciona con git push"
    echo "  - Revisa los logs en: https://vercel.com/dashboard"
else
    echo ""
    echo -e "${RED}❌ Error en el deployment${NC}"
    exit 1
fi
