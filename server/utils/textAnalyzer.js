function countWords(text) {
  return text.split(/\s+/).filter(word => word.trim()).length;
}

function countChars(text) {
  return text.length;
}

function countSentences(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  return sentences.length;
}

function countParagraphs(text) {
  return text.split(/\n\n?/).filter(p => p.trim()).length;
}

function readingTime(text) {
  const words = countWords(text);
  const minutes = words / 200;
  return Math.round(minutes * 10) / 10;
}

function syllableCount(word) {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  word = word.replace(/[^a-z]/g, '');
  const vowels = 'aeiouy';
  let count = 0;
  let prevVowel = false;
  
  for (const char of word) {
    const isVowel = vowels.includes(char);
    if (isVowel && !prevVowel) {
      count++;
    }
    prevVowel = isVowel;
  }
  
  if (word.endsWith('e')) {
    count--;
  }
  
  return Math.max(1, count);
}

function fleschKincaidGrade(text) {
  const words = countWords(text);
  const sentences = countSentences(text);
  const syllables = text.split(/\s+/).reduce((sum, word) => sum + syllableCount(word), 0);
  
  if (words === 0 || sentences === 0) return 0;
  
  const score = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
  return Math.max(0, Math.min(Math.round(score * 10) / 10, 100));
}

function readabilityLevel(grade) {
  if (grade <= 5) return 'Easy';
  if (grade <= 8) return 'Average';
  if (grade <= 12) return 'Difficult';
  return 'Very Difficult';
}

const SPAM_KEYWORDS = [
  'free', 'win', 'winner', 'prize', 'congratulations', 'urgent',
  'click here', 'act now', 'limited time', 'offer', 'discount',
  'cash', 'money', 'income', 'earn', 'guarantee', 'no risk',
  'credit', 'debt', 'lottery', 'million', 'billion', 'investment',
  'opportunity', 'exclusive', 'secret', 'amazing', 'incredible'
];

const positiveWords = [
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'happy', 'love', 
  'best', 'fantastic', 'perfect', 'beautiful', 'awesome', 'brilliant', 
  'outstanding', 'pleased', 'joy', 'delighted', 'satisfied', 'impressive', 
  'exceptional', 'positive', 'success', 'successful', 'win', 'winner',
  'excited', 'exciting', 'enjoy', 'enjoyable', 'fun', 'pleasant', 'nice',
  'helpful', 'useful', 'valuable', 'appreciate', 'grateful', 'thankful',
  'beautiful', 'lovely', 'perfect', 'incredible', 'magnificent', 'superb',
  'terrific', 'fabulous', 'marvelous', 'splendid', 'genuine', 'sincere'
];

const negativeWords = [
  'bad', 'terrible', 'awful', 'horrible', 'poor', 'sad', 'hate', 'worst',
  'disappointing', 'failure', 'angry', 'upset', 'frustrated', 'annoying',
  'boring', 'difficult', 'painful', 'useless', 'pathetic', 'disgusting',
  'negative', 'failed', 'fail', 'wrong', 'mistake', 'error', 'problem',
  'issue', 'trouble', 'worry', 'worried', 'fear', 'afraid', 'scared',
  'terrible', 'dreadful', 'appalling', 'vile', 'odious', 'loathsome',
  'disgusting', 'revolting', 'sickening', 'nauseating', 'unpleasant'
];

function spamDetection(text) {
  const textLower = text.toLowerCase();
  let score = 0;
  const reasons = [];
  
  const keywordCount = SPAM_KEYWORDS.filter(kw => textLower.includes(kw)).length;
  if (keywordCount > 0) {
    score += Math.min(keywordCount * 10, 40);
    reasons.push(`${keywordCount} spam keywords found`);
  }
  
  const uppercaseCount = (text.match(/[A-Z]/g) || []).length;
  const uppercaseRatio = uppercaseCount / Math.max(text.length, 1);
  if (uppercaseRatio > 0.3) {
    score += 20;
    reasons.push('Excessive uppercase letters');
  }
  
  if ((text.match(/!/g) || []).length > 2) {
    score += 10;
    reasons.push('Multiple exclamation marks');
  }
  
  if (/\d{5,}/.test(text)) {
    score += 15;
    reasons.push('Contains long number sequences');
  }
  
  if (/https?:\/\/|www\.|\.com|\.net|\.org/.test(text)) {
    score += 10;
    reasons.push('Contains URLs');
  }
  
  const allCapsWords = (text.match(/\b[A-Z]{4,}\b/g) || []).length;
  if (allCapsWords > 2) {
    score += 10;
    reasons.push('Multiple all-caps words');
  }
  
  const spamPhrases = [
    /click here now/i, /act fast/i, /don't miss/i,
    /limited offer/i, /apply now/i, /call now/i, /text now/i
  ];
  for (const phrase of spamPhrases) {
    if (phrase.test(text)) {
      score += 15;
      reasons.push('Contains spam phrase pattern');
      break;
    }
  }
  
  const spamProbability = Math.min(score, 100);
  const isSpam = score >= 50;
  
  return {
    isSpam,
    score: spamProbability,
    level: score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low',
    reasons: reasons.slice(0, 5)
  };
}

function sentimentAnalysis(text) {
  const textLower = text.toLowerCase();
  const words = textLower.split(/\s+/);
  const wordCount = words.length;
  
  if (wordCount === 0) {
    return {
      label: 'Neutral',
      score: 0,
      confidence: 'Low',
      positiveCount: 0,
      negativeCount: 0,
      neutralCount: 0
    };
  }
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of words) {
    const cleanedWord = word.replace(/[^a-z]/g, '');
    if (positiveWords.includes(cleanedWord)) {
      positiveCount++;
    }
    if (negativeWords.includes(cleanedWord)) {
      negativeCount++;
    }
  }
  
  const neutralCount = wordCount - positiveCount - negativeCount;
  
  const score = Math.round(((positiveCount - negativeCount) / wordCount) * 100);
  
  let label = 'Neutral';
  if (score > 5) label = 'Positive';
  else if (score < -5) label = 'Negative';
  
  let confidence = 'Low';
  const totalSentimentWords = positiveCount + negativeCount;
  if (totalSentimentWords >= 5) confidence = 'High';
  else if (totalSentimentWords >= 2) confidence = 'Medium';
  
  return {
    label,
    score,
    confidence,
    positiveCount,
    negativeCount,
    neutralCount
  };
}

export {
  countWords,
  countChars,
  countSentences,
  countParagraphs,
  readingTime,
  fleschKincaidGrade,
  readabilityLevel,
  spamDetection,
  sentimentAnalysis
};