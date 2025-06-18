import { Request, Response } from "express";
import PdfParse from "pdf-parse";
import OpenAI from "openai";
import pinecone from "../utils/pinecone";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function splitText(text: string, chunkSize = 1000): string[] {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

export const handlePDFUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file || !req.file.buffer) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    // ✅ File size limit check (10 MB)
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (req.file.size > maxSize) {
      res.status(413).json({ error: "File too large. Max 10 MB allowed." });
      return;
    }

    const data = await PdfParse(req.file.buffer);
    const textChunks = splitText(data.text);

    const embeddings = await Promise.all(
      textChunks.map(async (chunk) => {
        const response = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: chunk,
        });
        return {
          embedding: response.data[0].embedding,
          text: chunk,
        };
      })
    );

    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
    const fileId = `file-${Date.now()}`;
    const vectors = embeddings.map((e, i) => ({
      id: `${fileId}-chunk-${i}`,
      values: e.embedding,
      metadata: {
        text: e.text,
        fileId,
      },
    }));

    await index.upsert(vectors);

    res.json({ embeddings });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to process PDF" });
  }
};
