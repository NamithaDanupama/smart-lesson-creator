import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Volume2, RotateCcw, ArrowRight } from 'lucide-react';
import { getLessonById } from '@/services/storageService';
import { speak, stop, preloadVoices } from '@/services/ttsService';
import { Lesson } from '@/types/lesson';
import { toast } from '@/hooks/use-toast';

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
        <div className="mx-auto w-full max-w-6xl rounded-3xl bg-secondary/50 p-6">
          <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Side - Character with Speech Bubble */}
            <div className="relative flex flex-col items-center justify-center">
              {/* Character */}
              <div className="animate-float relative">
                <img 
                  src="https://i.imgur.com/YKoNvGy.png" 
                  alt="Mochi Character" 
                  className="h-64 w-64 object-contain lg:h-80 lg:w-80"
                  onError={(e) => {
                    // Fallback to emoji if image fails
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<div class="text-9xl animate-float">🐵</div>';
                  }}
                />
              </div>
              
              {/* Speech Bubble */}
              <div className="relative mt-4 max-w-xs rounded-2xl bg-card px-6 py-4 shadow-lg">
                <p className="text-center text-lg font-semibold text-foreground">
                  {currentItem.spokenText || currentItem.name}
                </p>
                {/* Bubble pointer */}
                <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 bg-card" />
              </div>

              {/* Control Buttons */}
              <div className="mt-8 flex gap-4">
                <Button
                  variant="secondary"
                  className="gap-2 rounded-xl px-6 py-3"
                  onClick={handleRepeat}
                >
                  <RotateCcw className="h-5 w-5" />
                  Repeat
                </Button>

                <Button
                  variant="secondary"
                  className="gap-2 rounded-xl px-6 py-3"
                  onClick={handleNext}
                >
                  <ArrowRight className="h-5 w-5" />
                  Next
                </Button>
              </div>
            </div>

            {/* Right Side - Content Card */}
            <div className="flex items-center justify-center">
              <div className="lesson-content-card flex w-full max-w-md flex-col items-center">
                {/* Image */}
                <div className="aspect-square w-full overflow-hidden rounded-2xl bg-card">
                  {currentItem.image ? (
                    <img
                      src={currentItem.image}
                      alt={currentItem.name}
                      className="h-full w-full object-contain p-4"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <span className="text-8xl">📷</span>
                    </div>
                  )}
                </div>

                {/* Item Name */}
                <h2 className="mt-6 text-3xl font-bold uppercase tracking-wide text-foreground">
                  {currentItem.name}
                </h2>

                {/* Listen Button */}
                <Button
                  variant="secondary"
                  className={`mt-4 gap-2 rounded-xl px-6 py-3 ${isSpeaking ? 'animate-pulse bg-primary text-primary-foreground' : ''}`}
                  onClick={handleSpeak}
                >
                  <Volume2 className="h-5 w-5" />
                  Listen
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
