import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

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