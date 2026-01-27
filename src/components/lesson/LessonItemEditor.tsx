import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { GripVertical, ImagePlus, Trash2, X } from 'lucide-react';

interface LessonItemEditorProps {
  index: number;
  image: string;
  name: string;
  spokenText: string;
  onUpdate: (field: 'image' | 'name' | 'spokenText', value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const LessonItemEditor = ({
  index,
  image,
  name,
  spokenText,
  onUpdate,
  onRemove,
  canRemove,
}: LessonItemEditorProps) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdate('image', event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="border-2 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-1 pt-2 text-muted-foreground">
            <GripVertical className="h-5 w-5 cursor-grab" />
            <span className="text-sm font-medium">{index + 1}</span>
          </div>

          <div className="flex-1 space-y-4">
            {/* Image Upload */}
            <div>
              <Label className="text-sm font-medium">Item Image</Label>
              <div className="mt-1">
                {image ? (
                  <div className="relative inline-block">
                    <img
                      src={image}
                      alt={name || 'Item'}
                      className="h-24 w-24 rounded-lg object-cover border-2 border-border"
                    />
                    <button
                      type="button"
                      onClick={() => onUpdate('image', '')}
                      className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 hover:border-primary hover:bg-muted">
                    <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Item Name */}
            <div>
              <Label htmlFor={`item-name-${index}`} className="text-sm font-medium">
                Item Name
              </Label>
              <Input
                id={`item-name-${index}`}
                placeholder="e.g., Apple"
                value={name}
                onChange={(e) => onUpdate('name', e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Spoken Text */}
            <div>
              <Label htmlFor={`item-text-${index}`} className="text-sm font-medium">
                Spoken Text
              </Label>
              <Textarea
                id={`item-text-${index}`}
                placeholder="e.g., This is an Apple. Apples are red and delicious!"
                value={spokenText}
                onChange={(e) => onUpdate('spokenText', e.target.value)}
                className="mt-1 min-h-[80px]"
              />
            </div>
          </div>

          {/* Remove Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            disabled={!canRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonItemEditor;
