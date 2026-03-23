import { GoogleGenAI } from '@google/genai';

/**
 * Sends text to Google GenAI to determine if it violates community guidelines
 * (e.g., hate speech, severe harassment, extreme profanity, illegal content).
 * 
 * @param {string} text - The user-submitted argument or comment.
 * @returns {Promise<boolean>} - True if safe, False if unsafe/toxic.
 */
export const isContentSafe = async (text) => {
  // If text is empty or missing, it's technically "safe" from a toxicity standpoint (validation will catch emptiness)
  if (!text || text.trim() === '') return true;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Strict prompt engineered to return a simple boolean string
    const prompt = `
You are a strict automated Content Moderator for a public debate platform.
Your job is to analyze the following user-submitted text and determine if it violates community guidelines.

Guidelines for Rejection (Unsafe):
- Hate speech (racism, sexism, homophobia, etc.)
- Severe bullying, harassment, or direct personal attacks
- Encouragement of illegal acts or self-harm
- Extreme, gratuitous profanity (mild profanity used for emphasis is okay, but purely abusive text is not)

Text to analyze:
"${text}"

Based ONLY on the guidelines above, is this text SAFE to post?
Return EXACTLY "true" if the text is safe.
Return EXACTLY "false" if the text violates guidelines and should be rejected.
Do not provide any other explanation or text.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const rawVerdict = response.text.trim().toLowerCase();
    
    // Default to false (unsafe) if the AI returns something unexpected, just to be safe
    if (rawVerdict === 'true') {
      return true;
    } else {
      console.warn('⚠️ AI Moderation flagged content as UNSAFE:', text);
      return false;
    }

  } catch (error) {
    console.error('AI Moderation Service Error:', error);
    // If the AI fails (e.g., API quota, network issue), we default to true (safe)
    // so we don't accidentally block all users from participating due to a server error.
    return true; 
  }
};
