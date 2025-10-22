#!/bin/bash

echo "🔧 Optimizando layer (sin UPX)..."

# 1. Aplica strip (pero NO upx)
echo "Aplicando strip a engines nativos..."
cd layer/nodejs/node_modules/prisma/ 2>/dev/null && {
    strip libquery_engine-rhel-openssl-3.0.x.so.node 2>/dev/null
    cd - > /dev/null
}

cd layer/nodejs/node_modules/.prisma/client/ 2>/dev/null && {
    strip libquery_engine-rhel-openssl-3.0.x.so.node 2>/dev/null
    cd - > /dev/null
}

# 2. Elimina engines innecesarios
echo "Eliminando engines innecesarios..."
rm -f layer/nodejs/node_modules/prisma/libquery_engine-debian-*.so.node

# 3. Elimina archivos WASM
echo "Eliminando archivos WASM..."
find layer/nodejs/node_modules -name "*.wasm" -delete 2>/dev/null
find layer/nodejs/node_modules -name "*wasm-base64*" -delete 2>/dev/null

# 4. Elimina query engines de otros databases
find layer/nodejs/node_modules -name "query_engine_bg.mysql.*" -delete 2>/dev/null
find layer/nodejs/node_modules -name "query_engine_bg.sqlite.*" -delete 2>/dev/null
find layer/nodejs/node_modules -name "query_engine_bg.sqlserver.*" -delete 2>/dev/null
find layer/nodejs/node_modules -name "query_engine_bg.cockroachdb.*" -delete 2>/dev/null

# 5. Limpieza estándar
echo "Limpieza general..."
cd layer/nodejs/node_modules
find . -name "*.md" -type f -delete 2>/dev/null
find . -name "*.map" -type f -delete 2>/dev/null
find . -name "LICENSE*" -type f -delete 2>/dev/null
find . -name "test" -type d -exec rm -rf {} + 2>/dev/null
find . -name "tests" -type d -exec rm -rf {} + 2>/dev/null
find . -name "docs" -type d -exec rm -rf {} + 2>/dev/null
cd - > /dev/null

echo "✅ Layer optimizado (sin UPX para compatibilidad)"
du -sh layer/
