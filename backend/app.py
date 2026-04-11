from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import math
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

def count_words(text):
    return len(text.split())

def count_chars(text):
    return len(text)

def count_sentences(text):
    sentences = re.split(r'[.!?]+', text)
    return len([s for s in sentences if s.strip()])

def count_paragraphs(text):
    return len([p for p in text.split('\n') if p.strip()])

def reading_time(text):
    words = count_words(text)
    minutes = words / 200
    return round(minutes, 1)

def syllable_count(word):
    word = word.lower()
    if len(word) <= 3:
        return 1
    word = re.sub(r'[^a-z]', '', word)
    vowels = 'aeiouy'
    count = 0
    prev_vowel = False
    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_vowel:
            count += 1
        prev_vowel = is_vowel
    if word.endswith('e'):
        count -= 1
    return max(1, count)

def flesch_kincaid_grade(text):
    words = count_words(text)
    sentences = count_sentences(text)
    syllables = sum(syllable_count(w) for w in text.split())
    if words == 0 or sentences == 0:
        return 0
    score = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
    return round(max(0, min(score, 100)), 1)

def readability_level(grade):
    if grade <= 5:
        return "Easy"
    elif grade <= 8:
        return "Average"
    elif grade <= 12:
        return "Difficult"
    else:
        return "Very Difficult"

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def analyze_grammar_gemini(text):
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    prompt = f"""Analyze the following text for grammar and spelling mistakes. 
For each mistake, provide:
1. The error (original text)
2. A suggestion for correction
3. A brief explanation

Text: {text}

Response format (JSON only, no markdown):
{{
  "has_errors": true/false,
  "error_count": number,
  "errors": [
    {{
      "original": "error text",
      "suggestion": "corrected text", 
      "explanation": "why it's wrong"
    }}
  ]
}}"""
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 2048
        }
    }
    
    try:
        response = requests.post(api_url, json=payload, timeout=30)
        result = response.json()
        print("------------",result)
        
        text_response = result['candidates'][0]['content']['parts'][0]['text']
        json_match = re.search(r'\{[\s\S]*\}', text_response)
        if json_match:
            return json.loads(json_match.group())
        return {'has_errors': False, 'error_count': 0, 'errors': []}
        
    except Exception as e:
        return {'error': str(e), 'has_errors': False, 'errors': []}

SPAM_KEYWORDS = [
    'free', 'win', 'winner', 'prize', 'congratulations', 'urgent',
    'click here', 'act now', 'limited time', 'offer', 'discount',
    'cash', 'money', 'income', 'earn', 'guarantee', 'no risk',
    'credit', 'debt', 'lottery', 'million', 'billion', 'investment',
    'opportunity', 'exclusive', 'secret', 'amazing', 'incredible'
]

def spam_detection(text):
    text_lower = text.lower()
    words = text_lower.split()
    
    score = 0
    reasons = []
    
    # Keyword detection
    keyword_count = sum(1 for kw in SPAM_KEYWORDS if kw in text_lower)
    if keyword_count > 0:
        score += min(keyword_count * 10, 40)
        reasons.append(f"Found {keyword_count} spam keywords")
    
    # Excessive uppercase
    uppercase_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
    if uppercase_ratio > 0.3:
        score += 20
        reasons.append("Excessive uppercase letters")
    
    # Multiple exclamation marks
    if text.count('!') > 2:
        score += 10
        reasons.append("Multiple exclamation marks")
    
    # Numbers in sequence
    if re.search(r'\d{5,}', text):
        score += 15
        reasons.append("Contains long number sequences")
    
    # URL/link patterns
    if re.search(r'https?://|www\.|\.com|\.net|\.org', text):
        score += 10
        reasons.append("Contains URLs")
    
    # All caps words
    all_caps_words = re.findall(r'\b[A-Z]{4,}\b', text)
    if len(all_caps_words) > 2:
        score += 10
        reasons.append("Multiple all-caps words")
    
    # Spam phrase patterns
    spam_phrases = [
        r'click here now',
        r'act fast',
        r'don\'t miss',
        r'limited offer',
        r'apply now',
        r'call now',
        r'text now'
    ]
    for phrase in spam_phrases:
        if re.search(phrase, text_lower):
            score += 15
            reasons.append(f"Contains spam phrase pattern")
    
    # Final classification
    spam_probability = min(score, 100)
    is_spam = score >= 50
    
    return {
        'is_spam': is_spam,
        'score': spam_probability,
        'level': 'High' if score >= 70 else ('Medium' if score >= 40 else 'Low'),
        'reasons': reasons[:5]
    }

@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    text = data.get('text', '')
    
    if not text.strip():
        return jsonify({'error': 'Please enter some text'}), 400
    
    result = {
        'text_analysis': {
            'word_count': count_words(text),
            'char_count': count_chars(text),
            'sentence_count': count_sentences(text),
            'paragraph_count': count_paragraphs(text),
            'reading_time': reading_time(text),
            'flesch_kincaid_grade': flesch_kincaid_grade(text),
            'readability_level': readability_level(flesch_kincaid_grade(text))
        },
        'spam_detection': spam_detection(text)
    }
    
    return jsonify(result)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/api/grammar', methods=['POST'])
def grammar():
    data = request.get_json()
    text = data.get('text', '')
    
    if not text.strip():
        return jsonify({'error': 'Please enter some text'}), 400
    
    result = analyze_grammar_gemini(text)
    return jsonify(result)

@app.route('/api/grammar/correct', methods=['POST'])
def grammar_correct():
    data = request.get_json()
    text = data.get('text', '')
    
    if not text.strip():
        return jsonify({'error': 'Please enter some text'}), 400
    
    result = analyze_grammar_gemini(text)
    
    if result.get('has_errors') and result.get('errors'):
        corrected_text = text
        errors = sorted(result['errors'], key=lambda x: text.find(x['original']), reverse=True)
        for err in errors:
            original = err['original']
            suggestion = err['suggestion']
            if original in corrected_text:
                corrected_text = corrected_text.replace(original, suggestion, 1)
        
        return jsonify({
            'corrected_text': corrected_text,
            'applied_corrections': len(errors)
        })
    
    return jsonify({'corrected_text': text, 'applied_corrections': 0})

if __name__ == '__main__':
    app.run(debug=True, port=5000)