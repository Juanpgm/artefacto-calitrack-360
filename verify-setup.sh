#!/bin/bash
# Script de verificacion de configuracion para CaliTrack 360
# Verifica que todo este listo para desarrollo local

set +e  # No detener en errores

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo "========================================"
echo "   CaliTrack 360 - Verificacion"
echo "========================================"
echo ""

HAS_ERRORS=false
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 1. Verificar Node.js
echo -e "${YELLOW}Verificando Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}[OK] Node.js instalado: $NODE_VERSION${NC}"
else
    echo -e "${RED}[ERROR] Node.js no esta instalado${NC}"
    HAS_ERRORS=true
fi

# 2. Verificar npm
echo -e "${YELLOW}Verificando npm...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}[OK] npm instalado: v$NPM_VERSION${NC}"
else
    echo -e "${RED}[ERROR] npm no esta instalado${NC}"
    HAS_ERRORS=true
fi

# 3. Verificar estructura de directorios
echo ""
echo -e "${YELLOW}Verificando estructura de directorios...${NC}"
if [ -d "$SCRIPT_DIR/frontend" ]; then
    echo -e "${GREEN}[OK] Directorio frontend/ existe${NC}"
else
    echo -e "${RED}[ERROR] Directorio frontend/ no encontrado${NC}"
    HAS_ERRORS=true
fi

if [ -d "$SCRIPT_DIR/frontend/src" ]; then
    echo -e "${GREEN}[OK] Directorio frontend/src/ existe${NC}"
else
    echo -e "${RED}[ERROR] Directorio frontend/src/ no encontrado${NC}"
    HAS_ERRORS=true
fi

# 4. Verificar archivos de configuracion
echo ""
echo -e "${YELLOW}Verificando archivos de configuracion...${NC}"

CONFIG_FILES=(
    "frontend/package.json"
    "frontend/vite.config.ts"
    "frontend/tsconfig.json"
    "frontend/index.html"
)

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$SCRIPT_DIR/$file" ]; then
        echo -e "${GREEN}[OK] $file existe${NC}"
    else
        echo -e "${RED}[ERROR] $file no encontrado${NC}"
        HAS_ERRORS=true
    fi
done

# 5. Verificar node_modules
echo ""
echo -e "${YELLOW}Verificando dependencias...${NC}"
if [ -d "$SCRIPT_DIR/frontend/node_modules" ]; then
    echo -e "${GREEN}[OK] Dependencias instaladas (node_modules/ existe)${NC}"
    
    # Verificar dependencias criticas
    CRITICAL_DEPS=(
        "node_modules/svelte"
        "node_modules/vite"
        "node_modules/firebase"
    )
    
    for dep in "${CRITICAL_DEPS[@]}"; do
        if [ -d "$SCRIPT_DIR/frontend/$dep" ]; then
            DEP_NAME=$(basename "$dep")
            echo -e "${GREEN}[OK] $DEP_NAME instalado${NC}"
        else
            DEP_NAME=$(basename "$dep")
            echo -e "${YELLOW}[WARN] $DEP_NAME no encontrado${NC}"
        fi
    done
else
    echo -e "${RED}[ERROR] Dependencias no instaladas (falta node_modules/)${NC}"
    echo -e "${YELLOW}        Ejecuta: npm install en frontend/${NC}"
    HAS_ERRORS=true
fi

