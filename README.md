# ViralThumb AI 🎨

**Create viral-worthy YouTube thumbnails in seconds using AI-powered style extraction and generation.**

ViralThumb AI helps content creators generate stunning thumbnails by extracting style references from existing viral videos and using Google's Gemini AI to create new designs.

## ✨ Features

- 🎥 **Style Extraction** - Paste any YouTube URL to extract thumbnail style and composition
- 🤖 **AI Generation** - Powered by Google's `gemini-2.5-flash-image` (Nano Banana Pro)
- 👥 **Guest Mode** - Try it free with 3 generations (no sign-up required)
- 🔐 **User Accounts** - Sign in with Google via Clerk for 20 free credits
- 💳 **Credit System** - Earn more credits through referrals
- 📐 **Multiple Aspect Ratios** - Generate for YouTube (16:9), Stories (9:16), or Square (1:1)
- 💬 **Iterative Design** - Chat with AI to refine your thumbnails
- 📜 **History** - Access all your previous generations

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Vanilla CSS with modern design patterns
- **Authentication**: Clerk (Google OAuth)
- **Database**: Neon (Serverless PostgreSQL)
- **AI Model**: Google Gemini 2.5 Flash Image
- **Deployment**: Vercel (Serverless Functions)
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- [Clerk](https://clerk.com/) account (for authentication)
- [Neon](https://neon.tech/) account (for database)
- [Google AI Studio](https://aistudio.google.com/) API key

### 1. Clone & Install

```bash
git clone https://github.com/SankaiAI/ai-viral-thumbnail-extractor.git
cd ai-viral-thumbnail-extractor
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Neon Database
POSTGRES_URL="postgres://user:password@endpoint.neon.tech/neondb?sslmode=require"

# Google Gemini API
GEMINI_API_KEY=AIzaSy...
```

### 3. Database Setup

1. Create a new project in [Neon](https://neon.tech/)
2. Copy your connection string to `.env`
3. Run the schema in Neon's SQL Editor:

```bash
# Copy contents of neon_schema.sql and run in Neon SQL Editor
```

### 4. Run Development Server

For full-stack development with API routes:

```bash
vercel dev
```

Or for frontend-only development:

```bash
npm run dev
```

The app will be available at `http://localhost:3001` (vercel dev) or `http://localhost:3000` (vite).

## 📁 Project Structure

```
ai-viral-thumbnail-extractor/
├── api/                    # Vercel Serverless Functions
│   ├── generate.ts        # Image generation endpoint
│   ├── credits/           # Credit management
│   └── user/              # User sync with database
├── components/            # React components
│   ├── LandingPage.tsx   # Initial URL input
│   ├── InputPanel.tsx    # Image upload & settings
│   ├── ChatPanel.tsx     # AI chat interface
│   ├── AuthModal.tsx     # Sign-in modal
│   ├── ReferralModal.tsx # Referral system
│   └── GuestLimitModal.tsx
├── contexts/
│   └── AuthContext.tsx   # Clerk auth wrapper
├── services/
│   └── geminiService.ts  # AI API client
├── App.tsx               # Main application
├── types.ts              # TypeScript definitions
└── utils.ts              # Helper functions
```

## 🔑 Key Implementation Details

### Guest Mode
- Guests can generate 3 free images without signing in
- Usage tracked in `localStorage`
- After 3 generations, prompted to sign in

### Credit System
- New users receive 20 free credits
- Each generation consumes 1 credit
- Referral system: Invite friends to earn 5 credits per signup

### Image Generation
- Model: `gemini-2.5-flash-image`
- Supports aspect ratios: `16:9`, `9:16`, `1:1`
- Reference images: YouTube thumbnail + optional profile image
- Iterative refinement through chat interface

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com/)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Ensure all `.env` variables are added to Vercel:
- `VITE_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `POSTGRES_URL`
- `GEMINI_API_KEY`

## 🐛 Troubleshooting

### API 400 Error
- Ensure `GEMINI_API_KEY` is valid
- Check that `aspectRatio` is one of: `"16:9"`, `"9:16"`, `"1:1"`

### Database Connection Issues
- Verify `POSTGRES_URL` format includes `?sslmode=require`
- Check Neon project is active

### Guest Limit Not Working
- Clear `localStorage` to reset: `localStorage.removeItem('guestUsageCount')`

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 🔗 Links

- **Live Demo**: [viralthumb.studio](https://www.viralthumb.studio/)
- **GitHub**: [SankaiAI/ai-viral-thumbnail-extractor](https://github.com/SankaiAI/ai-viral-thumbnail-extractor)

---

Built with ❤️ by [ShawnAI](https://github.com/SankaiAI)
