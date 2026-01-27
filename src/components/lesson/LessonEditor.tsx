import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ImagePlus, Plus, Save, X } from 'lucide-react';
import { createLesson, updateLesson, getLessonById } from '@/services/storageService';
import { LessonFormData } from '@/types/lesson';
import LessonItemEditor from './LessonItemEditor';
import { toast } from '@/hooks/use-toast';

interface LessonEditorProps {
  lessonId?: string;
}

interface ItemData {
  image: string;
  name: string;
  spokenText: string;
}

const LessonEditor = ({ lessonId }: LessonEditorProps) => {
  const navigate = useNavigate();
  const existingLesson = lessonId ? getLessonById(lessonId) : undefined;

  const [title, setTitle] = useState(existingLesson?.title || '');
  const [description, setDescription] = useState(existingLesson?.description || '');
  const [coverImage, setCoverImage] = useState(existingLesson?.coverImage || '');
  const [items, setItems] = useState<ItemData[]>(
    existingLesson?.items.map(item => ({
      image: item.image,
      name: item.name,
      spokenText: item.spokenText,
    })) || [{ image: '', name: '', spokenText: '' }]
  );

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateItem = (index: number, field: keyof ItemData, value: string) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    setItems(prev => [...prev, { image: '', name: '', spokenText: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a lesson title',
        variant: 'destructive',
      });
      return;
    }

    const validItems = items.filter(item => item.name.trim() || item.spokenText.trim());
    if (validItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one lesson item',
        variant: 'destructive',
      });
      return;
    }

    const formData: LessonFormData = {
      title: title.trim(),
      description: description.trim(),
      coverImage,
      items: validItems,
    };

    if (lessonId) {
      updateLesson(lessonId, formData);
      toast({
        title: 'Success',
        description: 'Lesson updated successfully',
      });
    } else {
      createLesson(formData);
      toast({
        title: 'Success',
        description: 'Lesson created successfully',
      });
    }

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">
            {lessonId ? 'Edit Lesson' : 'Create Lesson'}
          </h1>
          <Button onClick={handleSave} size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </header>

      {/* Form */}
      <main className="mx-auto max-w-3xl p-4 pb-20">
        <div className="space-y-6">
          {/* Cover Image */}
          <div>
            <Label className="text-sm font-medium">Cover Image</Label>
            <div className="mt-2">
              {coverImage ? (
                <div className="relative inline-block">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="h-40 w-full max-w-sm rounded-xl object-cover border-2 border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    className="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-destructive-foreground hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex h-40 w-full max-w-sm cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 hover:border-primary hover:bg-muted">
                  <div className="text-center">
                    <ImagePlus className="mx-auto h-10 w-10 text-muted-foreground" />
                    <span className="mt-2 block text-sm text-muted-foreground">
                      Upload cover image
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Lesson Title
            </Label>
            <Input
              id="title"
              placeholder="e.g., Learn Fruits"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="What will students learn in this lesson?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Lesson Items */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Label className="text-sm font-medium">Lesson Items</Label>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-1 h-4 w-4" />
                Add Item
              </Button>
            </div>
            <div className="space-y-4">
              {items.map((item, index) => (
                <LessonItemEditor
                  key={index}
                  index={index}
                  image={item.image}
                  name={item.name}
                  spokenText={item.spokenText}
                  onUpdate={(field, value) => updateItem(index, field, value)}
                  onRemove={() => removeItem(index)}
                  canRemove={items.length > 1}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LessonEditor;
