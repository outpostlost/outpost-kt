import { GoogleGenerativeAI } from '@google/generative-ai';

// Static data mimicking future database structure
const staticProviderData = {
  providerId: "gemini",
  name: "Google Gemini",
  type: "direct",
  baseUrl: "https://generativelanguage.googleapis.com",
  authMethod: "api_key",
  active: true
};

const staticModelData = {
  modelId: "gemini-2.0-flash",
  providerId: "gemini",
  actualProvider: "google",
  displayName: "Gemini 2.0 Flash",
  pricing: { 
    input: 0.075, 
    output: 0.30, 
    unit: "1M tokens" 
  },
  capabilities: ["text", "vision"],
  contextWindow: 1048576,
  category: "multimodal",
  active: true
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { modelId, prompt } = req.body;

    // Validate required fields
    if (!modelId || !prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: modelId and prompt'
      });
    }

    // Verify we have the requested model (in future this will be database lookup)
    if (modelId !== staticModelData.modelId) {
      return res.status(404).json({
        success: false,
        error: `Model ${modelId} not found. Available: ${staticModelData.modelId}`
      });
    }

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY environment variable not configured'
      });
    }

    // Initialize Google AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: staticModelData.modelId });

    // Make API call to Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Return successful response
    return res.status(200).json({
      success: true,
      data: {
        modelUsed: staticModelData.modelId,
        provider: staticProviderData.name,
        prompt: prompt,
        response: text,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('LLM API Error:', error);
    
    // Handle specific error types
    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if (error.message?.includes('API key')) {
      errorMessage = 'Invalid API key configuration';
      statusCode = 401;
    } else if (error.message?.includes('quota')) {
      errorMessage = 'API quota exceeded';
      statusCode = 429;
    } else if (error.message?.includes('safety')) {
      errorMessage = 'Content filtered for safety reasons';
      statusCode = 400;
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: error.message
    });
  }
}