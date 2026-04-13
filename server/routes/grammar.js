import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const DEFAULT_RESPONSE = {
  hasErrors: false,
  errorCount: 0,
  errors: [],
  correctedText: ''
};

const getModel = (apiKey) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

router.post('/check', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Please enter some text' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key' || GEMINI_API_KEY === '') {
      return res.json({
        ...DEFAULT_RESPONSE,
        message: 'Grammar check requires a valid Gemini API key in server .env file'
      });
    }

    const prompt = `Analyze the following text for grammar and spelling mistakes. 
For each mistake, provide:
1. The error (original text)
2. A suggestion for correction
3. A brief explanation
4. Also provide the corrected version of the entire text

Text: ${text}

Response format (JSON only, no markdown):
{
  "has_errors": true/false,
  "error_count": number,
  "errors": [
    {
      "original": "error text",
      "suggestion": "corrected text",
      "explanation": "why it's wrong"
    }
  ],
  "corrected_text": "full corrected text here"
}`;

    const model = getModel(GEMINI_API_KEY);
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048
      }
    });

    const responseText = result.response.text();
    console.log('Gemini response:', responseText);

    if (!responseText || typeof responseText !== 'string') {
      console.error('Invalid response text');
      return res.json(DEFAULT_RESPONSE);
    }
    
    let cleanText = responseText.trim();
    
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch && jsonMatch[0]) {
      try {
        const result = JSON.parse(jsonMatch[0]);
        
        let correctedText = result.corrected_text || '';
        
        if (!correctedText && result.errors && result.errors.length > 0) {
          let tempCorrected = text;
          const errors = result.errors.sort((a, b) => 
            text.indexOf(b.original) - text.indexOf(a.original)
          );
          
          for (const err of errors) {
            if (err.original && err.suggestion && tempCorrected.includes(err.original)) {
              tempCorrected = tempCorrected.replace(err.original, err.suggestion, 1);
            }
          }
          correctedText = tempCorrected;
        }
        
        const convertedResult = {
          hasErrors: result.has_errors || false,
          errorCount: result.error_count || 0,
          errors: result.errors || [],
          correctedText: correctedText || text
        };
        
        return res.json(convertedResult);
      } catch (parseError) {
        console.error('JSON parse error:', parseError.message);
        return res.json(DEFAULT_RESPONSE);
      }
    }

    return res.json(DEFAULT_RESPONSE);
  } catch (error) {
    console.error('Grammar check error:', error.message);
    return res.json(DEFAULT_RESPONSE);
  }
});

router.post('/correct', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Please enter some text' });
    }

    const CORRECT_DEFAULT = {
      correctedText: text,
      appliedCorrections: 0
    };

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key' || GEMINI_API_KEY === '') {
      return res.json({
        ...CORRECT_DEFAULT,
        message: 'Auto correct requires a valid Gemini API key in server .env file'
      });
    }

    const prompt = `Analyze the following text for grammar and spelling mistakes and provide corrections.
For each mistake, provide:
1. The error (original text)
2. A suggestion for correction

Text: ${text}

Response format (JSON only, no markdown):
{
  "has_errors": true/false,
  "error_count": number,
  "errors": [
    {
      "original": "error text",
      "suggestion": "corrected text"
    }
  ]
}`;

    const model = getModel(GEMINI_API_KEY);
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048
      }
    });

    const responseText = result.response.text();
    console.log('Gemini response:', responseText);

    if (!responseText || typeof responseText !== 'string') {
      console.error('Invalid response text');
      return res.json(CORRECT_DEFAULT);
    }
    
    let cleanText = responseText.trim();
    
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch && jsonMatch[0]) {
      try {
        const result = JSON.parse(jsonMatch[0]);
        
        if (result.has_errors && result.errors && result.errors.length > 0) {
          let correctedText = text;
          const errors = result.errors.sort((a, b) => 
            text.indexOf(b.original) - text.indexOf(a.original)
          );
          
          for (const err of errors) {
            if (err.original && err.suggestion && correctedText.includes(err.original)) {
              correctedText = correctedText.replace(err.original, err.suggestion, 1);
            }
          }

          return res.json({
            correctedText,
            appliedCorrections: result.error_count || 0
          });
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError.message);
        return res.json(CORRECT_DEFAULT);
      }
    }

    return res.json(CORRECT_DEFAULT);
  } catch (error) {
    console.error('Auto correct error:', error.message);
    return res.json({ 
      correctedText: req.body?.text || '', 
      appliedCorrections: 0 
    });
  }
});

export default router;