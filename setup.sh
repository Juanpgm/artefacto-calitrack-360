#!/bin/bash
# Script de instalación y configuración para CaliTrack 360
# Compatible con Linux y macOS

set -e

echo "========================================"
echo "   CaliTrack 360 - Setup Script"
echo "========================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Verificar Node.js
echo -e "${YELLOW}🔍 Verificando Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js instalado: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo -e "${YELLOW}   Descarga Node.js desde: https://nodejs.org/${NC}"
    exit 1
fi

# Verificar npm
echo -e "${YELLOW}🔍 Verificando npm...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm instalado: v$NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm no está instalado${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📦 Instalando dependencias del frontend...${NC}"

# Cambiar al directorio frontend
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/frontend"

# Instalar dependencias
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al instalar dependencias${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencias instaladas correctamente${NC}"
echo ""

# Verificar archivo .env.local
echo -e "${YELLOW}🔍 Verificando configuración de Firebase...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  Archivo .env.local no encontrado${NC}"
    echo ""
    echo -e "${YELLOW}📝 Creando .env.local desde template...${NC}"
    
    if [ -f ".env.example" ]; then
        cp ".env.example" ".env.local"
        echo -e "${GREEN}✅ Archivo .env.local creado${NC}"
        echo ""
        echo -e "${RED}⚠️  IMPORTANTE: Edita el archivo .env.local con tus credenciales de Firebase${NC}"
        echo -e "${YELLOW}   Ubicación: frontend/.env.local${NC}"
        echo ""
    else
        echo -e "${RED}❌ Archivo .env.example no encontrado${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Archivo .env.local encontrado${NC}"
    
    # Verificar que las credenciales estén configuradas
    if grep -q "tu-api-key-aqui\|tu-proyecto" ".env.local"; then
        echo -e "${YELLOW}⚠️  Las credenciales de Firebase parecen ser de ejemplo${NC}"
        echo -e "${YELLOW}   Por favor, actualiza .env.local con credenciales reales${NC}"
        echo ""
    else
        echo -e "${GREEN}✅ Credenciales de Firebase configuradas${NC}"
    fi
fi

echo ""
echo "========================================"
echo -e "${GREEN}   ✅ Instalación completada${NC}"
echo "========================================"
echo ""
echo -e "${YELLOW}📋 Próximos pasos:${NC}"
echo ""
echo -e "${NC}1. Configura las credenciales de Firebase en:${NC}"
echo -e "${CYAN}   frontend/.env.local${NC}"
echo ""
echo -e "${NC}2. Inicia el servidor de desarrollo:${NC}"
echo -e "${CYAN}   cd frontend${NC}"
echo -e "${CYAN}   npm run dev${NC}"
echo ""
echo -e "${NC}3. Abre en tu navegador:${NC}"
echo -e "${CYAN}   http://localhost:5173${NC}"
echo ""
echo -e "${YELLOW}📖 Para más información, consulta README.md${NC}"
echo ""
