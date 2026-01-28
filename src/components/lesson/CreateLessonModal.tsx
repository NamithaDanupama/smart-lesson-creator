import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileEdit, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CreateLessonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: () => void;
  onSelectAI: () => void;
}

const CreateLessonModal = ({ open, onOpenChange, onSelectTemplate, onSelectAI }: CreateLessonModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Create New Lesson</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            variant="outline"
            className="flex h-auto flex-col items-center gap-2 p-6 text-left hover:border-primary hover:bg-primary/5"
            onClick={() => {
              onOpenChange(false);
              onSelectTemplate();
            }}
          >
            <FileEdit className="h-8 w-8 text-primary" />
            <span className="text-lg font-semibold">Use Customized Template</span>
            <span className="text-sm text-muted-foreground">
              Create your lesson manually with images and text
            </span>
          </Button>
          
          <Button
            variant="outline"
            className="flex h-auto flex-col items-center gap-2 p-6 text-left hover:border-primary hover:bg-primary/5"
            onClick={() => {
              onOpenChange(false);
              onSelectAI();
            }}
          >
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-lg font-semibold">
              Use AI Generated Template
            </span>
            <span className="text-sm text-muted-foreground">
              Let AI create lesson content for you
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLessonModal;
