import { google } from "@ai-sdk/google";

export const GEMINI_MODEL = "gemini-2.5-flash";

export function getGeminiModel() {
  return google(GEMINI_MODEL);
}