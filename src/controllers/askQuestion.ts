import { Request, Response } from "express";
import OpenAI from "openai";
import pinecone from "../utils/pinecone";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const askQuestion = async (req: Request, res: Response) => {
  try {
    const { question, fileId } = req.body;

    if (!question || !fileId) {
      res.status(400).json({ error: "Question and fileId are required" });
      return;
    }

    const questionEmbedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });

    const queryVector = questionEmbedding.data[0].embedding;

    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

    const searchResponse = await index.query({
      topK: 5,
      vector: queryVector,
      includeMetadata: true,
      filter: {
        fileId: { $eq: fileId }, // ✅ This ensures only relevant PDF chunks are returned
      },
    });

    const matchedChunks = searchResponse.matches
      .map((match) => match.metadata?.text)
      .filter(Boolean)
      .join("\n\n");

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are ChatGPT, a helpful and knowledgeable assistant. You answer the user's questions clearly and accurately based on the provided context. If the context doesn’t have the answer, use your general knowledge. Always sound natural and human-like.",
        },
        {
          role: "user",
          content: `Context:\n${matchedChunks}\n\nQuestion: ${question}`,
        },
      ],
      temperature: 0.2,
    });

    const answer = chatResponse.choices[0].message.content;

    res.json({ answer });
  } catch (err) {
    console.error("Error in askQuestion:", err);
    res.status(500).json({ error: "Failed to answer question" });
  }
};
