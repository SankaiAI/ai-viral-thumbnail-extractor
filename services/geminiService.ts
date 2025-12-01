
import { GoogleGenAI } from "@google/genai";
import { AspectRatio, SearchedVideo } from "../types";
import { getYoutubeVideoId } from "../utils";

const API_KEY = process.env.API_KEY;

// Initialize Gemini Client
// We re-initialize inside functions to ensure we catch the latest env var if it changes (though usually static)
// and to keep it stateless.

export const generateViralCover = async (
  prompt: string,
  referenceImages: { data: string; mimeType: string }[],
  aspectRatio: AspectRatio,
  resolution: '1K' | '2K' | '4K' = '1K'
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Nano Banana Pro map
  const modelName = 'gemini-3-pro-image-preview';

  const parts: any[] = [];

  // Add reference images to the prompt context
  referenceImages.forEach((img) => {
    parts.push({
      inlineData: {
        data: img.data,
        mimeType: img.mimeType,
      },
    });
  });

  // Construct a strong system-like prompt for the viral cover
  const finalPrompt = `
    Create a highly engaging, 'viral' style YouTube thumbnail image.
    
    ${referenceImages.length > 0 ? 'Use the attached images as style references and content sources.' : ''}
    ${referenceImages.length === 2 ? 'The first image is the STYLE REFERENCE (composition, text style, colors). The second image is the SUBJECT (person) to feature in the thumbnail.' : ''}
    ${referenceImages.length === 1 ? 'Use the attached image as the main subject or style reference.' : ''}
    
    Requirements:
    - High contrast, vibrant colors.
    - Expressive facial expressions.
    - Clear, bold text overlays if applicable (do not produce gibberish text).
    - Dynamic lighting.
    
    User Request: ${prompt}
  `;

  parts.push({ text: finalPrompt });

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: resolution,
        },
      },
    });

    // Extract image
    let base64Image = '';
    
    // Check candidates
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Image) {
      throw new Error("No image generated. The model might have returned only text.");
    }

    return base64Image;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image");
  }
};

export const searchYouTuberVideos = async (youtuberName: string): Promise<SearchedVideo[]> => {
  if (!API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  // Use gemini-3-pro-image-preview as it supports googleSearch and is smart enough for extraction
  const modelName = 'gemini-3-pro-image-preview';

  const prompt = `
    Find 5 recent or popular videos by the YouTuber "${youtuberName}".
    Return a STRICT JSON array (no markdown code blocks, just raw JSON) containing the following fields for each video:
    - title: The video title
    - url: The full YouTube URL
    - views: Approximate view count (e.g. "1.2M", "500K")
    - published: Relative time or date (e.g. "2 days ago", "1 year ago")

    Example format:
    [{"title": "Video 1", "url": "https://www.youtube.com/watch?v=...", "views": "1M", "published": "1 week ago"}]
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseSchema is NOT supported for this model, so we rely on prompt engineering for JSON
      },
    });

    const text = response.text || '';
    
    // Clean up markdown code blocks if present
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let parsedData: any[] = [];
    try {
      parsedData = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse Gemini search results:", text);
      throw new Error("AI could not structure the search results.");
    }

    if (!Array.isArray(parsedData)) {
      return [];
    }

    // Map to our internal type and valid thumbnail URLs
    const videos: SearchedVideo[] = parsedData.map((item: any) => {
      const id = getYoutubeVideoId(item.url);
      if (!id) return null;

      return {
        id,
        title: item.title,
        views: item.views || 'N/A',
        publishedTime: item.published || 'Unknown',
        thumbnailUrl: `https://img.youtube.com/vi/${id}/mqdefault.jpg` // using mqdefault for list view
      };
    }).filter((v): v is SearchedVideo => v !== null);

    return videos;

  } catch (error: any) {
    console.error("Search Error:", error);
    throw new Error("Failed to search videos. Ensure you are using a paid API Key.");
  }
};
