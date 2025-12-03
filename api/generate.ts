import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    try {
        const { prompt, referenceImages, aspectRatio, resolution, chatHistory } = req.body;

        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const modelName = 'gemini-1.5-pro-latest'; // Or 'gemini-pro-vision' depending on availability

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
      
      ${referenceImages?.length > 0 ? 'Use the attached images as style references and content sources.' : ''}
      ${referenceImages?.length === 2 ? 'The first image is the STYLE REFERENCE (composition, text style, colors). The second image is the SUBJECT (person) to feature in the thumbnail.' : ''}
      ${referenceImages?.length === 1 ? 'Use the attached image as the main subject or style reference.' : ''}
      
      Requirements:
      - High contrast, vibrant colors.
      - Expressive facial expressions.
      - Clear, bold text overlays if applicable (do not produce gibberish text).
      - Dynamic lighting.
      ${conversationContext}
      Current User Request: ${prompt}
    `;

        parts.push({ text: finalPrompt });

        // Generate content
        // Note: The Node.js SDK for GoogleGenAI might differ slightly in structure from the web SDK.
        // We are using the @google/genai package as per previous context, assuming it supports Node.

        // For the server-side, we might need to use the standard REST API or the specific Node SDK method.
        // Assuming the same SDK works in Node:
        const response = await ai.models.generateContent({
            model: modelName,
            contents: {
                parts: parts,
            },
            config: {
                // @ts-ignore - types might mismatch slightly between versions
                imageConfig: {
                    aspectRatio: aspectRatio,
                    imageSize: resolution,
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
