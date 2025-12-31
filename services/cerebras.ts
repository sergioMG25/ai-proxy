import Cerebras from "@cerebras/cerebras_cloud_sdk";
import type { AIService, ChatMessage } from "../types";

const client = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
});

export const cerebrasService: AIService = {
  name: 'Cerebras',
  chat: async function* (messages: ChatMessage[]) {
    try {
      const completion = await client.chat.completions.create({
        messages: messages,
        model: "llama3-70b-8192",
        stream: true,
      });

      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) yield content;
      }
    } catch (e: any) {
      const errorMsg = e?.message || String(e);
      throw new Error(`Cerebras service error: ${errorMsg}`);
    }
  }
};

