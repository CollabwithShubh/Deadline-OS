import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
const cacheMap = new Map<string, { data: any; expiry: number }>();
const pendingRequests = new Map<string, Promise<string>>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache TTL

export function getAi(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY?.trim();
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. AI features will fallback to template-based simulation.");
      return null;
    }
    aiClient = new GoogleGenAI({ 
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

export interface GeminiCallConfig {
  systemInstruction?: string;
  responseMimeType?: 'application/json' | 'text/plain';
  temperature?: number;
  maxOutputTokens?: number;
}

/**
 * Executes a call to the Gemini API with caching, deduplication, retry logic, timeout, and detailed logging.
 */
export async function callGemini(
  prompt: string,
  config: GeminiCallConfig = {},
  retries = 4,
  backoffMs = 1000
): Promise<string> {
  const promptForCacheKey = prompt.replace(/Current ISO Timestamp: .*/, 'Current ISO Timestamp: [OMITTED]');
  const cacheKey = `${promptForCacheKey}_${config.systemInstruction || ''}_${config.responseMimeType || ''}`;
  const now = Date.now();
  
  // 1. Check in-memory Cache
  const cached = cacheMap.get(cacheKey);
  if (cached && cached.expiry > now) {
    console.log('[Gemini Cache Hit] Returning cached compilation.');
    return cached.data;
  }

  // 2. Check for pending concurrent request (Deduplication)
  if (pendingRequests.has(cacheKey)) {
    console.log('[Gemini Request Deduplicated] Reusing active API call...');
    return pendingRequests.get(cacheKey)!;
  }

  const ai = getAi();
  if (!ai) {
    throw new Error('Gemini client not initialized: Missing API Key.');
  }

  const promise = (async () => {
    const startTime = Date.now();
    let attempt = 0;

    while (attempt <= retries) {
      try {
        console.log(`[Gemini Call] Requesting model gemini-2.5-flash (Attempt ${attempt + 1}/${retries + 1})...`);
        
        // Implement timeout racing
        const apiCall = ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction: config.systemInstruction,
            responseMimeType: config.responseMimeType || 'application/json',
            temperature: config.temperature,
            maxOutputTokens: config.maxOutputTokens
          }
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Gemini API call timed out after 15000ms')), 15000);
        });

        const response = await Promise.race([apiCall, timeoutPromise]);
        const responseText = response.text || '';
        
        const duration = Date.now() - startTime;
        console.log(`[Gemini Success] Latency: ${duration}ms. Output length: ${responseText.length} chars.`);

        // Store in Cache
        cacheMap.set(cacheKey, {
          data: responseText,
          expiry: Date.now() + CACHE_TTL
        });

        pendingRequests.delete(cacheKey);
        return responseText;
      } catch (err: any) {
        console.warn(`[Gemini Error - Attempt ${attempt + 1}]`, err.message || err);
        attempt++;
        if (attempt > retries) {
          pendingRequests.delete(cacheKey);
          throw new Error(`Gemini pipeline exhausted after ${retries + 1} attempts. Last error: ${err.message || err}`);
        }
        // Wait for backoff
        if (err?.message?.includes('429') || err?.status === 429) {
          let delayMs = backoffMs * (attempt + 1) * 2;
          const retryMatch = err?.message?.match(/Please retry in ([\d\.]+)s/);
          if (retryMatch && retryMatch[1]) {
            delayMs = Math.ceil(parseFloat(retryMatch[1]) * 1000) + 1000;
          }
          console.warn(`[Gemini Rate Limit] Exceeded quota, waiting ${delayMs}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        } else {
          await new Promise(resolve => setTimeout(resolve, backoffMs * attempt));
        }
      }
    }
    pendingRequests.delete(cacheKey);
    throw new Error('Gemini pipeline execution failed unexpectedly.');
  })();

  pendingRequests.set(cacheKey, promise);
  return promise;
}

/**
 * Utility to clear the AI prompt cache if needed (e.g. on manual force-refresh)
 */
export function clearAiCache() {
  cacheMap.clear();
  console.log('[Gemini Cache] Cleared all stored AI outputs.');
}
