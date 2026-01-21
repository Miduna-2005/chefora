"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Download,
  Share2,
  Trash2,
  Users,
  ChefHat,
  Apple,
  Beef,
  Milk,
  Wheat,
  Fish,
  Carrot,
  Cookie,
  Loader2,
} from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface Recipe {
  id: number
  title: string
  image: string
  servings: number
  ingredients?: string[]
}

interface GroceryItem {
  id: string
  name: string
  quantity: string
  unit: string
  category: string
  recipeIds: number[]
  recipeNames: string[]
  checked: boolean
  notes?: string
}

interface GroceryListGeneratorProps {
  selectedRecipes: Recipe[]
  onClose: () => void
  isOpen: boolean
}

const ingredientCategories = {
  produce: { name: "Produce", icon: Apple, color: "bg-green-100 text-green-800" },
  meat: { name: "Meat & Seafood", icon: Beef, color: "bg-red-100 text-red-800" },
  dairy: { name: "Dairy & Eggs", icon: Milk, color: "bg-blue-100 text-blue-800" },
  grains: { name: "Grains & Bread", icon: Wheat, color: "bg-yellow-100 text-yellow-800" },
  seafood: { name: "Seafood", icon: Fish, color: "bg-cyan-100 text-cyan-800" },
  pantry: { name: "Pantry & Spices", icon: Cookie, color: "bg-purple-100 text-purple-800" },
  frozen: { name: "Frozen", icon: Carrot, color: "bg-indigo-100 text-indigo-800" },
  other: { name: "Other", icon: ShoppingCart, color: "bg-gray-100 text-gray-800" },
}

