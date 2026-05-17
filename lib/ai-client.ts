import { Groq } from 'groq-sdk';
import type { Question } from "@/types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateQuestionsFromText(
  text: string,
  numberOfQuestions: number,
  difficulty: "Easy" | "Medium" | "Hard"
): Promise<Question[]> {
  const cleanedText = cleanStudyMaterial(text);

  const prompt = buildPrompt(
    cleanedText,
    numberOfQuestions,
    difficulty
  );

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 1,
    max_completion_tokens: 2048,
    top_p: 1,
  });

  const rawText = completion.choices[0]?.message?.content;
  if (!rawText) throw new Error("Empty AI response");

  let jsonStr: string | null = extractJSON(rawText);
  
  if (!jsonStr) {
    console.error("Raw AI response:", rawText.substring(0, 1000));
    throw new Error("No JSON found in response");
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    console.error("JSON parse error:", e, "Input:", jsonStr.substring(0, 200));
    throw new Error("Invalid JSON format in AI response");
  }

  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error("Invalid AI response format");
  }

  return parsed.questions.slice(0, numberOfQuestions);
}

function extractJSON(text: string): string | null {
  // Strip markdown code fences
  const stripped = text.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
  
  const start = stripped.indexOf('{');
  if (start === -1) return null;
  
  let depth = 0;
  let inString = false;
  let escape = false;
  
  for (let i = start; i < stripped.length; i++) {
    const char = stripped[i];
    
    if (escape) {
      escape = false;
      continue;
    }
    
    if (char === '\\') {
      escape = true;
      continue;
    }
    
    if (char === '"' && !inString) {
      inString = true;
    } else if (char === '"' && inString) {
      inString = false;
    } else if (!inString) {
      if (char === '{') depth++;
      else if (char === '}') {
        depth--;
        if (depth === 0) return stripped.slice(start, i + 1);
      }
    }
  }
  
  // Handle truncated JSON - try to close it properly
  if (start !== -1 && depth > 0) {
    let repaired = stripped.slice(start);
    // Close any unclosed strings
    if (inString) repaired += '"';
    // Close remaining braces
    for (let i = 0; i < depth; i++) repaired += '}';
    // Try to parse repaired JSON
    try {
      JSON.parse(repaired);
      return repaired;
    } catch {
      return null;
    }
  }
  
  return null;
}

function cleanStudyMaterial(text: string) {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 12000);
}

function buildPrompt(
  text: string,
  numberOfQuestions: number,
  difficulty: string
) {
  return `
You are an expert exam generator.

Generate exactly ${numberOfQuestions} multiple choice questions.

Difficulty level:
${difficulty}

Rules:
- Questions must be based ONLY on the provided material
- Each question must have exactly 4 options
- Only ONE option can be correct
- correctAnswer must be index 0-3
- Explanations must be short and clear
- Avoid duplicate questions
- Keep wording academic and professional

Return ONLY valid JSON. No other text.
Format: {"questions": [{"questionText": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "..."}]}

Study Material:
${text}
`;
}