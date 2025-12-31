import Groq from "groq-sdk";
import type { AIService, ChatMessage } from "../types";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const groqService: AIService = {
  name: 'Groq',
  chat: async function* (messages: ChatMessage[]) {
    try {
      const completion = await client.chat.completions.create({
        messages: messages,
        model: "mixtral-8x7b-32768",
        stream: true,
      });

      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) yield content;
      }
    } catch (e: any) {
      const errorMsg = e?.message || String(e);
      throw new Error(`Groq service error: ${errorMsg}`);
    }
  }
};

