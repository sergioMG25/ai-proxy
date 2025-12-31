import type { ChatMessage } from "./types";

// Logger utility
export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[${new Date().toISOString()}] INFO: ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[${new Date().toISOString()}] WARN: ${message}`, ...args);
  },
};

// Service statistics tracker
export class ServiceStats {
  private stats: Map<string, { count: number; failures: number }> = new Map();
  private startTime = Date.now();

  increment(serviceName: string) {
    const current = this.stats.get(serviceName) || { count: 0, failures: 0 };
    current.count++;
    this.stats.set(serviceName, current);
  }

  incrementFailure(serviceName: string) {
    const current = this.stats.get(serviceName) || { count: 0, failures: 0 };
    current.failures++;
    this.stats.set(serviceName, current);
  }

  getStats() {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    return {
      uptime: `${uptimeSeconds}s`,
      services: Object.fromEntries(this.stats),
    };
  }
}

// Input validation
export function validateChatRequest(body: any): {
  valid: boolean;
  error?: string;
  messages?: ChatMessage[];
} {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object" };
  }

  if (!Array.isArray(body.messages)) {
    return { valid: false, error: "Request must include 'messages' array" };
  }

  if (body.messages.length === 0) {
    return { valid: false, error: "Messages array cannot be empty" };
  }

  for (let i = 0; i < body.messages.length; i++) {
    const msg = body.messages[i];
    if (!msg.role || !msg.content) {
      return {
        valid: false,
        error: `Message at index ${i} missing 'role' or 'content'`,
      };
    }

    if (!["system", "user", "assistant"].includes(msg.role)) {
      return {
        valid: false,
        error: `Invalid role '${msg.role}' at index ${i}. Must be 'system', 'user', or 'assistant'`,
      };
    }

    if (typeof msg.content !== "string") {
      return {
        valid: false,
        error: `Content at index ${i} must be a string`,
      };
    }
  }

  return { valid: true, messages: body.messages as ChatMessage[] };
}

// Environment validation
export function validateEnvironment(): string[] {
  const errors: string[] = [];

  if (!process.env.GROQ_API_KEY) {
    errors.push("Missing GROQ_API_KEY environment variable");
  }
  if (!process.env.CEREBRAS_API_KEY) {
    errors.push("Missing CEREBRAS_API_KEY environment variable");
  }
  if (!process.env.GOOGLE_API_KEY) {
    errors.push("Missing GOOGLE_API_KEY environment variable");
  }

  return errors;
}

// Error response helper
export function createErrorResponse(message: string, status: number = 500) {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