export function GroceryListGenerator({ selectedRecipes, onClose, isOpen }: GroceryListGeneratorProps) {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [servingAdjustments, setServingAdjustments] = useState<Record<number, number>>({})
  const [customItems, setCustomItems] = useState<string>("")
  const [listName, setListName] = useState("")
  const [showCustomItems, setShowCustomItems] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && selectedRecipes.length > 0) {
      generateGroceryList()
      setListName(`Shopping List - ${new Date().toLocaleDateString()}`)
    }
  }, [isOpen, selectedRecipes])

  const categorizeIngredient = (ingredient: string): string => {
    const lower = ingredient.toLowerCase()

    // Produce
    if (
      lower.match(
        /(tomato|onion|garlic|pepper|lettuce|spinach|carrot|celery|potato|mushroom|herb|parsley|cilantro|basil|lemon|lime|apple|banana|avocado|cucumber|zucchini|broccoli|cauliflower)/,
      )
    ) {
      return "produce"
    }

    // Meat & Poultry
    if (lower.match(/(chicken|beef|pork|turkey|lamb|bacon|sausage|ham|ground)/)) {
      return "meat"
    }

    // Seafood
    if (lower.match(/(fish|salmon|tuna|shrimp|crab|lobster|cod|tilapia|mussels|clams)/)) {
      return "seafood"
    }

    // Dairy
    if (lower.match(/(milk|cheese|butter|cream|yogurt|egg|sour cream|cottage cheese|mozzarella|cheddar|parmesan)/)) {
      return "dairy"
    }

    // Grains & Bread
    if (lower.match(/(bread|pasta|rice|flour|oats|quinoa|barley|cereal|crackers|tortilla|bagel|roll)/)) {
      return "grains"
    }

    // Frozen
    if (lower.match(/(frozen|ice cream|popsicle)/)) {
      return "frozen"
    }

    // Pantry & Spices
    if (lower.match(/(oil|vinegar|salt|pepper|spice|sauce|stock|broth|can|jar|bottle|sugar|honey|vanilla|baking)/)) {
      return "pantry"
    }

    return "other"
  }

  const parseIngredient = (ingredient: string) => {
    // Simple parsing to extract quantity, unit, and name
    const match = ingredient.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)\s*(\w+)?\s+(.+)/)
    if (match) {
      return {
        quantity: match[1],
        unit: match[2] || "",
        name: match[3].trim(),
      }
    }

    // Fallback for ingredients without clear quantity
    return {
      quantity: "1",
      unit: "",
      name: ingredient.trim(),
    }
  }

  const generateGroceryList = async () => {
    setIsGenerating(true)

    try {
      const itemsMap = new Map<string, GroceryItem>()

      selectedRecipes.forEach((recipe) => {
        const servingMultiplier = (servingAdjustments[recipe.id] || recipe.servings) / recipe.servings

        recipe.ingredients?.forEach((ingredient) => {
          const parsed = parseIngredient(ingredient)
          const category = categorizeIngredient(parsed.name)
          const itemKey = parsed.name.toLowerCase()

          if (itemsMap.has(itemKey)) {
            const existingItem = itemsMap.get(itemKey)!
            existingItem.recipeIds.push(recipe.id)
            existingItem.recipeNames.push(recipe.title)

            // Try to combine quantities if units match
            if (existingItem.unit === parsed.unit) {
              const existingQty = Number.parseFloat(existingItem.quantity) || 1
              const newQty = (Number.parseFloat(parsed.quantity) || 1) * servingMultiplier
              existingItem.quantity = (existingQty + newQty).toString()
            } else {
              existingItem.quantity += ` + ${(Number.parseFloat(parsed.quantity) * servingMultiplier).toString()} ${parsed.unit}`
            }
          } else {
            itemsMap.set(itemKey, {
              id: Math.random().toString(36).substr(2, 9),
              name: parsed.name,
              quantity: ((Number.parseFloat(parsed.quantity) || 1) * servingMultiplier).toString(),
              unit: parsed.unit,
              category,
              recipeIds: [recipe.id],
              recipeNames: [recipe.title],
              checked: false,
            })
          }
        })
      })

      setGroceryItems(Array.from(itemsMap.values()))
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate grocery list. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const adjustServings = (recipeId: number, newServings: number) => {
    setServingAdjustments((prev) => ({
      ...prev,
      [recipeId]: Math.max(1, newServings),
    }))
  }

  const toggleItemCheck = (itemId: string) => {
    setGroceryItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item)))
  }

  const removeItem = (itemId: string) => {
    setGroceryItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const addCustomItems = () => {
    if (!customItems.trim()) return

    const newItems = customItems
      .split("\n")
      .filter((item) => item.trim())
      .map((item) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: item.trim(),
        quantity: "1",
        unit: "",
        category: "other",
        recipeIds: [],
        recipeNames: [],
        checked: false,
      }))

    setGroceryItems((prev) => [...prev, ...newItems])
    setCustomItems("")
    setShowCustomItems(false)

    toast({
      title: "Items Added! ✅",
      description: `Added ${newItems.length} custom items to your list.`,
    })
  }

  const exportList = () => {
    const listContent = generateListText()
    const blob = new Blob([listContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${listName.replace(/[^a-z0-9]/gi, "_")}.txt`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "List Exported! 📄",
      description: "Your grocery list has been downloaded.",
    })
  }

  const shareList = async () => {
    const listContent = generateListText()

    if (navigator.share) {
      try {
        await navigator.share({
          title: listName,
          text: listContent,
        })
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard(listContent)
      }
    } else {
      copyToClipboard(listContent)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to Clipboard! 📋",
        description: "Your grocery list is ready to share.",
      })
    })
  }

  const generateListText = () => {
    let content = `${listName}\n${"=".repeat(listName.length)}\n\n`

    // Add recipes info
    content += "Recipes:\n"
    selectedRecipes.forEach((recipe) => {
      const servings = servingAdjustments[recipe.id] || recipe.servings
      content += `• ${recipe.title} (${servings} servings)\n`
    })
    content += "\n"

    // Group items by category
    Object.entries(ingredientCategories).forEach(([categoryKey, categoryInfo]) => {
      const categoryItems = groceryItems.filter((item) => item.category === categoryKey)
      if (categoryItems.length > 0) {
        content += `${categoryInfo.name}:\n`
        categoryItems.forEach((item) => {
          const checkmark = item.checked ? "✓" : "☐"
          content += `${checkmark} ${item.quantity} ${item.unit} ${item.name}\n`
        })
        content += "\n"
      }
    })

    content += `Generated on ${new Date().toLocaleDateString()}`
    return content
  }

  const groupedItems = Object.entries(ingredientCategories)
    .map(([categoryKey, categoryInfo]) => ({
      ...categoryInfo,
      key: categoryKey,
      items: groceryItems.filter((item) => item.category === categoryKey),
    }))
    .filter((category) => category.items.length > 0)

  const totalItems = groceryItems.length
  const checkedItems = groceryItems.filter((item) => item.checked).length
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
              <span>Grocery List Generator</span>
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {totalItems} items
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {Math.round(progress)}% complete
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* List Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">List Name</label>
            <Input
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Enter list name..."
              className="border-2 focus:border-orange-500"
            />
          </div>

          {/* Recipe Servings Adjustment */}
          <Card className="bg-gradient-to-r from-orange-50 to-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <ChefHat className="h-5 w-5 text-orange-600" />
                <span>Recipe Servings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedRecipes.map((recipe) => (
                <div key={recipe.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center space-x-3">
                    <img
                      src={recipe.image || "/placeholder.svg?height=40&width=40"}
                      alt={recipe.title}
                      className="w-10 h-10 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{recipe.title}</h4>
                      <p className="text-sm text-gray-500">Original: {recipe.servings} servings</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustServings(recipe.id, (servingAdjustments[recipe.id] || recipe.servings) - 1)}
                      disabled={isGenerating}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center space-x-1 min-w-[60px] justify-center">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{servingAdjustments[recipe.id] || recipe.servings}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustServings(recipe.id, (servingAdjustments[recipe.id] || recipe.servings) + 1)}
                      disabled={isGenerating}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                onClick={generateGroceryList}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating List...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Regenerate List
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Progress Bar */}
          {totalItems > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shopping Progress</span>
                <span>
                  {checkedItems} of {totalItems} items
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Grocery Items by Category */}
          {isGenerating ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
              <p className="text-gray-600">Generating your grocery list...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedItems.map((category) => (
                <motion.div
                  key={category.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2">
                        <category.icon className="h-5 w-5" />
                        <span>{category.name}</span>
                        <Badge className={category.color}>{category.items.length} items</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {category.items.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                            item.checked ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={item.checked}
                              onCheckedChange={() => toggleItemCheck(item.id)}
                              className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                            />
                            <div className={`${item.checked ? "line-through text-gray-500" : ""}`}>
                              <div className="font-medium">
                                {item.quantity} {item.unit} {item.name}
                              </div>
                              {item.recipeNames.length > 0 && (
                                <div className="text-xs text-gray-500">For: {item.recipeNames.join(", ")}</div>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Custom Items */}
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-4">
              {!showCustomItems ? (
                <Button
                  variant="outline"
                  onClick={() => setShowCustomItems(true)}
                  className="w-full border-dashed border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Custom Items
                </Button>
              ) : (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Add Custom Items (one per line)</label>
                  <Textarea
                    value={customItems}
                    onChange={(e) => setCustomItems(e.target.value)}
                    placeholder="Extra virgin olive oil&#10;Paper towels&#10;Laundry detergent"
                    className="min-h-[100px] border-2 focus:border-orange-500"
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={addCustomItems}
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Items
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCustomItems(false)
                        setCustomItems("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 border-t pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={exportList}
              variant="outline"
              className="flex-1 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
            >
              <Download className="mr-2 h-4 w-4" />
              Export List
            </Button>
            <Button
              onClick={shareList}
              variant="outline"
              className="flex-1 hover:bg-green-50 hover:border-green-200 hover:text-green-600"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share List
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
            >
              <Check className="mr-2 h-4 w-4" />
              Done Shopping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
