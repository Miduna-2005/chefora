"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Star, Heart, Plus, Trash2 } from "lucide-react"
import { motion } from "framer-motion"

interface Recipe {
  id: number
  title: string
  image: string
  readyInMinutes: number
  servings: number
  summary: string
  averageRating?: number
  totalReviews?: number
  spoonacularScore?: number
}

interface RecipeCardProps {
  recipe: Recipe
  isFavorite?: boolean
  onRecipeClick: (recipe: Recipe) => void
  onSaveRecipe?: (recipe: Recipe) => void
  onRemoveFavorite?: (recipeId: number) => void
  index?: number
}

export function RecipeCard({
  recipe,
  isFavorite = false,
  onRecipeClick,
  onSaveRecipe,
  onRemoveFavorite,
  index = 0,
}: RecipeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] cursor-pointer border-0 bg-white/90 backdrop-blur-sm">
        <div className="aspect-video relative overflow-hidden" onClick={() => onRecipeClick(recipe)}>
          <img
            src={recipe.image || "/placeholder.svg?height=200&width=300"}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-2 right-2">
            {isFavorite ? (
              <Button
                size="sm"
                variant="destructive"
                className="rounded-full bg-red-500/90 hover:bg-red-600 shadow-lg"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveFavorite?.(recipe.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full bg-white/90 hover:bg-white shadow-lg"
                onClick={(e) => {
                  e.stopPropagation()
                  onSaveRecipe?.(recipe)
                }}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            )}
          </div>
          {isFavorite && (
            <Badge className="absolute bottom-2 left-2 bg-red-500 text-white">
              <Heart className="h-3 w-3 mr-1 fill-current" />
              Favorite
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {recipe.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {recipe.readyInMinutes} min
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {recipe.servings}
              </div>
            </div>
            {recipe.averageRating && (
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium">{recipe.averageRating}</span>
                <span className="text-xs text-gray-500 ml-1">({recipe.totalReviews})</span>
              </div>
            )}
          </div>
          {isFavorite ? (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onRemoveFavorite?.(recipe.id)
              }}
              variant="outline"
              className="w-full hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          ) : (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onSaveRecipe?.(recipe)
              }}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isFavorite}
            >
              {isFavorite ? (
                <>
                  <Heart className="h-4 w-4 mr-2 fill-current" />
                  Saved
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Save Recipe
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
