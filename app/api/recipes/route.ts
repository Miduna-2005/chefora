import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY
const API_NINJAS_KEY = process.env.API_NINJAS_KEY

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")
    const source = searchParams.get("source") || "spoonacular" // Default to spoonacular
    const limit = searchParams.get("limit") || "12"

    if (!query) {
      return NextResponse.json({ message: "Query parameter is required" }, { status: 400 })
    }

    let recipes = []

    // Use API Ninjas for food searching and finding
    if (source === "ninjas" || source === "both") {
      if (!API_NINJAS_KEY) {
        return NextResponse.json({ message: "API Ninjas key not configured" }, { status: 500 })
      }

      try {
        const ninjasResponse = await fetch(
          `https://api.api-ninjas.com/v1/recipe?query=${encodeURIComponent(query)}`,
          {
            headers: {
              "X-Api-Key": API_NINJAS_KEY,
              "Content-Type": "application/json",
            },
          }
        )

        if (ninjasResponse.ok) {
          const ninjasData = await ninjasResponse.json()
          
          // Format API Ninjas data to match our expected structure
          const formattedNinjasRecipes = ninjasData.map((recipe: any, index: number) => ({
            id: `ninjas_${Date.now()}_${index}`, // Generate unique ID
            title: recipe.title,
            image: null, // API Ninjas doesn't provide images
            readyInMinutes: null,
            servings: recipe.servings || null,
            summary: null,
            instructions: recipe.instructions,
            ingredients: recipe.ingredients ? recipe.ingredients.split('|').map((ing: string) => ing.trim()) : [],
            nutrition: null,
            diets: [],
            cuisines: [],
            dishTypes: [],
            spoonacularScore: null,
            source: "api-ninjas"
          }))

          recipes = [...recipes, ...formattedNinjasRecipes]
        }
      } catch (error) {
        console.error("API Ninjas search error:", error)
        // Continue with other sources if API Ninjas fails
      }
    }

    // Use Spoonacular for additional recipe data
    if (source === "spoonacular" || source === "both") {
      if (!SPOONACULAR_API_KEY) {
        return NextResponse.json({ message: "Spoonacular API key not configured" }, { status: 500 })
      }

      try {
        const spoonacularResponse = await fetch(
          `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(query)}&number=${limit}&addRecipeInformation=true&fillIngredients=true`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )

        if (spoonacularResponse.ok) {
          const spoonacularData = await spoonacularResponse.json()
          
          // Format Spoonacular data
          const formattedSpoonacularRecipes = spoonacularData.results.map((recipe: any) => ({
            ...recipe,
            source: "spoonacular"
          }))

          recipes = [...recipes, ...formattedSpoonacularRecipes]
        }
      } catch (error) {
        console.error("Spoonacular search error:", error)
        // Continue with other sources if Spoonacular fails
      }
    }

    // Get our database connection to fetch ratings for all recipes
    try {
      const { db } = await connectToDatabase()

      // Enhance recipes with our rating data
      const enhancedRecipes = await Promise.all(
        recipes.map(async (recipe: any) => {
          try {
            const reviews = await db.collection("reviews").find({ recipeId: recipe.id }).toArray()

            const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0)
            const averageRating = reviews.length > 0 ? Math.round((totalRating / reviews.length) * 10) / 10 : null

            return {
              ...recipe,
              averageRating,
              totalReviews: reviews.length,
            }
          } catch (error) {
            // If there's an error fetching reviews, return recipe without ratings
            return recipe
          }
        })
      )

      return NextResponse.json({
        results: enhancedRecipes,
        totalResults: enhancedRecipes.length,
        query,
        source
      })
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      // Return recipes without ratings if database fails
      return NextResponse.json({
        results: recipes,
        totalResults: recipes.length,
        query,
        source
      })
    }

  } catch (error) {
    console.error("Recipe search error:", error)
    return NextResponse.json({ message: "Failed to search recipes" }, { status: 500 })
  }
}

// POST method for creating/saving recipes (if needed)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { db } = await connectToDatabase()

    // Add timestamp
    const recipeData = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection("recipes").insertOne(recipeData)

    return NextResponse.json({
      message: "Recipe saved successfully",
      recipeId: result.insertedId
    }, { status: 201 })

  } catch (error) {
    console.error("Recipe save error:", error)
    return NextResponse.json({ message: "Failed to save recipe" }, { status: 500 })
  }
}