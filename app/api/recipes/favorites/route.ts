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

    const { db } = await connectToDatabase()

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) }, { projection: { favorites: 1 } })

    return NextResponse.json({
      favorites: user?.favorites || [],
    })
  } catch (error) {
    console.error("Get favorites error:", error)
    return NextResponse.json({ message: "Failed to get favorites" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const userId = decoded.userId

    const { recipeId } = await request.json()

    const { db } = await connectToDatabase()

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $pull: {
          favorites: { id: recipeId },
        },
      },
    )

    return NextResponse.json({ message: "Recipe removed from favorites" })
  } catch (error) {
    console.error("Remove favorite error:", error)
    return NextResponse.json({ message: "Failed to remove favorite" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const userId = decoded.userId

    const updatedRecipe = await request.json()

    const { db } = await connectToDatabase()

    // Update the specific recipe in the favorites array
    await db.collection("users").updateOne(
      {
        _id: new ObjectId(userId),
        "favorites.id": updatedRecipe.id,
      },
      {
        $set: {
          "favorites.$.personalNotes": updatedRecipe.personalNotes,
          "favorites.$.personalRating": updatedRecipe.personalRating,
          "favorites.$.cookingHistory": updatedRecipe.cookingHistory,
          "favorites.$.updatedAt": new Date(),
        },
      },
    )

    return NextResponse.json({ message: "Recipe updated successfully" })
  } catch (error) {
    console.error("Update favorite error:", error)
    return NextResponse.json({ message: "Failed to update favorite" }, { status: 500 })
  }
}
