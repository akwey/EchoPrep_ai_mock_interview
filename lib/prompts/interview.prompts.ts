export interface GenerateQuestionsParams {
  role: string;
  level: string;
  techstack: string;
  type: string;
  amount: number;
}

export function buildInterviewQuestionsPrompt(
  params: GenerateQuestionsParams
): string {
  const { role, level, techstack, type, amount } = params;

  return `Prepare questions for a job interview.
Role: ${role}
Experience level: ${level}
Tech stack: ${techstack}
Question type: ${type}
Amount: ${amount}

Return ONLY the questions as an array of strings, without extra text. Example:
["Question 1", "Question 2"]`;
}
