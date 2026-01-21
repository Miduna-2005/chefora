"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clock, Users, Star, Heart, Trash2, Edit3, Save, Calendar, ChefHat, BookOpen, MoreVertical } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Recipe {
  id: number
  title: string
  image: string
  readyInMinutes: number
  servings: number
  summary: string
  averageRating?: number
  totalReviews?: number
  savedAt?: string
  personalNotes?: string
  personalRating?: number
  cookingHistory?: Array<{ date: string; notes?: string }>
}

interface FavoriteRecipeCardProps {
  recipe: Recipe
  onRecipeClick: (recipe: Recipe) => void
  onRemoveFavorite: (recipeId: number) => void
  onUpdateFavorite: (recipe: Recipe) => void
  index?: number
}

export function FavoriteRecipeCard({
  recipe,
  onRecipeClick,
  onRemoveFavorite,
  onUpdateFavorite,
  index = 0,
}: FavoriteRecipeCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editedRecipe, setEditedRecipe] = useState(recipe)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSaveEdit = async () => {
    setIsLoading(true)
    try {
      await onUpdateFavorite(editedRecipe)
      setShowEditDialog(false)
      toast({
        title: "Recipe Updated! ✨",
        description: "Your personal notes and rating have been saved.",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Unable to update recipe. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsCooked = () => {
    const newCookingHistory = [
      ...(editedRecipe.cookingHistory || []),
      { date: new Date().toISOString(), notes: "Cooked this recipe" },
    ]
    setEditedRecipe({ ...editedRecipe, cookingHistory: newCookingHistory })
    onUpdateFavorite({ ...editedRecipe, cookingHistory: newCookingHistory })
    toast({
      title: "Marked as Cooked! 👨‍🍳",
      description: "Added to your cooking history.",
    })
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently saved"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const renderStars = (rating: number, interactive = false, size = "w-4 h-4") => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${interactive ? "cursor-pointer" : ""} transition-colors duration-200 ${
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
            onClick={interactive ? () => setEditedRecipe({ ...editedRecipe, personalRating: star }) : undefined}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        whileHover={{ y: -5 }}
        className="group"
      >
        <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white/95 backdrop-blur-sm relative">
          {/* Recipe Image */}
          <div className="aspect-video relative overflow-hidden cursor-pointer" onClick={() => onRecipeClick(recipe)}>
            <img
              src={recipe.image || "/placeholder.svg?height=200&width=300"}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Action Menu */}
            <div className="absolute top-3 right-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleMarkAsCooked}>
                    <ChefHat className="h-4 w-4 mr-2" />
                    Mark as Cooked
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRecipeClick(recipe)}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Recipe
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onRemoveFavorite(recipe.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove from Favorites
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Favorite Badge */}
            <Badge className="absolute bottom-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
              <Heart className="h-3 w-3 mr-1 fill-current" />
              Favorite
            </Badge>

            {/* Cooking History Badge */}
            {recipe.cookingHistory && recipe.cookingHistory.length > 0 && (
              <Badge className="absolute bottom-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                <ChefHat className="h-3 w-3 mr-1" />
                Cooked {recipe.cookingHistory.length}x
              </Badge>
            )}
          </div>

          {/* Recipe Content */}
          <CardContent className="p-5 space-y-4">
            {/* Title */}
            <div>
              <h3
                className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors cursor-pointer"
                onClick={() => onRecipeClick(recipe)}
              >
                {recipe.title}
              </h3>

              {/* Personal Rating */}
              {recipe.personalRating && (
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs text-gray-500">Your rating:</span>
                  {renderStars(recipe.personalRating)}
                </div>
              )}
            </div>

            {/* Recipe Stats */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-orange-500" />
                  <span className="font-medium">{recipe.readyInMinutes} min</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-blue-500" />
                  <span className="font-medium">{recipe.servings}</span>
                </div>
              </div>

              {recipe.averageRating && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{recipe.averageRating}</span>
                  <span className="text-xs text-gray-400">({recipe.totalReviews})</span>
                </div>
              )}
            </div>

            {/* Personal Notes Preview */}
            {recipe.personalNotes && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg border-l-4 border-orange-400">
                <p className="text-xs text-gray-500 mb-1">Your notes:</p>
                <p className="text-sm text-gray-700 line-clamp-2">{recipe.personalNotes}</p>
              </div>
            )}

            {/* Saved Date */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                Saved {formatDate(recipe.savedAt)}
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowEditDialog(true)}
                  className="h-8 px-3 text-xs hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600"
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRemoveFavorite(recipe.id)}
                  className="h-8 px-3 text-xs hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit3 className="h-5 w-5 text-orange-600" />
              <span>Edit Recipe Details</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Recipe Preview */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <img
                src={recipe.image || "/placeholder.svg?height=80&width=80"}
                alt={recipe.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h4 className="font-semibold text-gray-900">{recipe.title}</h4>
                <p className="text-sm text-gray-600">
                  {recipe.readyInMinutes} min • {recipe.servings} servings
                </p>
              </div>
            </div>

            {/* Personal Rating */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Your Personal Rating</label>
              <div className="flex items-center space-x-2">
                {renderStars(editedRecipe.personalRating || 0, true, "w-6 h-6")}
                <span className="text-sm text-gray-500 ml-2">
                  {editedRecipe.personalRating ? `${editedRecipe.personalRating}/5 stars` : "No rating yet"}
                </span>
              </div>
            </div>

            {/* Personal Notes */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Personal Notes</label>
              <Textarea
                value={editedRecipe.personalNotes || ""}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, personalNotes: e.target.value })}
                placeholder="Add your personal notes about this recipe... (cooking tips, modifications, family feedback, etc.)"
                className="min-h-[100px] border-2 focus:border-orange-500"
              />
            </div>

            {/* Cooking History */}
            {recipe.cookingHistory && recipe.cookingHistory.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Cooking History</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {recipe.cookingHistory.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <ChefHat className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">Cooked on {formatDate(entry.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t">
              <Button
                onClick={handleSaveEdit}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowEditDialog(false)} className="px-6">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
