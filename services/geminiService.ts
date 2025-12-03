import { AspectRatio, ChatMessage } from "../types";

// Initialize Gemini Client
// We re-initialize inside functions to ensure we catch the latest env var if it changes (though usually static)
// and to keep it stateless.

export const generateViralCover = async (
  prompt: string,
  referenceImages: { data: string; mimeType: string }[],
  aspectRatio: AspectRatio,
  resolution: '1K' | '2K' | '4K' = '1K',
  chatHistory: ChatMessage[] = []
): Promise<string> => {

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        referenceImages,
        aspectRatio,
        resolution,
        chatHistory
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate image');
    }

    const data = await response.json();
    return data.image;

  } catch (error: any) {
    console.error("Generation Error:", error);
    throw new Error(error.message || "Failed to generate image");
  }
};


