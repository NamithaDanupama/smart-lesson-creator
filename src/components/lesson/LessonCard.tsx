import { Lesson } from '@/types/lesson';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';

interface LessonCardProps {
  lesson: Lesson;
  onClick: () => void;
}

const LessonCard = ({ lesson, onClick }: LessonCardProps) => {
  return (
    <Card 
      className="cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl bg-card border-2 border-border/50"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {lesson.coverImage ? (
          <img
            src={lesson.coverImage}
            alt={lesson.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/40">
            <BookOpen className="h-16 w-16 text-primary/60" />
          </div>
        )}
        <Badge className="absolute right-2 top-2 bg-primary text-primary-foreground">
          Activity
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="mb-1 text-lg font-bold text-foreground line-clamp-1">
          {lesson.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {lesson.description}
        </p>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <span>{lesson.items.length} items</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonCard;
