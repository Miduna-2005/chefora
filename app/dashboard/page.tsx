"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChefHat,
  Search,
  Heart,
  LogOut,
  Clock,
  Users,
  Star,
  Filter,
  Loader2,
  X,
  Plus,
  Grid3X3,
  List,
  SortAsc,
  ShoppingCart,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { FloatingChat } from "@/components/floating-chat"
import { RecipeReviews } from "@/components/recipe-reviews"
import { FavoriteRecipeCard } from "@/components/favorite-recipe-card"
import { GroceryListGenerator } from "@/components/grocery-list-generator"
import { RecipeSelectionModal } from "@/components/recipe-selection-modal"

interface Recipe {
  id: number
  title: string
  image: string
  readyInMinutes: number
  servings: number
  summary: string
  instructions?: string
  ingredients?: string[]
  nutrition?: any
  diets?: string[]
  cuisines?: string[]
  dishTypes?: string[]
  spoonacularScore?: number
  averageRating?: number
  totalReviews?: number
  savedAt?: string
  personalNotes?: string
  personalRating?: number
  cookingHistory?: Array<{ date: string; notes?: string }>
}

interface User {
  name: string
  email: string
}

const categories = [
  { id: "all", name: "All Recipes", color: "bg-gradient-to-r from-orange-500 to-red-500" },
  { id: "breakfast", name: "Breakfast", color: "bg-gradient-to-r from-yellow-400 to-orange-500" },
  { id: "lunch", name: "Lunch", color: "bg-gradient-to-r from-green-400 to-blue-500" },
  { id: "dinner", name: "Dinner", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
  { id: "dessert", name: "Dessert", color: "bg-gradient-to-r from-pink-400 to-red-500" },
  { id: "vegetarian", name: "Vegetarian", color: "bg-gradient-to-r from-green-400 to-teal-500" },
  { id: "healthy", name: "Healthy", color: "bg-gradient-to-r from-blue-400 to-green-500" },
]

const sortOptions = [
  { id: "recent", name: "Recently Added", icon: Clock },
  { id: "rating", name: "Your Rating", icon: Star },
  { id: "name", name: "Recipe Name", icon: SortAsc },
  { id: "cookTime", name: "Cook Time", icon: Clock },
]

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [favorites, setFavorites] = useState<Recipe[]>([])
  const [filteredFavorites, setFilteredFavorites] = useState<Recipe[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)
  const [activeTab, setActiveTab] = useState("search")
  const [favoritesView, setFavoritesView] = useState<"grid" | "list">("grid")
  const [favoritesSort, setFavoritesSort] = useState("recent")
  const [favoritesFilter, setFavoritesFilter] = useState("")

  // Grocery List States
  const [showRecipeSelection, setShowRecipeSelection] = useState(false)
  const [showGroceryGenerator, setShowGroceryGenerator] = useState(false)
  const [selectedRecipesForGrocery, setSelectedRecipesForGrocery] = useState<Recipe[]>([])

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      setUser({ name: payload.name, email: payload.email })
      loadFavorites()
    } catch (error) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    filterAndSortFavorites()
  }, [favorites, favoritesFilter, favoritesSort])

  const filterAndSortFavorites = () => {
    let filtered = [...favorites]

    // Filter by search query
    if (favoritesFilter) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(favoritesFilter.toLowerCase()) ||
          recipe.personalNotes?.toLowerCase().includes(favoritesFilter.toLowerCase()),
      )
    }

    // Sort favorites
    filtered.sort((a, b) => {
      switch (favoritesSort) {
        case "recent":
          return new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime()
        case "rating":
          return (b.personalRating || 0) - (a.personalRating || 0)
        case "name":
          return a.title.localeCompare(b.title)
        case "cookTime":
          return a.readyInMinutes - b.readyInMinutes
        default:
          return 0
      }
    })

    setFilteredFavorites(filtered)
  }

  const loadFavorites = async () => {
    setIsLoadingFavorites(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/recipes/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites)
      }
    } catch (error) {
      console.error("Error loading favorites:", error)
    } finally {
      setIsLoadingFavorites(false)
    }
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim() && selectedCategory === "all") return

    setIsSearching(true)
    try {
      let query = searchQuery
      if (selectedCategory !== "all") {
        query = selectedCategory === "healthy" ? "healthy" : selectedCategory
      }

      const response = await fetch(`/api/recipes/search?query=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setRecipes(data.results || [])
      } else {
        toast({
          title: "Search Failed",
          description: "Unable to search recipes. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to recipe service.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleRecipeClick = async (recipe: Recipe) => {
    try {
      const response = await fetch(`/api/recipes/${recipe.id}`)
      if (response.ok) {
        const detailedRecipe = await response.json()
        setSelectedRecipe(detailedRecipe)
      } else {
        setSelectedRecipe(recipe)
      }
    } catch (error) {
      setSelectedRecipe(recipe)
    }
  }

  const handleSaveRecipe = async (recipe: Recipe) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/recipes/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recipe),
      })

      if (response.ok) {
        toast({
          title: "Recipe Saved! ❤️",
          description: "Added to your favorites collection.",
        })
        loadFavorites()
      } else {
        toast({
          title: "Save Failed",
          description: "Unable to save recipe. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while saving.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveFavorite = async (recipeId: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/recipes/favorites", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipeId }),
      })

      if (response.ok) {
        toast({
          title: "Recipe Removed",
          description: "Removed from your favorites.",
        })
        loadFavorites()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to remove recipe.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateFavorite = async (updatedRecipe: Recipe) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/recipes/favorites", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedRecipe),
      })

      if (response.ok) {
        loadFavorites()
      } else {
        throw new Error("Failed to update")
      }
    } catch (error) {
      throw error
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/")
  }

  const isFavorite = (recipeId: number) => {
    return favorites.some((fav) => fav.id === recipeId)
  }

  // Grocery List Functions
  const handleCreateGroceryList = () => {
    if (favorites.length === 0) {
      toast({
        title: "No Recipes Available",
        description: "Save some recipes to your favorites first!",
        variant: "destructive",
      })
      return
    }
    setShowRecipeSelection(true)
  }

  const handleGenerateGroceryList = (selectedRecipes: Recipe[]) => {
    setSelectedRecipesForGrocery(selectedRecipes)
    setShowRecipeSelection(false)
    setShowGroceryGenerator(true)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your kitchen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-orange-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="relative">
                <ChefHat className="h-10 w-10 text-orange-600" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Chefora
                </h1>
                <p className="text-xs text-gray-500">Smart Recipe Assistant</p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <p className="text-sm text-gray-600">
                  Welcome back, <span className="font-semibold text-orange-600">{user.name}</span>!
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-1 shadow-lg border border-orange-100">
            <div className="flex space-x-1">
              <Button
                variant={activeTab === "search" ? "default" : "ghost"}
                onClick={() => setActiveTab("search")}
                className={`rounded-full px-6 py-2 transition-all duration-300 ${
                  activeTab === "search"
                    ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                    : "hover:bg-orange-50"
                }`}
              >
                <Search className="h-4 w-4 mr-2" />
                Discover
              </Button>
              <Button
                variant={activeTab === "favorites" ? "default" : "ghost"}
                onClick={() => setActiveTab("favorites")}
                className={`rounded-full px-6 py-2 transition-all duration-300 ${
                  activeTab === "favorites"
                    ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                    : "hover:bg-orange-50"
                }`}
              >
                <Heart className="h-4 w-4 mr-2" />
                Favorites ({favorites.length})
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "search" && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Search Section */}
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Discover Amazing Recipes
                  </CardTitle>
                  <CardDescription className="text-center text-gray-600">
                    Search by ingredients, cuisine, or dish name
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search for recipes... (e.g., 'chicken pasta', 'vegetarian')"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-12 text-lg border-2 focus:border-orange-500 transition-colors"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-40 h-12 border-2">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="submit"
                        disabled={isSearching}
                        className="h-12 px-8 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {isSearching ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-4 w-4" />
                            Search
                          </>
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {categories.slice(1).map((category) => (
                      <Button
                        key={category.id}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(category.id)
                          setSearchQuery("")
                          handleSearch()
                        }}
                        className="rounded-full hover:scale-105 transition-transform"
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recipe Results */}
              {isSearching ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Card key={i} className="overflow-hidden animate-pulse">
                      <div className="aspect-video bg-gray-200"></div>
                      <CardContent className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {recipes.map((recipe, index) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] cursor-pointer border-0 bg-white/90 backdrop-blur-sm">
                        <div
                          className="aspect-video relative overflow-hidden"
                          onClick={() => handleRecipeClick(recipe)}
                        >
                          <img
                            src={recipe.image || "/placeholder.svg?height=200&width=300"}
                            alt={recipe.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute top-2 right-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="rounded-full bg-white/90 hover:bg-white shadow-lg"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSaveRecipe(recipe)
                              }}
                            >
                              <Heart
                                className={`h-4 w-4 ${isFavorite(recipe.id) ? "fill-red-500 text-red-500" : ""}`}
                              />
                            </Button>
                          </div>
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
                            {recipe.spoonacularScore && (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 mr-1 text-yellow-500" />
                                {Math.round(recipe.spoonacularScore)}
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSaveRecipe(recipe)
                            }}
                            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            disabled={isFavorite(recipe.id)}
                          >
                            {isFavorite(recipe.id) ? (
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
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {recipes.length === 0 && !isSearching && (
                <Card className="text-center py-16 bg-white/80 backdrop-blur-sm">
                  <CardContent>
                    <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Ready to discover?</h3>
                    <p className="text-gray-500">Search for recipes or browse by category to get started!</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {activeTab === "favorites" && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Favorites Header */}
              <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="text-center md:text-left">
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        Your Recipe Collection
                      </CardTitle>
                      <CardDescription>
                        {filteredFavorites.length} of {favorites.length} recipes
                        {favoritesFilter && ` matching "${favoritesFilter}"`}
                      </CardDescription>
                    </div>

                    {/* Favorites Controls */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input
                        placeholder="Search your favorites..."
                        value={favoritesFilter}
                        onChange={(e) => setFavoritesFilter(e.target.value)}
                        className="w-full sm:w-64 h-10 border-2 focus:border-orange-500"
                      />

                      <div className="flex gap-2">
                        <Select value={favoritesSort} onValueChange={setFavoritesSort}>
                          <SelectTrigger className="w-40 h-10 border-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {sortOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                <div className="flex items-center">
                                  <option.icon className="h-4 w-4 mr-2" />
                                  {option.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden">
                          <Button
                            variant={favoritesView === "grid" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setFavoritesView("grid")}
                            className={`rounded-none h-10 ${
                              favoritesView === "grid" ? "bg-orange-600 text-white" : "hover:bg-orange-50"
                            }`}
                          >
                            <Grid3X3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={favoritesView === "list" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setFavoritesView("list")}
                            className={`rounded-none h-10 ${
                              favoritesView === "list" ? "bg-orange-600 text-white" : "hover:bg-orange-50"
                            }`}
                          >
                            <List className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Grocery List Button */}
              {favorites.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <ShoppingCart className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Create Grocery List</h3>
                            <p className="text-sm text-gray-600">Generate a shopping list from your favorite recipes</p>
                          </div>
                        </div>
                        <Button
                          onClick={handleCreateGroceryList}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Create List
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Favorites Content */}
              {isLoadingFavorites ? (
                <div
                  className={`grid ${favoritesView === "grid" ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-6`}
                >
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="overflow-hidden animate-pulse">
                      <div className="aspect-video bg-gray-200"></div>
                      <CardContent className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredFavorites.length === 0 ? (
                <Card className="text-center py-16 bg-white/80 backdrop-blur-sm">
                  <CardContent>
                    <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      {favorites.length === 0 ? "No favorites yet" : "No recipes found"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {favorites.length === 0
                        ? "Start exploring recipes and save your favorites here!"
                        : "Try adjusting your search or filter criteria."}
                    </p>
                    {favorites.length === 0 && (
                      <Button
                        onClick={() => setActiveTab("search")}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                      >
                        Discover Recipes
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div
                  className={`grid ${
                    favoritesView === "grid"
                      ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1 max-w-4xl mx-auto"
                  } gap-6`}
                >
                  {filteredFavorites.map((recipe, index) => (
                    <FavoriteRecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onRecipeClick={handleRecipeClick}
                      onRemoveFavorite={handleRemoveFavorite}
                      onUpdateFavorite={handleUpdateFavorite}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recipe Detail Modal */}
      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl font-bold mb-2 pr-8">{selectedRecipe.title}</DialogTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {selectedRecipe.readyInMinutes} minutes
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {selectedRecipe.servings} servings
                      </div>
                      {selectedRecipe.spoonacularScore && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          {Math.round(selectedRecipe.spoonacularScore)}/100
                        </div>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => setSelectedRecipe(null)} variant="ghost" size="sm" className="rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <img
                    src={selectedRecipe.image || "/placeholder.svg?height=400&width=600"}
                    alt={selectedRecipe.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {selectedRecipe.summary && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">About This Recipe</h3>
                    <div
                      className="text-gray-600 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: selectedRecipe.summary }}
                    />
                  </div>
                )}

                {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                    <div className="grid md:grid-cols-2 gap-2">
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-sm">{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRecipe.instructions && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                    <div
                      className="prose prose-sm max-w-none text-gray-600"
                      dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions }}
                    />
                  </div>
                )}

                {selectedRecipe.diets && selectedRecipe.diets.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Dietary Information</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.diets.map((diet, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                          {diet}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews Section */}
                <RecipeReviews recipeId={selectedRecipe.id} recipeName={selectedRecipe.title} />

                <div className="flex space-x-4 pt-4 border-t">
                  <Button
                    onClick={() => handleSaveRecipe(selectedRecipe)}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                    disabled={isFavorite(selectedRecipe.id)}
                  >
                    {isFavorite(selectedRecipe.id) ? (
                      <>
                        <Heart className="h-4 w-4 mr-2 fill-current" />
                        Saved to Favorites
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Save Recipe
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedRecipe(null)} className="px-8">
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Recipe Selection Modal */}
      <RecipeSelectionModal
        recipes={favorites}
        isOpen={showRecipeSelection}
        onClose={() => setShowRecipeSelection(false)}
        onGenerateList={handleGenerateGroceryList}
      />

      {/* Grocery List Generator */}
      <GroceryListGenerator
        selectedRecipes={selectedRecipesForGrocery}
        isOpen={showGroceryGenerator}
        onClose={() => {
          setShowGroceryGenerator(false)
          setSelectedRecipesForGrocery([])
        }}
      />

      {/* Floating Chat Assistant */}
      <FloatingChat />
    </div>
  )
}
