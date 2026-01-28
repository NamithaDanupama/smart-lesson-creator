import { Lesson } from '@/types/lesson';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { BookOpen, Pencil, Trash2 } from 'lucide-react';

interface LessonCardProps {
  lesson: Lesson;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const LessonCard = ({ lesson, onClick, onEdit, onDelete }: LessonCardProps) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

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
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {lesson.items.length} items
          </span>
          <div className="flex gap-1" onClick={handleDeleteClick}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={handleEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{lesson.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonCard;
