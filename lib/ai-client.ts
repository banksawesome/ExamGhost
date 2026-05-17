import type { Question, AIGeneratedResponse } from '@/types';

/**
 * Generate MCQ questions from study material using Gemini API (direct HTTP)
 */
export async function generateQuestionsFromText(
  text: string,
  numberOfQuestions: number,
  difficulty: 'Easy' | 'Medium' | 'Hard'
): Promise<Question[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const prompt = buildPrompt(text, numberOfQuestions, difficulty);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${error}`);
  }

  const data = await response.json();

  try {
    const content = data.candidates[0].content.parts[0].text;
    // Parse the JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    const result = JSON.parse(jsonMatch[0]);
    return result.questions.slice(0, numberOfQuestions);
  } catch (error) {
    console.error('Failed to parse Gemini response:', data);
    throw new Error('Failed to parse questions from AI response');
  }
}

/**
 * Build the prompt for AI question generation
 */
function buildPrompt(text: string, numberOfQuestions: number, difficulty: string): string {
  return `You are an expert exam creator. Generate ${numberOfQuestions} multiple choice questions at ${difficulty} difficulty level based on the following study material.

Study Material:
${text.slice(0, 5000)}

Requirements:
1. Generate valid, clear questions relevant to the provided material
2. Each question must have exactly 4 options (A, B, C, D)
3. Include the correct answer index (0-3)
4. Add a brief explanation for why the correct answer is right
5. Difficulty should match the requested level
6. Return ONLY a valid JSON object with this structure:

{
  "questions": [
    {
      "questionText": "What is...?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of correct answer"
    }
  ]
}

Generate the questions now:`;
}


