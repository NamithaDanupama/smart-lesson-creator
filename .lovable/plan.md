
# Lesson Creator & Player Feature

A standalone lesson creation and playback feature that can be integrated into your existing educational project later.

---

## 1. Activity Library (Home Page)
The main view showing all created lessons as cards.

**Features:**
- Card grid displaying lessons with colorful cover images
- Each card shows: lesson title, description, and "Activity" badge
- Click card to play the lesson
- Floating action button (+) to create new lessons
- Clean header with back arrow

---

## 2. Create Lesson Modal
When clicking the + button, a modal appears with two creation options.

**Options:**
- "Use Customized Template" button → opens the lesson editor
- "Use AI Generated Template" button (placeholder for future AI integration)

---

## 3. Lesson Editor
A form where lessons are built with multiple items.

**Fields:**
- Lesson title (e.g., "Fruits")
- Lesson description
- Cover image upload
- **Lesson items section** (add multiple items):
  - Item image upload
  - Item name (e.g., "Apple")
  - Item spoken text (e.g., "This is an Apple")
  - Reorder/delete items
- Save & Cancel buttons

---

## 4. Lesson Player
Interactive playback screen matching your UI designs.

**Features:**
- Cute mascot character with speech bubble
- Large item card showing image and label
- **Listen button** - speaks the item text aloud
- **Repeat button** - replays current item audio
- **Next button** - advances to next item
- Progress indicator showing "1 of 3"
- End button to exit

---

## 5. Data Storage (Flexible)
Lessons stored locally with easy database migration path.

**Initial Setup:**
- Uses browser localStorage for saving lessons
- Clean data structure ready for database migration
- When you connect Supabase/database later, just swap the storage layer

**Data Structure:**
```
Lesson: { id, title, description, coverImage, items[] }
Item: { id, image, name, spokenText, order }
```

---

## 6. Text-to-Speech
Browser's built-in Web Speech API for audio playback.

- Works immediately with no API keys
- Can be swapped for ElevenLabs or other TTS services later
- Simple interface: pass text, get audio

---

## Integration-Ready Architecture
- All components are modular and self-contained
- Easy to add authentication wrapper later
- Storage layer abstracted for easy database swap
- TTS service abstracted for easy API upgrade

