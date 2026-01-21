import { type NextRequest, NextResponse } from "next/server"

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!SPOONACULAR_API_KEY) {
      return NextResponse.json({ message: "Spoonacular API key not configured" }, { status: 500 })
    }

    const response = await fetch(
      `https://api.spoonacular.com/recipes/${id}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=true`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch recipe details")
    }

    const data = await response.json()

    // Format the recipe data
    const formattedRecipe = {
      id: data.id,
      title: data.title,
      image: data.image,
      readyInMinutes: data.readyInMinutes,
      servings: data.servings,
      summary: data.summary,
      instructions: data.instructions,
      ingredients: data.extendedIngredients?.map((ing: any) => ing.original) || [],
      nutrition: data.nutrition,
      diets: data.diets || [],
      cuisines: data.cuisines || [],
      dishTypes: data.dishTypes || [],
      spoonacularScore: data.spoonacularScore,
    }

    return NextResponse.json(formattedRecipe)
  } catch (error) {
    console.error("Recipe details error:", error)
    return NextResponse.json({ message: "Failed to fetch recipe details" }, { status: 500 })
  }
}
