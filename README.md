# ViralThumb AI

ViralThumb AI is a powerful tool that helps you create viral-worthy YouTube thumbnails in seconds. It extracts style references from existing videos and uses advanced AI to generate stunning new designs.

![ViralThumb AI Demo](public/og-image.png)

## Features

- 🎥 **Style Extraction**: Paste a YouTube URL to extract thumbnail style and vibe.
- 🎨 **AI Generation**: Generate high-quality thumbnails using Google's Gemini 1.5 Pro.
- 👤 **User Accounts**: Sign in with Google to save your creations and manage credits.
- 💳 **Credit System**: Free guest usage (3 limits) and credit-based system for logged-in users.
- 🔗 **Referral System**: Invite friends to earn more credits.
- ☁️ **Cloud Storage**: Automatically save your generated thumbnails to the cloud.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Authentication**: Clerk
- **Database**: Neon (PostgreSQL)
- **AI Model**: Google Gemini 1.5 Pro
- **Deployment**: Vercel

## Local Development Setup

Follow these steps to get the project running on your local machine.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A [Clerk](https://clerk.com/) account
- A [Neon](https://neon.tech/) account
- A [Google AI Studio](https://aistudio.google.com/) API key

### 1. Clone the Repository

```bash
git clone https://github.com/SankaiAI/ai-viral-thumbnail-extractor.git
cd ai-viral-thumbnail-extractor
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory and add the following variables:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Neon Database (PostgreSQL)
POSTGRES_URL="postgres://user:password@endpoint.neon.tech/neondb?sslmode=require"

# Google Gemini API
GEMINI_API_KEY=AIzaSy...
```

### 4. Database Setup

1. Create a new project in Neon.
2. Run the SQL schema to create the necessary tables. You can find the schema in `neon_schema.sql`.
   - Copy the contents of `neon_schema.sql`.
   - Go to the **SQL Editor** in your Neon dashboard.
   - Paste and run the script.

### 5. Run the Development Server

```bash
npm run dev
```

The application should now be running at `http://localhost:5173`.

### 6. API Routes (Vercel Serverless)

This project uses Vercel Serverless Functions for backend logic (user sync, credit consumption). These functions are located in the `/api` directory.

To test API routes locally, you can use `vercel dev`:

```bash
npm i -g vercel
vercel dev
```

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/).

1. Push your code to a GitHub repository.
2. Import the project in Vercel.
3. Add the environment variables from your `.env` file to the Vercel project settings.
4. Deploy!

## License

MIT
