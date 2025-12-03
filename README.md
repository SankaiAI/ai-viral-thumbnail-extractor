# ViralThumb AI

ViralThumb AI is a React-based application designed to generate viral-worthy YouTube thumbnails using Google's Gemini Nano Banana Pro model. It allows users to input a video URL or upload images, configure style settings, and generate high-quality thumbnails.

## 🚀 Features

- **AI-Powered Generation**: Utilizes Google's Gemini model to create engaging thumbnails.
- **Contextual Input**: Supports YouTube video URLs and profile image uploads for personalized results.
- **Customizable Settings**: Adjust aspect ratios (16:9, 9:16, 1:1) and resolution.
- **History Tracking**: Keeps a local history of generated thumbnails and prompts.
- **Direct Download**: Easily save generated images to your device.

## 🛠️ Project Structure

```
ai-viral-thumbnail-extractor/
├── components/          # UI Components
│   ├── InputPanel.tsx   # Left sidebar for user inputs
│   ├── ChatPanel.tsx    # Right sidebar for chat/prompt interface
│   └── LandingPage.tsx  # Initial landing screen
├── services/            # API Services
│   └── geminiService.ts # Google GenAI integration logic
├── App.tsx              # Main application controller and layout
├── utils.ts             # Helper functions
├── types.ts             # TypeScript definitions
├── vite.config.ts       # Vite configuration
└── .env                 # Environment variables
```

## 💻 Setup & Installation

1.  **Prerequisites**
    - Node.js (v18+ recommended)
    - A Google Cloud Project with Gemini API access

2.  **Installation**
    ```bash
    npm install
    ```

3.  **Configuration**
    Create a `.env` file in the root directory (or use the existing one) and add your API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Running Locally**
    Start the development server:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3001` (or the port specified in your terminal).

## 🔑 API Key Note

The application checks for the `GEMINI_API_KEY` in your environment variables. If found, it bypasses the manual connection screen. Ensure your key has the necessary permissions for the Gemini API.

## 📦 Build

To build the project for production:
```bash
npm run build
```
