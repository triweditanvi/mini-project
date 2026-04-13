import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  countWords,
  countChars,
  countSentences,
  countParagraphs,
  readingTime,
  fleschKincaidGrade,
  readabilityLevel,
  spamDetection,
  sentimentAnalysis
} from '../utils/textAnalyzer.js';

const router = express.Router();

router.post('/', protect, (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Please enter some text' });
    }

    const textAnalysis = {
      wordCount: countWords(text),
      charCount: countChars(text),
      sentenceCount: countSentences(text),
      paragraphCount: countParagraphs(text),
      readingTime: readingTime(text),
      fleschKincaidGrade: fleschKincaidGrade(text),
      readabilityLevel: readabilityLevel(fleschKincaidGrade(text))
    };

    res.json({
      textAnalysis,
      spamDetection: spamDetection(text),
      sentiment: sentimentAnalysis(text)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;