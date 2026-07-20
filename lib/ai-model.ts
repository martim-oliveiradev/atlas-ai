import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
  "gemini-2.0-flash-lite",
].filter((id, i, arr): id is string => !!id && arr.indexOf(id) === i);

let cached: Promise<string> | null = null;

async function findWorkingModel() {
  for (const id of FALLBACK_MODELS) {
    try {
      await generateText({ model: google(id), prompt: "ping", maxOutputTokens: 5 });
      return id;
    } catch {
      continue;
    }
  }
  return FALLBACK_MODELS[0];
}

export function getModel() {
  if (!cached) cached = findWorkingModel();
  return cached.then((id) => google(id));
}

export function reportModelFailure() {
  cached = null;
}
