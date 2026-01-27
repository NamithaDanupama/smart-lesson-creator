import { Lesson, LessonFormData, LessonItem } from '@/types/lesson';

const LESSONS_KEY = 'lessons';

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get all lessons
export const getLessons = (): Lesson[] => {
  const data = localStorage.getItem(LESSONS_KEY);
  return data ? JSON.parse(data) : [];
};

// Get single lesson by ID
export const getLessonById = (id: string): Lesson | undefined => {
  const lessons = getLessons();
  return lessons.find(lesson => lesson.id === id);
};

// Create new lesson
export const createLesson = (formData: LessonFormData): Lesson => {
  const lessons = getLessons();
  
  const items: LessonItem[] = formData.items.map((item, index) => ({
    ...item,
    id: generateId(),
    order: index,
  }));

  const newLesson: Lesson = {
    id: generateId(),
    title: formData.title,
    description: formData.description,
    coverImage: formData.coverImage,
    items,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  lessons.push(newLesson);
  localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
  
  return newLesson;
};

// Update existing lesson
export const updateLesson = (id: string, formData: LessonFormData): Lesson | undefined => {
  const lessons = getLessons();
  const index = lessons.findIndex(lesson => lesson.id === id);
  
  if (index === -1) return undefined;

  const items: LessonItem[] = formData.items.map((item, idx) => ({
    ...item,
    id: generateId(),
    order: idx,
  }));

  const updatedLesson: Lesson = {
    ...lessons[index],
    title: formData.title,
    description: formData.description,
    coverImage: formData.coverImage,
    items,
    updatedAt: new Date().toISOString(),
  };

  lessons[index] = updatedLesson;
  localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
  
  return updatedLesson;
};

// Delete lesson
export const deleteLesson = (id: string): boolean => {
  const lessons = getLessons();
  const filtered = lessons.filter(lesson => lesson.id !== id);
  
  if (filtered.length === lessons.length) return false;
  
  localStorage.setItem(LESSONS_KEY, JSON.stringify(filtered));
  return true;
};
