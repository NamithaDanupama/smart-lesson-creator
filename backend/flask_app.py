"""
Flask Backend for AI Lesson Generator

This is your Flask backend code. Run it separately with:
    pip install flask flask-cors google-generativeai python-dotenv requests
    python flask_app.py

Set your GEMINI_API_KEY environment variable before running.
"""

import os
import json
import re
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configure Gemini API
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


def generate_image_with_rest_api(prompt: str) -> str:
    """
    Generate an image using Gemini's REST API directly.
    Returns base64 data URL or empty string on failure.
    """
    if not GEMINI_API_KEY:
        return ''
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key={GEMINI_API_KEY}"
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "responseModalities": ["IMAGE", "TEXT"]
        }
    }
    
    try:
        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        
        # Extract image from response
        candidates = data.get('candidates', [])
        if candidates:
            parts = candidates[0].get('content', {}).get('parts', [])
            for part in parts:
                if 'inlineData' in part:
                    inline_data = part['inlineData']
                    mime_type = inline_data.get('mimeType', 'image/png')
                    image_data = inline_data.get('data', '')
                    if image_data:
                        return f"data:{mime_type};base64,{image_data}"
        return ''
    except Exception as e:
        print(f"REST API image generation error: {e}")
        return ''


@app.route('/api/generate-lesson', methods=['POST'])
def generate_lesson():
    """
    Generate a complete lesson with AI-generated content and images.
    """
    try:
        data = request.get_json()
        topic = data.get('topic', '')
        item_count = data.get('item_count', 5)

        if not topic:
            return jsonify({'success': False, 'error': 'Topic is required'}), 400

        if not GEMINI_API_KEY:
            return jsonify({'success': False, 'error': 'GEMINI_API_KEY not configured'}), 500

        # Step 1: Generate lesson content using Gemini text model
        print(f"Generating lesson content for topic: {topic}")
        content_model = genai.GenerativeModel('gemini-2.0-flash')
        
        content_prompt = f"""Generate an educational lesson about "{topic}" for children aged 4-8.

Return a valid JSON object with this exact structure:
{{
    "title": "Learn About {topic}",
    "description": "A fun lesson about {topic} for young learners.",
    "items": [
        {{"name": "item name", "spokenText": "Simple, engaging text about this item (1-2 sentences)"}}
    ]
}}

Generate exactly {item_count} items. Keep language simple and child-friendly.
Only return the JSON, no other text."""

        content_response = content_model.generate_content(content_prompt)
        content_text = content_response.text
        
        # Parse JSON from response
        json_match = re.search(r'\{[\s\S]*\}', content_text)
        if not json_match:
            raise ValueError('Could not parse JSON from content response')
        
        lesson_content = json.loads(json_match.group())
        print(f"Generated {len(lesson_content.get('items', []))} lesson items")

        # Step 2: Generate images for each item using REST API
        items_with_images = []
        for idx, item in enumerate(lesson_content.get('items', [])):
            print(f"Generating image {idx + 1}/{len(lesson_content.get('items', []))}: {item['name']}")
            
            image_prompt = f"""Create a simple, colorful, child-friendly cartoon illustration of "{item['name']}" for an educational children's app about "{topic}".
The image should be:
- Bright and cheerful colors
- Simple and clear shapes
- Cute and friendly style suitable for ages 4-8
- No text in the image
- White or simple background
- Single subject focused"""

            image_data = generate_image_with_rest_api(image_prompt)
            
            if image_data:
                print(f"  ✓ Image generated for {item['name']}")
            else:
                print(f"  ⚠ No image generated for {item['name']}")

            items_with_images.append({
                'name': item['name'],
                'spokenText': item['spokenText'],
                'image': image_data
            })

        return jsonify({
            'success': True,
            'title': lesson_content.get('title', f'Learn About {topic}'),
            'description': lesson_content.get('description', f'A fun lesson about {topic}'),
            'items': items_with_images
        })

    except Exception as e:
        print(f"Error generating lesson: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/generate-lesson-content', methods=['POST'])
def generate_lesson_content():
    """
    Generate lesson content only (no images) - faster fallback.
    """
    try:
        data = request.get_json()
        topic = data.get('topic', '')
        item_count = data.get('item_count', 5)

        if not topic:
            return jsonify({'success': False, 'error': 'Topic is required'}), 400

        if not GEMINI_API_KEY:
            return jsonify({'success': False, 'error': 'GEMINI_API_KEY not configured'}), 500

        model = genai.GenerativeModel('gemini-2.0-flash')
        
        prompt = f"""Generate an educational lesson about "{topic}" for children aged 4-8.

Return a valid JSON object with this exact structure:
{{
    "title": "Learn About {topic}",
    "description": "A fun lesson about {topic} for young learners.",
    "items": [
        {{"name": "item name", "spokenText": "Simple, engaging text about this item (1-2 sentences)"}}
    ]
}}

Generate exactly {item_count} items. Keep language simple and child-friendly.
Only return the JSON, no other text."""

        response = model.generate_content(prompt)
        response_text = response.text
        
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if not json_match:
            raise ValueError('Could not parse JSON from response')
        
        lesson_data = json.loads(json_match.group())

        return jsonify({
            'success': True,
            'title': lesson_data.get('title', f'Learn About {topic}'),
            'description': lesson_data.get('description', f'A fun lesson about {topic}'),
            'items': lesson_data.get('items', [])
        })

    except Exception as e:
        print(f"Error generating content: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'gemini_configured': GEMINI_API_KEY is not None
    })


if __name__ == '__main__':
    print("=" * 50)
    print("Starting Flask server on http://localhost:5000")
    print(f"GEMINI_API_KEY configured: {GEMINI_API_KEY is not None}")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)
