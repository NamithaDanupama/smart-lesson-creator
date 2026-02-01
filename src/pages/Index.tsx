import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { getLessons, deleteLesson } from '@/services/storageService';
import { Lesson } from '@/types/lesson';
import LessonCard from '@/components/lesson/LessonCard';
import CreateLessonModal from '@/components/lesson/CreateLessonModal';
import AILessonModal from '@/components/lesson/AILessonModal';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  useEffect(() => {
    setLessons(getLessons());
  }, []);

  const handlePlayLesson = (lessonId: string) => {
    navigate(`/play/${lessonId}`);
  };

  const handleEditLesson = (lessonId: string) => {
    navigate(`/edit/${lessonId}`);
  };

  const handleDeleteLesson = (lessonId: string) => {
    deleteLesson(lessonId);
    setLessons(getLessons());
    toast({
      title: 'Lesson deleted',
      description: 'The lesson has been removed.',
    });
  };

  const handleCreateLesson = () => {
    navigate('/create');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-foreground"
            // onClick={() => navigate('/YourMainPageRoute')} // Uncomment and update this to link to your main page
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Activity Library</h1>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-6xl">📚</div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              No lessons yet
            </h2>
            <p className="mb-6 text-muted-foreground">
              Create your first lesson to get started!
            </p>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="rounded-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Lesson
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lessons.map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onClick={() => handlePlayLesson(lesson.id)}
                onEdit={() => handleEditLesson(lesson.id)}
                onDelete={() => handleDeleteLesson(lesson.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsModalOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Create Lesson Modal */}
      <CreateLessonModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSelectTemplate={handleCreateLesson}
        onSelectAI={() => setIsAIModalOpen(true)}
      />

      {/* AI Lesson Modal */}
      <AILessonModal
        open={isAIModalOpen}
        onOpenChange={setIsAIModalOpen}
        onLessonCreated={() => setLessons(getLessons())}
      />
    </div>
  );
};

export default Index;
