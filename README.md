# AI Proxy Free

Servidor proxy que distribuye solicitudes entre múltiples proveedores de IA (Groq, Cerebras, Gemini) con **balanceo automático** y **fallback inteligente**.

## 🌟 Características

- 🔄 **Balanceo Round-Robin**: Distribuye solicitudes entre los 3 proveedores
- 🛡️ **Fallback Automático**: Si un servicio falla, automáticamente usa el siguiente
- 🏥 **Health Monitoring**: Endpoint para verificar estado y estadísticas
- ✅ **Validación de Entrada**: Valida requests antes de procesarlos
- 📊 **Logging Mejorado**: Logs con timestamps y tracking de uso
- ⚡ **Streaming**: Respuestas en tiempo real con Server-Sent Events
- 🌐 **CORS**: Habilitado para desarrollo local

## 📋 Requisitos

- [Bun](https://bun.sh) instalado en tu sistema
- Claves API de:
  - [Groq](https://console.groq.com)
  - [Cerebras](https://cloud.cerebras.ai)
  - [Google AI](https://makersuite.google.com/app/apikey)

## 🚀 Instalación

1. **Instala las dependencias:**

```bash
bun install
```

2. **Configura tus claves API en el archivo `.env`:**

```env
GROQ_API_KEY=tu_clave_real_de_groq
CEREBRAS_API_KEY=tu_clave_real_de_cerebras
GOOGLE_API_KEY=tu_clave_real_de_google
PORT=3001
```

## 💻 Uso

### Iniciar el servidor

```bash
bun run index.ts
```

El servidor iniciará en el puerto 3001 (o el configurado en `.env`).

### Endpoint: POST /chat

Envía solicitudes de chat con streaming:

```bash
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hola, ¿cómo estás?"}
    ]
  }'
```

**Request:**

```json
{
  "messages": [
    { "role": "system", "content": "Eres un asistente útil" },
    { "role": "user", "content": "¿Qué es TypeScript?" }
  ]
}
```

**Response:** Stream de texto con los chunks de la respuesta

### Endpoint: GET /health

Verifica el estado del servidor y obtén estadísticas:

```bash
curl http://localhost:3001/health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-12-30T06:10:00.000Z",
  "stats": {
    "uptime": "3600s",
    "services": {
      "Groq": { "count": 10, "failures": 1 },
      "Cerebras": { "count": 8, "failures": 0 },
      "Gemini": { "count": 9, "failures": 2 }
    }
  }
}
```

## 🏗️ Arquitectura

### Balanceo Round-Robin

El servidor distribuye las solicitudes entre los tres proveedores de IA:

1. Primera solicitud → Groq
2. Segunda solicitud → Cerebras
3. Tercera solicitud → Gemini
4. Cuarta solicitud → Groq (y así sucesivamente)

### Fallback Automático

Si un servicio falla (por API key inválida, límite de rate, error de red, etc.), el sistema **automáticamente** intenta con el siguiente servicio disponible:

```
Request → Groq (falla) → Cerebras (falla) → Gemini (éxito) → Response
```

Esto garantiza alta disponibilidad incluso cuando uno o más servicios están caídos.

### Modelos Usados

- **Groq**: `mixtral-8x7b-32768`
- **Cerebras**: `llama3-70b-8192`
- **Gemini**: `gemini-1.5-flash`

## 📁 Estructura del Proyecto

```
ai-proxy-free/
├── services/
│   ├── groq.ts       - Integración con Groq
│   ├── cerebras.ts   - Integración con Cerebras
│   └── gemini.ts     - Integración con Gemini
├── types.ts          - Interfaces TypeScript
├── utils.ts          - Utilidades (logging, validación, stats)
├── index.ts          - Servidor principal
├── tsconfig.json     - Configuración TypeScript
├── package.json      - Dependencias
└── .env              - Variables de entorno
```

## 🔍 Logging

El servidor proporciona logs detallados con timestamps:

```
[2025-12-30T06:10:00.000Z] INFO: 🚀 Server running on port 3001
[2025-12-30T06:10:05.123Z] INFO: Processing chat request with 2 messages
[2025-12-30T06:10:05.124Z] INFO: Attempt 1/3: Using service Groq
[2025-12-30T06:10:06.456Z] INFO: Successfully completed request with Groq
```

## ⚠️ Manejo de Errores

### Validación de Entrada

El servidor valida:

- Que exista un array `messages`
- Que cada mensaje tenga `role` y `content`
- Que el `role` sea válido: `system`, `user`, o `assistant`

### Respuestas de Error

Todas las respuestas de error son JSON estructurado:

```json
{
  "error": "Request must include 'messages' array"
}
```

## 🐳 Docker

### Construcción de la Imagen

```bash
docker build -t ai-proxy-free .
```

### Ejecutar con Docker

```bash
docker run -d \
  -p 3001:3001 \
  -e GROQ_API_KEY=tu_clave_groq \
  -e CEREBRAS_API_KEY=tu_clave_cerebras \
  -e GOOGLE_API_KEY=tu_clave_google \
  --name ai-proxy \
  ai-proxy-free
```

### Ejecutar con Docker Compose

1. Asegúrate de tener tus claves API en el archivo `.env`

2. Inicia el servicio:

```bash
docker-compose up -d
```

3. Ver logs:

```bash
docker-compose logs -f
```

4. Detener el servicio:

```bash
docker-compose down
```

### Health Check

Docker incluye health checks automáticos que verifican el endpoint `/health` cada 30 segundos.

## 🔧 Desarrollo

### Requisitos de TypeScript

El proyecto usa TypeScript con configuración estricta. Los tipos globales de Bun están incluidos.

### Environment Variables

Si faltan variables de entorno, el servidor mostrará warnings pero continuará ejecutándose (los servicios sin API key fallarán cuando se usen).

## 📝 Notas

- El servidor usa CORS abierto (`*`) para facilitar el desarrollo local
- Las respuestas se envían en formato Server-Sent Events (SSE)
- El fallback automático mejora significativamente la disponibilidad
- Las estadísticas se reinician cuando el servidor se reinicia

## 🐛 Troubleshooting

**Problema**: "All services failed"

- **Solución**: Verifica que al menos una API key sea válida en `.env`

**Problema**: Errores de TypeScript

- **Solución**: Ejecuta `bun install` para instalar las dependencias

**Problema**: El servidor no inicia

- **Solución**: Asegúrate de tener Bun instalado y que el puerto 3001 esté disponible
