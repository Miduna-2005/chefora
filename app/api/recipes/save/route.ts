import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const userId = decoded.userId

    const recipe = await request.json()

    const { db } = await connectToDatabase()

    // Add recipe to user's favorites
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $addToSet: {
          favorites: {
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings,
            summary: recipe.summary,
            savedAt: new Date(),
          },
        },
      },
    )

    return NextResponse.json({ message: "Recipe saved successfully" })
  } catch (error) {
    console.error("Save recipe error:", error)
    return NextResponse.json({ message: "Failed to save recipe" }, { status: 500 })
  }
}
