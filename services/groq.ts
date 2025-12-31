import Groq from "groq-sdk";
import type { AIService, ChatMessage } from "../types";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const groqService: AIService = {
  name: 'Groq',
  chat: async function* (messages: ChatMessage[]) {
    try {
      const stream = await client.chat.completions.create({
        messages: messages as any,
        model: "llama-3.3-70b-versatile",
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) yield content;
      }
    } catch (e: any) {
      const errorMsg = e?.message || String(e);
      throw new Error(`Groq service error: ${errorMsg}`);
    }
  }
};