# 6. Verificar .env.local
echo ""
echo -e "${YELLOW}Verificando configuracion de Firebase...${NC}"
if [ -f "$SCRIPT_DIR/frontend/.env.local" ]; then
    echo -e "${GREEN}[OK] Archivo .env.local existe${NC}"
    
    # Verificar variables requeridas
    REQUIRED_VARS=(
        "VITE_API_URL"
        "VITE_FIREBASE_API_KEY"
        "VITE_FIREBASE_AUTH_DOMAIN"
        "VITE_FIREBASE_PROJECT_ID"
        "VITE_FIREBASE_STORAGE_BUCKET"
        "VITE_FIREBASE_MESSAGING_SENDER_ID"
        "VITE_FIREBASE_APP_ID"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "$var" "$SCRIPT_DIR/frontend/.env.local"; then
            echo -e "${GREEN}[OK] Variable $var definida${NC}"
        else
            echo -e "${RED}[ERROR] Variable $var falta en .env.local${NC}"
            HAS_ERRORS=true
        fi
    done
    
    # Verificar si son valores de ejemplo
    if grep -q "tu-api-key-aqui\|tu-proyecto" "$SCRIPT_DIR/frontend/.env.local"; then
        echo -e "${YELLOW}[WARN] Las credenciales parecen ser de ejemplo${NC}"
        echo -e "${YELLOW}       Actualiza .env.local con credenciales reales de Firebase${NC}"
    else
        echo -e "${GREEN}[OK] Credenciales configuradas (no son valores de ejemplo)${NC}"
    fi
    
else
    echo -e "${RED}[ERROR] Archivo .env.local no encontrado${NC}"
    echo -e "${YELLOW}        Copia .env.example a .env.local y configura credenciales${NC}"
    HAS_ERRORS=true
fi

# 7. Verificar .env.example
echo ""
echo -e "${YELLOW}Verificando template de configuracion...${NC}"
if [ -f "$SCRIPT_DIR/frontend/.env.example" ]; then
    echo -e "${GREEN}[OK] Archivo .env.example existe${NC}"
else
    echo -e "${YELLOW}[WARN] Archivo .env.example no encontrado${NC}"
fi

# 8. Verificar .gitignore
echo ""
echo -e "${YELLOW}Verificando seguridad...${NC}"
if [ -f "$SCRIPT_DIR/.gitignore" ]; then
    if grep -q ".env.local" "$SCRIPT_DIR/.gitignore"; then
        echo -e "${GREEN}[OK] .env.local esta en .gitignore (seguro)${NC}"
    else
        echo -e "${YELLOW}[WARN] .env.local no esta en .gitignore${NC}"
        echo -e "${RED}       Las credenciales podrian ser expuestas!${NC}"
    fi
else
    echo -e "${YELLOW}[WARN] Archivo .gitignore no encontrado${NC}"
fi

# 9. Verificar conectividad con API Backend
echo ""
echo -e "${YELLOW}Verificando API Backend...${NC}"
if command -v curl &> /dev/null; then
    if curl -s --max-time 10 "https://gestorproyectoapi-production.up.railway.app/docs" > /dev/null 2>&1; then
        echo -e "${GREEN}[OK] API Backend accesible (https://gestorproyectoapi-production.up.railway.app)${NC}"
    else
        echo -e "${YELLOW}[WARN] No se pudo conectar con API Backend${NC}"
        echo -e "${YELLOW}       Verifica tu conexion a internet${NC}"
    fi
else
    echo -e "${YELLOW}[WARN] curl no esta instalado, no se puede verificar API Backend${NC}"
fi

# Resultado final
echo ""
echo "========================================"
if [ "$HAS_ERRORS" = true ]; then
    echo -e "${RED}   Verificacion completada con ERRORES${NC}"
    echo "========================================"
    echo ""
    echo -e "${YELLOW}Por favor corrige los errores antes de continuar${NC}"
    echo -e "${YELLOW}Ejecuta: ./setup.sh para instalar dependencias${NC}"
    exit 1
else
    echo -e "${GREEN}   Todo listo para desarrollo!${NC}"
    echo "========================================"
    echo ""
    echo -e "${YELLOW}Ejecuta estos comandos para iniciar:${NC}"
    echo -e "${CYAN}  cd frontend${NC}"
    echo -e "${CYAN}  npm run dev${NC}"
    echo ""
    echo -e "${CYAN}Abre en tu navegador: http://localhost:5173${NC}"
fi
echo ""
