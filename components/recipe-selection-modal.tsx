"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Search, Clock, Users, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Recipe {
  id: number
  title: string
  image: string
  readyInMinutes: number
  servings: number
  ingredients?: string[]
}

interface RecipeSelectionModalProps {
  recipes: Recipe[]
  isOpen: boolean
  onClose: () => void
  onGenerateList: (selectedRecipes: Recipe[]) => void
}

export function RecipeSelectionModal({ recipes, isOpen, onClose, onGenerateList }: RecipeSelectionModalProps) {
  const [selectedRecipes, setSelectedRecipes] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")

  const filteredRecipes = recipes.filter((recipe) => recipe.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const toggleRecipeSelection = (recipeId: number) => {
    const newSelection = new Set(selectedRecipes)
    if (newSelection.has(recipeId)) {
      newSelection.delete(recipeId)
    } else {
      newSelection.add(recipeId)
    }
    setSelectedRecipes(newSelection)
  }

  const handleGenerateList = () => {
    const selected = recipes.filter((recipe) => selectedRecipes.has(recipe.id))
    onGenerateList(selected)
    setSelectedRecipes(new Set())
    setSearchQuery("")
  }

  const selectAll = () => {
    setSelectedRecipes(new Set(filteredRecipes.map((recipe) => recipe.id)))
  }

  const clearAll = () => {
    setSelectedRecipes(new Set())
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
              <span>Select Recipes for Grocery List</span>
            </DialogTitle>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {selectedRecipes.size} selected
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Search and Controls */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your recipes..."
                className="pl-10 border-2 focus:border-orange-500"
              />
            </div>

            <div className="flex justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={selectAll} disabled={filteredRecipes.length === 0}>
                  Select All ({filteredRecipes.length})
                </Button>
                <Button variant="outline" size="sm" onClick={clearAll} disabled={selectedRecipes.size === 0}>
                  Clear All
                </Button>
              </div>

              <p className="text-sm text-gray-500 self-center">
                {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? "s" : ""} available
              </p>
            </div>
          </div>

          {/* Recipe Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredRecipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedRecipes.has(recipe.id) ? "ring-2 ring-orange-500 bg-orange-50" : "hover:shadow-md"
                    }`}
                    onClick={() => toggleRecipeSelection(recipe.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selectedRecipes.has(recipe.id)}
                          onCheckedChange={() => toggleRecipeSelection(recipe.id)}
                          className="mt-1 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start space-x-3">
                            <img
                              src={recipe.image || "/placeholder.svg?height=60&width=60"}
                              alt={recipe.title}
                              className="w-15 h-15 object-cover rounded-lg flex-shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm line-clamp-2 mb-2">{recipe.title}</h3>

                              <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {recipe.readyInMinutes} min
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {recipe.servings}
                                </div>
                              </div>

                              {recipe.ingredients && (
                                <p className="text-xs text-gray-500">{recipe.ingredients.length} ingredients</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredRecipes.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No recipes found</h3>
              <p className="text-gray-500">
                {searchQuery ? "Try adjusting your search terms" : "No recipes available"}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t pt-4">
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleGenerateList}
              disabled={selectedRecipes.size === 0}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Generate List ({selectedRecipes.size})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
