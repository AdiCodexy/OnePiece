import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { subjects, hobbies, studyNotes } = await req.json();

    if (!subjects || !hobbies) {
      throw new Error("Missing required fields");
    }

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }

    const prompt = `You are a strict, highly technical quiz generator. The user has recently logged the following study notes: "${studyNotes}".
    
Generate 10 multiple-choice quiz questions heavily focused on testing the user's knowledge regarding those specific study notes. If the notes are vague, use their general subjects (${subjects}) and hobbies (${hobbies}) as fallback context or flavor.

Requirements:
- Each question needs exactly 4 options.
- Exactly one correct answer (correctIndex 0-3).
- Must be answerable in under 6 seconds by someone reasonably familiar with the topic.
- Return ONLY valid JSON: an array of objects {question, options: [4 strings], correctIndex}. Do not wrap the JSON in markdown code blocks, just return the raw JSON array.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API Error: ${errorText}`);
    }

    const data = await response.json();
    let jsonOutput = data.content[0].text;
    
    // Safety fallback in case Claude wraps in markdown despite instructions
    jsonOutput = jsonOutput.replace(/```json/g, '').replace(/```/g, '').trim();

    const questions = JSON.parse(jsonOutput);

    return new Response(
      JSON.stringify(questions),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
