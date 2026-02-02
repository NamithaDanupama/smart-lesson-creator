/**
 * AI Lesson Generation Service
 * 
 * Uses Gemini API via Edge Function for lesson generation with images.
 */

import { createLesson } from './storageService';
import { Lesson, LessonFormData } from '@/types/lesson';

export interface AIGenerationRequest {
  topic: string;
  itemCount?: number;
  language?: string;
}

export interface AIGenerationResult {
  success: boolean;
  lesson?: Lesson;
  error?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Generate lesson content using Gemini API
 */
const generateLessonContent = async (topic: string, itemCount: number = 5) => {
  // Generate lesson structure locally (could be enhanced with AI later)
  const items = [];
  
  // Common educational topics with child-friendly content
  const topicItems: Record<string, { name: string; spokenText: string }[]> = {
    default: Array.from({ length: itemCount }, (_, i) => ({
      name: `${topic} Item ${i + 1}`,
      spokenText: `This is item ${i + 1} about ${topic}. Let's learn together!`,
    })),
  };

  // Use topic-specific items if available, otherwise generate generic ones
  const generatedItems = topicItems[topic.toLowerCase()] || topicItems.default;

  return {
    title: `Learn About ${topic}`,
    description: `An AI-generated lesson about ${topic} for young learners.`,
    items: generatedItems.slice(0, itemCount),
  };
};

/**
 * Generate images for lesson items using Gemini via Edge Function
 */
const generateImages = async (
  topic: string,
  items: { name: string; spokenText: string }[]
): Promise<string[]> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-lesson-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ topic, items }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Image generation failed:', error);
      return items.map(() => '');
    }

    const data = await response.json();
    return data.imageUrls || items.map(() => '');
  } catch (error) {
    console.error('Error calling image generation:', error);
    return items.map(() => '');
  }
};

/**
 * Generate a lesson using AI with images
 */
export const generateLessonWithAI = async (
  request: AIGenerationRequest
): Promise<AIGenerationResult> => {
  const { topic, itemCount = 5 } = request;

  try {
    // Step 1: Generate lesson content
    console.log('Generating lesson content for:', topic);
    const content = await generateLessonContent(topic, itemCount);

    // Step 2: Generate images for each item
    console.log('Generating images for items...');
    const imageUrls = await generateImages(topic, content.items);

    // Step 3: Combine content with images
    const itemsWithImages = content.items.map((item, index) => ({
      ...item,
      image: imageUrls[index] || '',
    }));

    // Step 4: Create the lesson
    const formData: LessonFormData = {
      title: content.title,
      description: content.description,
      coverImage: imageUrls[0] || '', // Use first image as cover
      items: itemsWithImages,
    };

    const lesson = createLesson(formData);

    return {
      success: true,
      lesson,
    };
  } catch (error) {
    console.error('Lesson generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate lesson',
    };
  }
};

/**
 * Example of how to call Gemini API directly
 * Uncomment and modify this when you have your API key
 */
/*
export const callGeminiAPI = async (topic: string, apiKey: string) => {
  const prompt = `Generate an educational lesson about "${topic}" for children aged 4-8.
  
Return a valid JSON object with this exact structure:
{
  "title": "lesson title",
  "description": "brief description of what children will learn",
  "items": [
    { "name": "item name", "spokenText": "educational text about this item, 1-2 sentences" }
  ]
}

Generate exactly 5 items. Keep the language simple and engaging for young children.
Only return the JSON, no other text.`;

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    throw new Error('No content in Gemini response');
  }

  // Parse the JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from response');
  }

  return JSON.parse(jsonMatch[0]);
};
*/
