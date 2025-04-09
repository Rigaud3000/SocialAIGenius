import fetch from "node-fetch"; // or use global fetch if you're on Node 18+
import dotenv from "dotenv";
dotenv.config();

export async function queryHuggingFace(model: string, prompt: string) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
