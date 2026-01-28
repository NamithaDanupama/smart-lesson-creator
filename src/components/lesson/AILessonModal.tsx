import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { generateLessonWithAI } from '@/services/aiLessonService';
import { toast } from '@/hooks/use-toast';

interface AILessonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLessonCreated: () => void;
}

const AILessonModal = ({ open, onOpenChange, onLessonCreated }: AILessonModalProps) => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: 'Enter a topic',
        description: 'Please enter a topic for your lesson.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateLessonWithAI({ topic: topic.trim() });

      if (result.success && result.lesson) {
        toast({
          title: 'Lesson generated!',
          description: `Your lesson about "${topic}" has been created.`,
        });
        onOpenChange(false);
        setTopic('');
        onLessonCreated();
        // Navigate to edit the generated lesson
        navigate(`/edit/${result.lesson.id}`);
      } else {
        toast({
          title: 'Generation failed',
          description: result.error || 'Failed to generate lesson. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Lesson Generator
          </DialogTitle>
          <DialogDescription>
            Enter a topic and let AI create a lesson for you. You can edit the generated lesson afterward.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="topic" className="text-sm font-medium">
              Lesson Topic
            </Label>
            <Input
              id="topic"
              placeholder="e.g., Fruits, Animals, Colors, Numbers..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1"
              disabled={isGenerating}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">💡 Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Be specific: "Farm Animals" works better than "Animals"</li>
              <li>You can edit or add images after generation</li>
              <li>Generated lessons are saved automatically</li>
            </ul>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Lesson
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AILessonModal;
