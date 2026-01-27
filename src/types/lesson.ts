export interface LessonItem {
  id: string;
  image: string;
  name: string;
  spokenText: string;
  order: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  items: LessonItem[];
  createdAt: string;
  updatedAt: string;
}

export interface LessonFormData {
  title: string;
  description: string;
  coverImage: string;
  items: Omit<LessonItem, 'id' | 'order'>[];
}
