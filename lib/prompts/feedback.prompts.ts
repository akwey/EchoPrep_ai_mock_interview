export const FEEDBACK_SYSTEM_PROMPT =
  "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories";

export function buildFeedbackPrompt(formattedTranscript: string): string {
  return `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `;
}

export function formatTranscript(
  transcript: { role: string; content: string }[]
): string {
  return transcript
    .map((sentence) => `- ${sentence.role}: ${sentence.content}\n`)
    .join("");
}
