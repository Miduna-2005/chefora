"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Star, User, Edit3, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface Review {
  id: string
  userName: string
  rating: number
  review: string
  createdAt: string
  updatedAt: string
}

interface ReviewsData {
  reviews: Review[]
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

interface UserReview {
  rating: number
  review: string
  createdAt: string
  updatedAt: string
}

interface RecipeReviewsProps {
  recipeId: number
  recipeName: string
}

export function RecipeReviews({ recipeId, recipeName }: RecipeReviewsProps) {
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null)
  const [userReview, setUserReview] = useState<UserReview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadReviews()
    loadUserReview()
  }, [recipeId])

  const loadReviews = async () => {
    try {
      const response = await fetch(`/api/recipes/reviews?recipeId=${recipeId}`)
      if (response.ok) {
        const data = await response.json()
        setReviewsData(data)
      }
    } catch (error) {
      console.error("Error loading reviews:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserReview = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`/api/recipes/user-review?recipeId=${recipeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.userReview) {
          setUserReview(data.userReview)
          setRating(data.userReview.rating)
          setReviewText(data.userReview.review)
        }
      }
    } catch (error) {
      console.error("Error loading user review:", error)
    }
  }

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/recipes/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipeId,
          recipeName,
          rating,
          review: reviewText,
        }),
      })

      if (response.ok) {
        toast({
          title: userReview ? "Review Updated! ⭐" : "Review Submitted! ⭐",
          description: "Thank you for sharing your experience!",
        })
        setShowReviewForm(false)
        loadReviews()
        loadUserReview()
      } else {
        toast({
          title: "Submission Failed",
          description: "Unable to submit review. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating: number, interactive = false, size = "w-5 h-5") => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} cursor-pointer transition-colors duration-200 ${
              star <= (interactive ? hoverRating || rating : rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Reviews Overview */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-orange-600" />
            <span>Reviews & Ratings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviewsData && reviewsData.totalReviews > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Rating Summary */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">{reviewsData.averageRating}</div>
                  <div className="flex justify-center mb-2">{renderStars(reviewsData.averageRating)}</div>
                  <p className="text-gray-600">
                    Based on {reviewsData.totalReviews} review{reviewsData.totalReviews !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 w-12">
                      <span className="text-sm font-medium">{stars}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </div>
                    <Progress
                      value={
                        reviewsData.totalReviews > 0
                          ? (reviewsData.ratingDistribution[stars as keyof typeof reviewsData.ratingDistribution] /
                              reviewsData.totalReviews) *
                            100
                          : 0
                      }
                      className="flex-1 h-2"
                    />
                    <span className="text-sm text-gray-600 w-8">
                      {reviewsData.ratingDistribution[stars as keyof typeof reviewsData.ratingDistribution]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No reviews yet</h3>
              <p className="text-gray-500">Be the first to share your experience with this recipe!</p>
            </div>
          )}

          {/* Add/Edit Review Button */}
          <div className="mt-6 text-center">
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
            >
              {userReview ? (
                <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Your Review
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Write a Review
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
              <CardHeader>
                <CardTitle className="text-lg">{userReview ? "Edit Your Review" : "Write a Review"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                  {renderStars(rating, true, "w-8 h-8")}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review (Optional)</label>
                  <Textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this recipe..."
                    className="min-h-[100px] border-2 focus:border-orange-500"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={isSubmitting || rating === 0}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                  >
                    {isSubmitting ? "Submitting..." : userReview ? "Update Review" : "Submit Review"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {reviewsData && reviewsData.reviews.length > 0 && (
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Reviews</span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {reviewsData.totalReviews} review{reviewsData.totalReviews !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reviewsData.reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                          <div className="flex items-center space-x-2">
                            {renderStars(review.rating, false, "w-4 h-4")}
                            <span className="text-sm text-gray-500">
                              {formatDate(review.createdAt)}
                              {review.updatedAt !== review.createdAt && " (edited)"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.review && <p className="text-gray-700 leading-relaxed mt-2">{review.review}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
