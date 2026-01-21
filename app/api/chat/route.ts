import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { CohereClient } from "cohere-ai";

const JWT_SECRET = process.env.JWT_SECRET || "ffddafe1ea71a4f1610d52e362320545378abb057999882e6b0b844e318f7c89";
const COHERE_API_KEY = process.env.COHERE_API_KEY || "817qsQT7HU2ctsHHA4xzR2EnVJDRN31UbXO6mEEw";

// Initialize Cohere client
const cohere = new CohereClient({
  token: COHERE_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization token required" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    jwt.verify(token, JWT_SECRET);

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ message: "Message is required" }, { status: 400 });
    }

    // Use Cohere to generate text
    const response = await cohere.generate({
      model: 'command',
      prompt: `You are a helpful cooking assistant. Provide cooking advice, recipe suggestions, ingredient substitutions, and cooking tips. Keep responses concise and practical.\n\nUser: ${message}\nAssistant:`,
      maxTokens: 150,
      temperature: 0.7,
    });

    const text = response.generations[0].text.trim();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ message: "Failed to get AI response" }, { status: 500 });
  }
}
