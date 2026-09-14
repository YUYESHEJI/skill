import { GoogleGenAI } from '@google/genai';

class GeminiService {
  constructor() {
    this.apiKey = localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
    this.ai = null;
  }

  setApiKey(key) {
    this.apiKey = key;
    localStorage.setItem('gemini_api_key', key);
    this.ai = new GoogleGenAI({ apiKey: key });
  }

  async generateImage(prompt, signal) {
    if (!this.ai) throw new Error('API Key 未设置');

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: { parts: [{ text: prompt }] },
      config: { responseModalities: ['IMAGE'] }
    }, { signal });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
    throw new Error('未生成图像');
  }

  async generateImageFromReference(imageDataUrl, prompt, signal) {
    if (!this.ai) throw new Error('API Key 未设置');

    const base64Data = imageDataUrl.split(',')[1];
    const mimeType = imageDataUrl.split(';')[0].split(':')[1];

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64Data } }
        ]
      },
      config: { responseModalities: ['IMAGE'] }
    }, { signal });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
    throw new Error('未生成图像');
  }

  async removeBackground(imageDataUrl, signal) {
    const prompt = `Remove the background from this character image. Return only the character with transparent background. Keep all details of the character intact. Output as PNG with transparency.`;
    return this.generateImageFromReference(imageDataUrl, prompt, signal);
  }

  async generateActionFrame(referenceImage, actionType, frameIndex, totalFrames, signal) {
    const actionDescriptions = {
      idle: `Frame ${frameIndex + 1}/${totalFrames}: Idle stance, subtle breathing animation, slight body sway, ready pose`,
      walk: `Frame ${frameIndex + 1}/${totalFrames}: Walking cycle, natural leg and arm movement, ${frameIndex % 2 === 0 ? 'left leg forward' : 'right leg forward'}`,
      run: `Frame ${frameIndex + 1}/${totalFrames}: Running pose, dynamic forward lean, ${frameIndex % 2 === 0 ? 'right arm forward' : 'left arm forward'}`,
      jump: `Frame ${frameIndex + 1}/${totalFrames}: ${frameIndex < totalFrames / 3 ? 'crouching and preparing to jump' : frameIndex < 2 * totalFrames / 3 ? 'mid-air jump pose' : 'landing pose'}`,
      attack: `Frame ${frameIndex + 1}/${totalFrames}: ${frameIndex < totalFrames / 3 ? 'wind-up attack pose, fist pulled back' : frameIndex < 2 * totalFrames / 3 ? 'striking forward with cosmic energy' : 'follow-through pose'}`,
      special: `Frame ${frameIndex + 1}/${totalFrames}: Special attack with glowing cosmic energy effects, dynamic pose, particle effects around character`
    };

    const prompt = `Generate a 2D game sprite frame based on this reference character. ${actionDescriptions[actionType] || actionDescriptions.idle}. Pixel art style, game sprite, side view, transparent background, consistent character design, high quality.`;
    
    return this.generateImageFromReference(referenceImage, prompt, signal);
  }
}

export const geminiService = new GeminiService();
