import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ChevronRight, Volume2, RotateCcw, X } from 'lucide-react';
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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-sky-100 to-sky-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" onClick={handleExit}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">{lesson.title}</h1>
        <Button variant="ghost" size="icon" onClick={handleExit}>
          <X className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-32">
        {/* Mascot with Speech Bubble */}
        <div className="mb-6 flex items-end gap-2">
          {/* Speech Bubble */}
          <div className="relative max-w-[250px] rounded-2xl bg-white p-4 shadow-lg">
            <p className="text-center text-lg font-medium text-foreground">
              {currentItem.spokenText || currentItem.name}
            </p>
            {/* Bubble tail */}
            <div className="absolute -bottom-2 right-8 h-4 w-4 rotate-45 bg-white" />
          </div>
          
          {/* Mascot */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-4xl shadow-lg">
            🦊
          </div>
        </div>

        {/* Item Card */}
        <Card className="w-full max-w-sm overflow-hidden rounded-3xl border-4 border-white bg-white shadow-xl">
          <div className="aspect-square overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/20">
            {currentItem.image ? (
              <img
                src={currentItem.image}
                alt={currentItem.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-6xl">📷</span>
              </div>
            )}
          </div>
          <div className="p-4 text-center">
            <h2 className="text-2xl font-bold text-foreground">{currentItem.name}</h2>
          </div>
        </Card>
      </main>

      {/* Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur pb-safe">
        {/* Progress */}
        <div className="px-4 pt-3">
          <div className="mb-1 flex items-center justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{currentIndex + 1} of {lesson.items.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 p-4">
          <Button
            variant="outline"
            size="lg"
            className="h-14 w-14 rounded-full"
            onClick={handleRepeat}
          >
            <RotateCcw className="h-6 w-6" />
          </Button>

          <Button
            size="lg"
            className={`h-16 w-16 rounded-full ${isSpeaking ? 'animate-pulse bg-green-500 hover:bg-green-600' : ''}`}
            onClick={handleSpeak}
          >
            <Volume2 className="h-7 w-7" />
          </Button>

          <Button
            size="lg"
            className="h-14 gap-1 rounded-full px-6"
            onClick={handleNext}
          >
            {isLastItem ? 'Finish' : 'Next'}
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;
