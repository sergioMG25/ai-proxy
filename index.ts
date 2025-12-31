import { groqService } from "./services/groq";
import { cerebrasService } from "./services/cerebras";
import { geminiService } from "./services/gemini";
import type { ChatMessage } from "./types";
import {
  logger,
  ServiceStats,
  validateChatRequest,
  validateEnvironment,
  createErrorResponse,
} from "./utils";

const services = [groqService, cerebrasService, geminiService];
let currentServiceIndex = 0;
const stats = new ServiceStats();

// Validate environment on startup
const envErrors = validateEnvironment();
if (envErrors.length > 0) {
  logger.warn("Environment validation warnings:");
  envErrors.forEach((err) => logger.warn(`  - ${err}`));
  logger.warn("Some services may not work correctly");
}

const getNextService = () => {
  const service = services[currentServiceIndex];
  currentServiceIndex = (currentServiceIndex + 1) % services.length;
  return service;
};

// Try to get a response from services with automatic fallback
async function* chatWithFallback(messages: ChatMessage[]) {
  const maxAttempts = services.length;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const service = getNextService();
    logger.info(`Attempt ${attempt + 1}/${maxAttempts}: Using service ${service.name}`);

    try {
      stats.increment(service.name);
      
      let hasYielded = false;
      for await (const chunk of service.chat(messages)) {
        hasYielded = true;
        yield chunk;
      }
      
      if (hasYielded) {
        logger.info(`Successfully completed request with ${service.name}`);
        return; // Success!
      }
    } catch (error) {
      lastError = error as Error;
      stats.incrementFailure(service.name);
      logger.error(`Service ${service.name} failed:`, error);
      
      // If this isn't the last attempt, try the next service
      if (attempt < maxAttempts - 1) {
        logger.info(`Falling back to next service...`);
        continue;
      }
    }
  }

  // All services failed
  throw new Error(
    `All services failed. Last error: ${lastError?.message || "Unknown error"}`
  );
}

Bun.serve({
  port: process.env.PORT || 3001,
  async fetch(req) {
    const url = new URL(req.url);

    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Health check endpoint
    if (req.method === "GET" && url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          timestamp: new Date().toISOString(),
          stats: stats.getStats(),
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Chat endpoint
    if (req.method === "POST" && url.pathname === "/chat") {
      try {
        const body = await req.json();
        
        // Validate input
        const validation = validateChatRequest(body);
        if (!validation.valid) {
          logger.warn(`Invalid request: ${validation.error}`);
          return createErrorResponse(validation.error!, 400);
        }

        const messages = validation.messages!;
        logger.info(`Processing chat request with ${messages.length} messages`);

        return new Response(
          new ReadableStream({
            async start(controller) {
              const encoder = new TextEncoder();
              try {
                for await (const chunk of chatWithFallback(messages)) {
                  controller.enqueue(encoder.encode(chunk));
                }
                controller.close();
              } catch (err) {
                const error = err as Error;
                logger.error("Stream error:", error);
                controller.enqueue(
                  encoder.encode(`\n\nError: ${error.message}`)
                );
                controller.close();
              }
            },
          }),
          {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              "Connection": "keep-alive",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      } catch (error) {
        logger.error("Request processing error:", error);
        return createErrorResponse("Error processing request", 500);
      }
    }

    return createErrorResponse("Not Found", 404);
  },
});

logger.info(`🚀 Server running on port ${process.env.PORT || 3001}`);
