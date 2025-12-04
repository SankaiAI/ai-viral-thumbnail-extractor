import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log('API Handler started');
    console.log('Request Method:', req.method);
    console.log('API Key present:', !!API_KEY);

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!API_KEY) {
        console.error('Missing API Key');
        return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    try {
        const { prompt, referenceImages, aspectRatio, resolution, chatHistory } = req.body;

        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const modelName = 'gemini-2.5-flash-image'; // Nano Banana Pro model (Imagen 3)

        const parts: any[] = [];

        // Add reference images
        if (referenceImages && Array.isArray(referenceImages)) {
            referenceImages.forEach((img: any) => {
                parts.push({
                    inlineData: {
                        data: img.data,
                        mimeType: img.mimeType,
                    },
                });
            });
        }

        // Build conversation context
        let conversationContext = '';
        if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
            conversationContext = '\n\nPrevious conversation:\n';
            chatHistory.forEach((msg: any) => {
                if (msg.role === 'user') {
                    conversationContext += `User: ${msg.text}\n`;
                } else if (msg.role === 'model' && !msg.isError) {
                    conversationContext += `Assistant: ${msg.text}\n`;
                }
            });
            conversationContext += '\n';
        }

        // Construct prompt
        const finalPrompt = `
      Create a highly engaging, 'viral' style YouTube thumbnail image.
      
      ${referenceImages?.length > 0 ? 'Use the attached images as references.' : ''}
      ${referenceImages?.length === 2 ? `IMPORTANT: You have TWO reference images:
      1. FIRST IMAGE = STYLE REFERENCE (use its composition, layout, text style, colors, background, and overall design)
      2. SECOND IMAGE = SUBJECT REFERENCE (the main subject/element to feature in the thumbnail)
      
      YOUR TASK: Create a new thumbnail that combines these intelligently:
      - Take the COMPOSITION, LAYOUT, TEXT PLACEMENT, COLORS, and BACKGROUND from the first image
      - If the second image contains a PERSON/FACE: Replace any person/face in the first image with the person from the second image
      - If the second image contains an OBJECT/PRODUCT: Incorporate that object/product into the scene from the first image
      - If the second image is a LOGO/BRAND: Add that branding element to the first image's design
      - Keep the same pose, expression intensity, and energy as the first image (if applicable)
      - Maintain the same text style and placement (if text exists)
      - The result should seamlessly blend the subject from the second image into the scene/style from the first image` : ''}
      ${referenceImages?.length === 1 ? 'Use the attached image as the main subject or style reference.' : ''}
      
      Requirements:
      - High contrast, vibrant colors.
      - Expressive facial expressions (if people are present).
      - Clear, bold text overlays if applicable (do not produce gibberish text).
      - Dynamic lighting.
      ${conversationContext}
      Current User Request: ${prompt}
    `;

        parts.push({ text: finalPrompt });

        // Generate content
        const response = await ai.models.generateContent({
            model: modelName,
            contents: {
                parts: parts,
            },
            config: {
                // @ts-ignore - types might mismatch slightly between versions
                imageConfig: {
                    aspectRatio: aspectRatio, // Should be "16:9", "9:16", or "1:1"
                }
            },
        });

        // Extract image
        let base64Image = '';
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

        return res.status(200).json({ image: base64Image });

    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return res.status(500).json({ error: error.message || "Failed to generate image" });
    }
}
