import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY
const API_NINJAS_KEY = process.env.API_NINJAS_KEY

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json({ message: "Query parameter is required" }, { status: 400 })
    }

    let data = { results: [] }
    let dataSource = "spoonacular"

    // Try Spoonacular first
    if (SPOONACULAR_API_KEY) {
      try {
        const response = await fetch(
          `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(query)}&number=12&addRecipeInformation=true&fillIngredients=true`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        if (response.ok) {
          data = await response.json()
        } else {
          throw new Error("Spoonacular API failed")
        }
      } catch (spoonacularError) {
        console.error("Spoonacular API error:", spoonacularError)
        
        // Fallback to API Ninjas if Spoonacular fails
        if (API_NINJAS_KEY) {
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
              
              // Format API Ninjas data to match Spoonacular structure
              const formattedResults = ninjasData.slice(0, 12).map((recipe: any, index: number) => ({
                id: `ninjas_${Date.now()}_${index}`,
                title: recipe.title,
                image: null,
                readyInMinutes: null,
                servings: recipe.servings || null,
                summary: null,
                instructions: recipe.instructions,
                extendedIngredients: recipe.ingredients ? 
                  recipe.ingredients.split('|').map((ing: string, idx: number) => ({
                    id: idx,
                    original: ing.trim(),
                    name: ing.trim()
                  })) : [],
                nutrition: null,
                diets: [],
                cuisines: [],
                dishTypes: [],
                spoonacularScore: null,
                source: "api-ninjas"
              }))

              data = { results: formattedResults }
              dataSource = "api-ninjas"
            } else {
              throw new Error("Both APIs failed")
            }
          } catch (ninjasError) {
            console.error("API Ninjas error:", ninjasError)
            throw new Error("All recipe APIs failed")
          }
        } else {
          throw new Error("No backup API available")
        }
      }
    } else if (API_NINJAS_KEY) {
      // Use API Ninjas as primary if Spoonacular key is not available
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
          
          // Format API Ninjas data to match Spoonacular structure
          const formattedResults = ninjasData.slice(0, 12).map((recipe: any, index: number) => ({
            id: `ninjas_${Date.now()}_${index}`,
            title: recipe.title,
            image: null,
            readyInMinutes: null,
            servings: recipe.servings || null,
            summary: null,
            instructions: recipe.instructions,
            extendedIngredients: recipe.ingredients ? 
              recipe.ingredients.split('|').map((ing: string, idx: number) => ({
                id: idx,
                original: ing.trim(),
                name: ing.trim()
              })) : [],
            nutrition: null,
            diets: [],
            cuisines: [],
            dishTypes: [],
            spoonacularScore: null,
            source: "api-ninjas"
          }))

          data = { results: formattedResults }
          dataSource = "api-ninjas"
        } else {
          throw new Error("API Ninjas failed")
        }
      } catch (error) {
        console.error("API Ninjas error:", error)
        throw new Error("API Ninjas failed")
      }
    } else {
      return NextResponse.json({ message: "No recipe API keys configured" }, { status: 500 })
    }

    // Get our database connection to fetch ratings
    const { db } = await connectToDatabase()

    // Enhance recipes with our rating data
    const enhancedRecipes = await Promise.all(
      data.results.map(async (recipe: any) => {
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
      }),
    )

    return NextResponse.json({
      ...data,
      results: enhancedRecipes,
      dataSource,
      totalResults: enhancedRecipes.length,
    })
  } catch (error) {
    console.error("Recipe search error:", error)
    return NextResponse.json({ message: "Failed to search recipes" }, { status: 500 })
  }
}
