# Chefora - Smart Recipe Assistant

A full-stack web application that helps users discover recipes, chat with an AI cooking assistant, and save their favorite recipes.

## Features

- 🔐 **User Authentication**: Secure signup/login with JWT tokens
- 🔍 **Recipe Search**: Search thousands of recipes using Spoonacular API
- 🤖 **AI Chat Assistant**: Get personalized cooking advice from OpenAI
- ❤️ **Favorites System**: Save and manage your favorite recipes
- 📱 **Responsive Design**: Works perfectly on desktop and mobile

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Lucide React** icons

### Backend
- **Next.js API Routes**
- **MongoDB Atlas** for database
- **JWT** for authentication
- **bcryptjs** for password hashing

### APIs
- **Spoonacular API** for recipe data
- **OpenAI API** for AI chat assistant

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account
- Spoonacular API key
- OpenAI API key

### Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chefora?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# APIs
SPOONACULAR_API_KEY=your-spoonacular-api-key
OPENAI_API_KEY=your-openai-api-key
\`\`\`

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd chefora
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   - Copy \`.env.example\` to \`.env.local\`
   - Fill in your API keys and database URL

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Authentication
- \`POST /api/auth/register\` - Create new user account
- \`POST /api/auth/login\` - Login user

### Recipes
- \`GET /api/recipes/search?query=...\` - Search recipes
- \`POST /api/recipes/save\` - Save recipe to favorites
- \`GET /api/recipes/favorites\` - Get user's favorite recipes

### Chat
- \`POST /api/chat\` - Send message to AI assistant

## Database Schema

### Users Collection
\`\`\`javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String, // hashed with bcrypt
  favorites: [
    {
      id: Number,
      title: String,
      image: String,
      readyInMinutes: Number,
      servings: Number,
      summary: String,
      savedAt: Date
    }
  ],
  createdAt: Date
}
\`\`\`

## Usage

1. **Sign Up/Login**: Create an account or login with existing credentials
2. **Search Recipes**: Use the search tab to find recipes by keywords
3. **Chat with AI**: Ask the AI assistant for cooking advice and recipe suggestions
4. **Save Favorites**: Click the heart button to save recipes you like
5. **View Favorites**: Access your saved recipes in the favorites tab

## API Keys Setup

### Spoonacular API
1. Go to [Spoonacular API](https://spoonacular.com/food-api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your \`.env.local\` file

### OpenAI API
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create an account and add billing information
3. Generate an API key
4. Add it to your \`.env.local\` file

### MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Add it to your \`.env.local\` file

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Happy Cooking with Chefora! 🧑‍🍳**
