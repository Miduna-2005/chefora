import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const userId = decoded.userId

    const { searchParams } = new URL(request.url)
    const recipeId = searchParams.get("recipeId")

    if (!recipeId) {
      return NextResponse.json({ message: "Recipe ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const userReview = await db.collection("reviews").findOne({
      recipeId: Number.parseInt(recipeId),
      userId: new ObjectId(userId),
    })

    return NextResponse.json({
      userReview: userReview
        ? {
            rating: userReview.rating,
            review: userReview.review,
            createdAt: userReview.createdAt,
            updatedAt: userReview.updatedAt,
          }
        : null,
    })
  } catch (error) {
    console.error("Get user review error:", error)
    return NextResponse.json({ message: "Failed to get user review" }, { status: 500 })
  }
}
