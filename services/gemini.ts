import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIService, ChatMessage } from "../types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

export const geminiService: AIService = {
  name: 'Gemini',
  chat: async function* (messages: ChatMessage[]) {
    try {
      const historyMessages = messages.slice(0, -1);
      const lastMessage = messages[messages.length - 1];

      const history = historyMessages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      const chatSession = model.startChat({ history });
      const result = await chatSession.sendMessageStream(lastMessage.content);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) yield chunkText;
      }
    } catch (e: any) {
      const errorMsg = e?.message || String(e);
      throw new Error(`Gemini service error: ${errorMsg}`);
    }
  }
};

