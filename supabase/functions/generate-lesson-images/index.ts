import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateImagesRequest {
  topic: string;
  items: { name: string; spokenText: string }[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { topic, items }: GenerateImagesRequest = await req.json();

    console.log(`Generating images for topic: ${topic}, items: ${items.length}`);

    const imageUrls: string[] = [];

    for (const item of items) {
      const prompt = `Create a simple, colorful, child-friendly cartoon illustration of "${item.name}" for an educational children's app about "${topic}". 
The image should be:
- Bright and cheerful colors
- Simple and clear shapes
- Cute and friendly style suitable for ages 4-8
- No text in the image
- White or simple background
- Single subject focused`;

      console.log(`Generating image for: ${item.name}`);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"],
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error for ${item.name}:`, errorText);
        imageUrls.push(""); // Push empty string on failure
        continue;
      }

      const data = await response.json();
      console.log(`Gemini response for ${item.name}:`, JSON.stringify(data).substring(0, 500));

      // Extract base64 image from response
      const parts = data.candidates?.[0]?.content?.parts || [];
      let base64Image = "";

      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith("image/")) {
          base64Image = part.inlineData.data;
          break;
        }
      }

      if (!base64Image) {
        console.error(`No image generated for ${item.name}`);
        imageUrls.push("");
        continue;
      }

      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${item.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`;
      const imageBuffer = Uint8Array.from(atob(base64Image), (c) => c.charCodeAt(0));

      const { error: uploadError } = await supabase.storage
        .from("lesson-images")
        .upload(fileName, imageBuffer, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) {
        console.error(`Upload error for ${item.name}:`, uploadError);
        imageUrls.push("");
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("lesson-images")
        .getPublicUrl(fileName);

      imageUrls.push(urlData.publicUrl);
      console.log(`Successfully generated and uploaded image for ${item.name}: ${urlData.publicUrl}`);
    }

    return new Response(JSON.stringify({ imageUrls }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-lesson-images:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
