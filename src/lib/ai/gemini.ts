import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export class GeminiNotConfiguredError extends Error {
  constructor(message = 'GEMINI_API_KEY environment variable is not set.') {
    super(message);
    this.name = 'GeminiNotConfiguredError';
  }
}

// Lazy initialization to avoid throwing at startup if not used
let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

function getModel(): GenerativeModel {
  if (model) return model;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiNotConfiguredError();
  }

  genAI = new GoogleGenerativeAI(apiKey);
  // use gemini-1.5-flash as requested
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  return model;
}

/**
 * Generates content using Gemini with automatic retries and exponential backoff.
 */
export async function generateContent(prompt: string): Promise<string> {
  const aiModel = getModel();
  
  const maxRetries = 3;
  let delay = 1000; // start with 1 second backoff

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await aiModel.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      if (attempt === maxRetries) {
        console.error(`Gemini generation failed after ${maxRetries} attempts:`, error);
        throw error;
      }
      
      console.warn(`Gemini generation attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // exponential backoff
    }
  }

  throw new Error('Unreachable'); // TS compiler satisfaction
}
