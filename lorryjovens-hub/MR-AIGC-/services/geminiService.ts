import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedAsset } from "../types";
import { 
  GEMINI_MODEL_PRO, 
  GEMINI_MODEL_FLASH, 
  GEMINI_MODEL_IMAGE, 
  GEMINI_MODEL_VIDEO 
} from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- UTILS ---
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// --- ASSET FORGE ---

/**
 * Generates asset specs from text or image (Multimodal).
 */
export const generateAssetSpecs = async (prompt: string, imagePart?: any): Promise<GeneratedAsset> => {
  try {
    const contents = [];
    if (imagePart) {
      contents.push(imagePart);
      contents.push({ text: "Analyze this image and generate technical specifications for a 3D game asset that represents it. If the user asks for a script, provide the code logic. " + prompt });
    } else {
      contents.push({ text: `Generate technical specifications or script code for a game asset based on: "${prompt}". If it is a script, provide the code in the scriptContent field.` });
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_PRO,
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['MODEL', 'TEXTURE', 'SOUND', 'SCRIPT'] },
            description: { type: Type.STRING },
            polyCount: { type: Type.INTEGER },
            textureResolution: { type: Type.STRING },
            scriptContent: { type: Type.STRING },
            aiConfidence: { type: Type.NUMBER }
          },
          required: ["name", "type", "description", "aiConfidence"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedAsset;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Asset Generation Error:", error);
    throw error;
  }
};

/**
 * Generates raw 3D mesh data (OBJ format).
 */
export const generate3DModel = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_PRO,
            contents: `Generate a simple 3D model of ${prompt} in Wavefront OBJ format.
            Keep the mesh low-poly and simple (under 500 faces if possible).
            Output ONLY the raw OBJ data (vertices 'v ...' and faces 'f ...').
            Do NOT include markdown code blocks or any other text.
            Ensure the geometry is valid.`,
        });
        return response.text || "";
    } catch (e) {
        console.error("Mesh Gen Error", e);
        throw e;
    }
}

// --- WORLD BUILDER ---

/**
 * Generates world lore using streaming, optionally with Google Search/Maps grounding.
 */
export const streamWorldGeneration = async (
  prompt: string, 
  useGrounding: boolean,
  onChunk: (text: string) => void
): Promise<void> => {
  try {
    // Grounding requires Gemini Flash 2.5 (as per guidelines for tools)
    // If using grounding, we use generateContent (non-stream) to get sources first, then stream or just return text.
    // However, for simplicity in UI, if grounding is on, we'll do a single fetch. 
    
    if (useGrounding) {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL_FLASH,
        contents: `You are a world architect. Create a realistic world description based on: "${prompt}". Use real-world data where applicable.`,
        config: {
          tools: [{ googleSearch: {} }, { googleMaps: {} }],
        }
      });
      
      let text = response.text || "";
      
      // Append grounding sources if available
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
         text += "\n\n**Sources:**\n";
         chunks.forEach((chunk: any) => {
            if (chunk.web?.uri) text += `- [${chunk.web.title}](${chunk.web.uri})\n`;
         });
      }
      onChunk(text);
      return;
    }

    // Standard Creative Stream
    const result = await ai.models.generateContentStream({
      model: GEMINI_MODEL_PRO,
      contents: `You are the architect of a digital open world. 
      Create a detailed world description based on: "${prompt}".
      Include details about the biome, the lore, the weather, and unique physics anomalies.
      Format using Markdown.`,
      config: { temperature: 0.8 }
    });

    for await (const chunk of result) {
        if (chunk.text) onChunk(chunk.text);
    }
  } catch (error) {
    console.error("World Stream Error:", error);
    throw error;
  }
};

/**
 * Generates Concept Art.
 */
export const generateWorldImage = async (prompt: string, size: string = '1K', aspectRatio: string = '16:9'): Promise<string> => {
    // Ensure aspectRatio is one of the supported strings: "1:1", "3:4", "4:3", "9:16", "16:9"
    // size: "1K", "2K", "4K"
    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_IMAGE,
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio as any,
                    imageSize: size as any
                }
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        throw new Error("No image data returned");
    } catch (e) {
        console.error("Image Gen Error", e);
        throw e;
    }
}

/**
 * Generates Video (Veo).
 */
export const generateWorldVideo = async (prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
    // Note: Caller must ensure window.aistudio.hasSelectedApiKey() is checked before calling.
    // Create a NEW instance to pick up the selected key (if changed).
    const aiWithUserKey = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let operation = await aiWithUserKey.models.generateVideos({
        model: GEMINI_MODEL_VIDEO,
        prompt: prompt,
        config: {
            numberOfVideos: 1,
            resolution: '1080p',
            aspectRatio: aspectRatio
        }
    });

    // Poll for completion
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await aiWithUserKey.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed");

    // Fetch the actual video bytes using the API Key
    const res = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
}

// --- PHYSICS ---
export const analyzePhysicsLog = async (logData: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_FLASH, // Use Flash for faster analysis
            contents: `Analyze this physics engine log and suggest optimizations: ${logData}`,
        });
        return response.text || "No analysis generated.";
    } catch (error) {
        return "Analysis failed.";
    }
}

// --- TRANSLATION ---
export const translateText = async (text: string, targetLang: 'Chinese' | 'English'): Promise<string> => {
    try {
        const prompt = targetLang === 'Chinese' 
            ? `Translate the following English text to Chinese (Simplified). Keep it suitable for a sci-fi/tech game context if applicable:\n\n${text}`
            : `Translate the following Chinese text to English. Keep it suitable for a sci-fi/tech game context if applicable:\n\n${text}`;
            
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_FLASH,
            contents: prompt
        });
        return response.text || "";
    } catch (e) {
        console.error("Translation Failed", e);
        return "Translation Error";
    }
}