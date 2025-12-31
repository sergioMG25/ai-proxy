# 📮 Colección de Postman - AI Proxy

Esta colección de Postman te permite probar fácilmente todos los endpoints del AI Proxy.

## 📥 Importar la Colección

1. Abre Postman
2. Click en **Import** (Importar)
3. Selecciona el archivo `AI-Proxy.postman_collection.json`
4. La colección "AI Proxy API" aparecerá en tu panel izquierdo

## 🔧 Configuración

### Variables de Entorno

La colección incluye una variable por defecto:

- `baseUrl`: `http://localhost:3001`

**Para cambiar el servidor:**

1. En Postman, selecciona la colección "AI Proxy API"
2. Ve a la pestaña **Variables**
3. Modifica el valor de `baseUrl` según sea necesario:
   - Local: `http://localhost:3001`
   - Producción: `https://tu-servidor.com`
   - Dokploy: `https://tu-dominio.dokploy.com`

## 📋 Peticiones Incluidas

### 1. **Health Check** 🏥

Verifica el estado del servidor y obtiene estadísticas.

**Método:** `GET /health`

**Tests automáticos:**

- ✅ Código de estado 200
- ✅ Status es "healthy"

---

### 2. **Chat - Groq** 🦙

Petición usando el servicio Groq con llama3-8b-8192.

**Método:** `POST /chat`

**Body:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Explica qué es la inteligencia artificial en una frase corta"
    }
  ],
  "service": "groq",
  "model": "llama3-8b-8192"
}
```

**Tests automáticos:**

- ✅ Código de estado 200
- ✅ Respuesta contiene contenido
- ✅ Servicio usado es Groq

---

### 3. **Chat - Cerebras** 🧠

Petición usando el servicio Cerebras con llama3.1-8b.

**Método:** `POST /chat`

**Body:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "¿Cuál es la capital de Francia?"
    }
  ],
  "service": "cerebras",
  "model": "llama3.1-8b"
}
```

**Tests automáticos:**

- ✅ Código de estado 200
- ✅ Respuesta contiene contenido
- ✅ Servicio usado es Cerebras

---

### 4. **Chat - Gemini** ✨

Petición usando el servicio Gemini con gemini-2.0-flash-exp.

**Método:** `POST /chat`

**Body:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Escribe un haiku sobre la programación"
    }
  ],
  "service": "gemini",
  "model": "gemini-2.0-flash-exp"
}
```

**Tests automáticos:**

- ✅ Código de estado 200
- ✅ Respuesta contiene contenido
- ✅ Servicio usado es Gemini

---

### 5. **Chat - Auto (Round-Robin)** 🔄

Petición sin especificar servicio. El sistema distribuye la carga automáticamente.

**Método:** `POST /chat`

**Body:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Dame un dato curioso sobre el espacio"
    }
  ]
}
```

**Tests automáticos:**

- ✅ Código de estado 200
- ✅ Respuesta contiene contenido
- ✅ Servicio seleccionado automáticamente (Groq, Cerebras o Gemini)

---

### 6. **Chat - Conversación Multi-turno** 💬

Ejemplo de conversación con múltiples mensajes manteniendo contexto.

**Método:** `POST /chat`

**Body:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "¿Cuál es la capital de España?"
    },
    {
      "role": "assistant",
      "content": "La capital de España es Madrid."
    },
    {
      "role": "user",
      "content": "¿Cuántos habitantes tiene aproximadamente?"
    }
  ],
  "service": "groq"
}
```

---

### 7. **Chat - Con Parámetros Avanzados** ⚙️

Ejemplo usando temperatura, max_tokens y mensaje de sistema.

**Método:** `POST /chat`

**Body:**

```json
{
  "messages": [
    {
      "role": "system",
      "content": "Eres un asistente experto en historia."
    },
    {
      "role": "user",
      "content": "Cuéntame sobre la Revolución Francesa en 3 puntos"
    }
  ],
  "service": "gemini",
  "model": "gemini-2.0-flash-exp",
  "temperature": 0.7,
  "max_tokens": 500
}
```

## 🧪 Tests Automáticos

Todas las peticiones incluyen tests automáticos que se ejecutan después de cada request:

- Validación de códigos de estado HTTP
- Verificación de estructura de respuesta
- Validación de servicios utilizados

**Para ver resultados de tests:**

1. Ejecuta una petición
2. Ve a la pestaña **Test Results** en la respuesta
3. Verás ✅ tests pasados y ❌ tests fallidos

## 🚀 Uso Rápido

1. **Importa** la colección
2. **Asegúrate** de que el servidor esté corriendo (`bun run index.ts`)
3. **Ejecuta** cualquier petición haciendo click en **Send**
4. **Revisa** la respuesta y los tests automáticos

## 📦 Runner de Colección

Para ejecutar todas las peticiones automáticamente:

1. Click derecho en "AI Proxy API"
2. Selecciona **Run collection**
3. Click en **Run AI Proxy API**
4. Verás todas las peticiones ejecutarse en secuencia con sus resultados

## 💡 Tips

- Usa **Ctrl+Enter** (Windows) o **Cmd+Enter** (Mac) para enviar peticiones rápidamente
- Guarda respuestas interesantes como **Examples** para referencia futura
- Crea **Environments** separados para desarrollo, staging y producción
- Duplica peticiones para crear variaciones con diferentes parámetros

## 🔗 Enlaces Útiles

- [Documentación Principal](README.md)
- [Documentación Docker](DOCKER.md)
- [API de Postman](https://learning.postman.com/)
