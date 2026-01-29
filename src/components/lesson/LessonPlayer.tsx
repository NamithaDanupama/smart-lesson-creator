import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Volume2, RotateCcw, ArrowRight } from 'lucide-react';
import { getLessonById } from '@/services/storageService';
import { speak, stop, preloadVoices } from '@/services/ttsService';
import { Lesson } from '@/types/lesson';
import { toast } from '@/hooks/use-toast';
import mochiCharacter from '@/assets/mochi-character.png';

const LessonPlayer = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (id) {
      const lessonData = getLessonById(id);
      if (lessonData) {
        setLesson(lessonData);
      } else {
        toast({
          title: 'Error',
          description: 'Lesson not found',
          variant: 'destructive',
        });
        navigate('/');
      }
    }
    
    // Preload TTS voices
    preloadVoices();

    return () => {
      stop();
    };
  }, [id, navigate]);

  if (!lesson || lesson.items.length === 0) {
    return null;
  }

  const currentItem = lesson.items[currentIndex];
  const progress = ((currentIndex + 1) / lesson.items.length) * 100;
  const isLastItem = currentIndex === lesson.items.length - 1;

  const handleSpeak = async () => {
    if (isSpeaking) {
      stop();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      await speak(currentItem.spokenText || currentItem.name);
    } catch (error) {
      console.error('TTS Error:', error);
      toast({
        title: 'Audio Error',
        description: 'Could not play audio. Check browser settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleRepeat = async () => {
    stop();
    setIsSpeaking(false);
    setTimeout(() => handleSpeak(), 100);
  };

  const handleNext = () => {
    stop();
    setIsSpeaking(false);
    if (!isLastItem) {
      setCurrentIndex(prev => prev + 1);
    } else {
      toast({
        title: '🎉 Lesson Complete!',
        description: 'Great job finishing this lesson!',
      });
      navigate('/');
    }
  };

  const handleExit = () => {
    stop();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="w-20" /> {/* Spacer */}
        <h1 className="text-xl font-bold text-foreground">
          Learning: {lesson.title}
        </h1>
        <Button 
          variant="secondary" 
          className="rounded-full px-6"
          onClick={handleExit}
        >
          End
        </Button>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 px-6 pb-24">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-8">
          {/* Left Side - Mochi Character (simple companion) */}
          <div className="hidden flex-shrink-0 lg:block">
            <div className="animate-float">
              <img 
                src={mochiCharacter}
                alt="Mochi Character" 
                className="h-48 w-48 object-contain opacity-90"
              />
            </div>
          </div>

          {/* Right Side - Main Learning Content (highlighted focus) */}
          <div className="flex flex-1 items-center justify-center">
            <div className="lesson-content-card flex w-full max-w-lg flex-col items-center rounded-3xl border-4 border-primary/20 bg-card p-8 shadow-xl">
              {/* Image - Main focus area */}
              <div className="aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-info/30">
                {currentItem.image ? (
                  <img
                    src={currentItem.image}
                    alt={currentItem.name}
                    className="h-full w-full object-contain p-4"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-8xl">📷</span>
                  </div>
                )}
              </div>

              {/* Item Name - Large and prominent */}
              <h2 className="mt-6 text-4xl font-extrabold uppercase tracking-wide text-foreground">
                {currentItem.name}
              </h2>

              {/* Spoken text if different */}
              {currentItem.spokenText && currentItem.spokenText !== currentItem.name && (
                <p className="mt-2 text-lg text-muted-foreground">
                  "{currentItem.spokenText}"
                </p>
              )}

              {/* Action Buttons - All together for easy access */}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button
                  variant="default"
                  className={`gap-2 rounded-xl px-6 py-3 text-lg ${isSpeaking ? 'animate-pulse' : ''}`}
                  onClick={handleSpeak}
                >
                  <Volume2 className="h-5 w-5" />
                  Listen
                </Button>

                <Button
                  variant="secondary"
                  className="gap-2 rounded-xl px-6 py-3 text-lg"
                  onClick={handleRepeat}
                >
                  <RotateCcw className="h-5 w-5" />
                  Repeat
                </Button>

                <Button
                  variant="secondary"
                  className="gap-2 rounded-xl px-6 py-3 text-lg"
                  onClick={handleNext}
                >
                  <ArrowRight className="h-5 w-5" />
                  {isLastItem ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Progress Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background px-6 py-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-medium">Lesson Progress</span>
            <span>{currentIndex + 1} of {lesson.items.length}</span>
          </div>
          <Progress value={progress} className="mt-2 h-2" />
        </div>
      </footer>
    </div>
  );
};

export default LessonPlayer;
