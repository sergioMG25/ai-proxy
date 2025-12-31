# 🐳 Guía Rápida de Docker

## Archivos Docker Creados

- **Dockerfile**: Imagen basada en Bun 1.3.5 Alpine
- **.dockerignore**: Excluye archivos innecesarios del build
- **docker-compose.yml**: Orquestación simplificada con health checks

## 🚀 Uso Rápido

### Opción 1: Docker Compose (Recomendado)

```bash
# 1. Asegúrate de tener las API keys en .env
# 2. Inicia el servicio
docker-compose up -d

# 3. Verifica el estado
curl http://localhost:3001/health

# 4. Ver logs en tiempo real
docker-compose logs -f

# 5. Detener
docker-compose down
```

### Opción 2: Docker Run

```bash
# Construir
docker build -t ai-proxy-free .

# Ejecutar
docker run -d \
  -p 3001:3001 \
  -e GROQ_API_KEY=tu_clave \
  -e CEREBRAS_API_KEY=tu_clave \
  -e GOOGLE_API_KEY=tu_clave \
  --name ai-proxy \
  ai-proxy-free

# Ver logs
docker logs -f ai-proxy

# Detener
docker stop ai-proxy
docker rm ai-proxy
```

## 🏥 Health Checks

Docker verifica automáticamente el endpoint `/health` cada 30 segundos.

Estado de salud:

```bash
docker ps
# Busca "healthy" en la columna STATUS
```

## 📦 Características

- ✅ Imagen optimizada basada en Alpine (pequeña)
- ✅ Health checks automáticos integrados
- ✅ Restart automático en caso de fallo
- ✅ Variables de entorno desde .env
- ✅ Puerto 3001 expuesto

## 🔍 Debugging

```bash
# Entrar al contenedor
docker exec -it ai-proxy sh

# Ver logs detallados
docker-compose logs --tail=100 -f

# Estado del health check
docker inspect ai-proxy | grep Health -A 10
```
