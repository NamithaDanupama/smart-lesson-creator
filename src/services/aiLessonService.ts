/**
 * AI Lesson Generation Service
 * 
 * Calls Flask backend API for lesson and image generation using Gemini.
 * Configure FLASK_API_URL to point to your Flask server.
 */

import { createLesson } from './storageService';
import { Lesson, LessonFormData } from '@/types/lesson';

// Configure this to your Flask backend URL
const FLASK_API_URL = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000';

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

interface GeneratedItem {
  name: string;
  spokenText: string;
  image: string;
}

interface FlaskLessonResponse {
  success: boolean;
  title: string;
  description: string;
  items: GeneratedItem[];
  error?: string;
}

/**
 * Generate a complete lesson using Flask backend with Gemini API
 */
export const generateLessonWithAI = async (
  request: AIGenerationRequest
): Promise<AIGenerationResult> => {
  const { topic, itemCount = 5 } = request;

  try {
    console.log('Calling Flask API to generate lesson for:', topic);

    const response = await fetch(`${FLASK_API_URL}/api/generate-lesson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        topic, 
        item_count: itemCount 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Flask API error:', response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data: FlaskLessonResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to generate lesson');
    }

    // Create the lesson with local storage
    const formData: LessonFormData = {
      title: data.title,
      description: data.description,
      coverImage: data.items[0]?.image || '',
      items: data.items.map(item => ({
        name: item.name,
        spokenText: item.spokenText,
        image: item.image,
      })),
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
 * Generate lesson content only (without images) - fallback mode
 */
export const generateLessonContentOnly = async (
  topic: string,
  itemCount: number = 5
): Promise<AIGenerationResult> => {
  try {
    const response = await fetch(`${FLASK_API_URL}/api/generate-lesson-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, item_count: itemCount }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    const formData: LessonFormData = {
      title: data.title,
      description: data.description,
      coverImage: '',
      items: data.items.map((item: { name: string; spokenText: string }) => ({
        name: item.name,
        spokenText: item.spokenText,
        image: '',
      })),
    };

    const lesson = createLesson(formData);

    return { success: true, lesson };
  } catch (error) {
    console.error('Content generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate content',
    };
  }
};
