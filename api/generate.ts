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
        const modelName = 'gemini-3-pro-image-preview'; // Nano Banana Pro model (Imagen 3)

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

        // Construct prompt - Use proper image editing format from docs
        let finalPrompt = '';

        if (referenceImages?.length === 2) {
            // Image editing mode: style reference + subject reference
            finalPrompt = `Using the first provided image as a style reference, create a new viral YouTube thumbnail with the following changes:

REPLACE the person/face in the first image with the person/face from the second provided image.

Keep everything else from the first image:
- The exact same composition and layout
- The same background, lighting, and colors
- The same text placement and style (if any text exists)
- The same pose, expression intensity, and dramatic energy

The person from the second image should look like they are naturally part of the scene from the first image, with the same lighting and perspective.

${conversationContext}
Additional instructions: ${prompt}`;
        } else if (referenceImages?.length === 1) {
            // Single image editing
            finalPrompt = `Using the provided image, ${prompt}
            
Maintain the original style, lighting, and composition while making the requested changes.
${conversationContext}`;
        } else {
            // Text-to-image generation (no reference images)
            finalPrompt = `Create a highly engaging, viral-style YouTube thumbnail image.

${prompt}

Requirements:
- High contrast, vibrant colors
- Expressive facial expressions (if people are present)
- Clear, bold text overlays if applicable (no gibberish text)
- Dynamic lighting
${conversationContext}`;
        }

        finalPrompt += '\n\nOUTPUT: Generate and return the thumbnail image file (PNG format).';

        parts.push({ text: finalPrompt });

        // Generate content
        const response = await ai.models.generateContent({
            model: modelName,
            contents: {
                parts: parts,
            },
            config: {
                responseModalities: ['TEXT', 'IMAGE'], // CRITICAL: Tell model to return an image
                // @ts-ignore - types might mismatch slightly between versions
                imageConfig: {
                    aspectRatio: aspectRatio, // Should be "16:9", "9:16", or "1:1"
                }
            },
        });

        // Extract image
        let base64Image = '';

        // Debug logging
        console.log('Response structure:', JSON.stringify(response, null, 2));

        if (response.candidates && response.candidates.length > 0) {
            console.log('Candidates found:', response.candidates.length);
            const parts = response.candidates[0].content.parts;
            console.log('Parts in first candidate:', parts.length);

            for (const part of parts) {
                console.log('Part type:', Object.keys(part));
                if (part.inlineData && part.inlineData.data) {
                    base64Image = part.inlineData.data;
                    console.log('Found image data, length:', base64Image.length);
                    break;
                }
                if (part.text) {
                    console.log('Found text instead of image:', part.text.substring(0, 200));
                }
            }
        } else {
            console.log('No candidates in response');
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
