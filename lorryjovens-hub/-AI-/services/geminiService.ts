import { GoogleGenAI } from "@google/genai";

// Helper to ensure global window object has aistudio types if needed
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

/**
 * Generates a video script or storyboard ideas using Gemini 2.5 Flash.
 */
export const generateScript = async (topic: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a creative 30-second short video script about: "${topic}". 
      Format it as a list of scenes with timecodes and visual descriptions. 
      Keep it concise and suitable for a social media video.`,
      config: {
        systemInstruction: "You are a professional video editor and scriptwriter.",
      }
    });
    return response.text || "No script generated.";
  } catch (error) {
    console.error("Script generation error:", error);
    throw error;
  }
};

/**
 * Analyzes an image (base64) and returns a list of short tags describing the content.
 */
export const analyzeAssetContent = async (base64Image: string, mimeType: string): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Strip header if present (e.g., "data:image/jpeg;base64,")
    const data = base64Image.split(',')[1] || base64Image;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: "Generate 3-5 short, single-word tags describing the visual content of this image (e.g., Landscape, Person, City, Food, Dark). Return only the tags separated by commas." }
        ]
      }
    });

    const text = response.text || "";
    return text.split(',').map(t => t.trim()).filter(t => t.length > 0);
  } catch (error) {
    console.error("Tagging error:", error);
    return [];
  }
};

/**
 * Checks if the user has selected a paid API key for Veo.
 */
export const checkVeoKeySelection = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    return await window.aistudio.hasSelectedApiKey();
  }
  return false;
};

/**
 * Opens the API key selection dialog.
 */
export const openVeoKeySelection = async (): Promise<void> => {
  if (window.aistudio && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
  }
};

/**
 * Generates a video using Veo 3.1 Fast.
 */
export const generateVeoVideo = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) {
    throw new Error("Failed to generate video URI");
  }

  const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
  if (!response.ok) {
     throw new Error(`Failed to download video: ${response.statusText}`);
  }
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};