import axios from "axios";

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || "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";

export async function queryHuggingFace(model: string, inputs: string) {
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        },
      }
    );

    return response.data;
  } catch (err: any) {
    console.error("HuggingFace API error:", err?.response?.data || err.message);
    throw new Error("Failed to generate content from Hugging Face");
  }
}
