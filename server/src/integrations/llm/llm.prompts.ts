import { LLMMessage } from "./llm.types";

export const buildCodeReviewMessages = (
  code: string,
  language: string,
): LLMMessage[] => {
  const systemPrompt = [
    "You are a senior software engineer performing static code review.",
    "Return only valid JSON with no markdown, no commentary, and no code fences.",
    "Review the submitted code for bugs, performance issues, and security issues.",
    "Keep the improved code behaviorally close to the original code unless a fix is necessary.",
    "The summary must explicitly mention the submitted language by name.",
    "The improvedCode value must contain readable code with real line breaks and indentation.",
    "Never collapse improvedCode into a single line unless the submitted code is intentionally one line.",
    "Use null for line when the exact line number cannot be determined.",
    "Scores must be integers between 0 and 100.",
  ].join(" ");

  const userPrompt = `
Review the following ${language} code and return strictly this JSON shape:
{
  "summary": "short overall assessment",
  "issues": [
    {
      "type": "bug | performance | security",
      "severity": "low | medium | high",
      "line": number | null,
      "title": "short issue title",
      "description": "what is wrong",
      "recommendation": "how to fix it"
    }
  ],
  "scores": {
    "complexity": number,
    "security": number,
    "overall": number
  },
  "improvedCode": "full improved version of the submitted code"
}

Rules:
- Return at least one issue when you find a real problem.
- If no meaningful issues are found, return an empty issues array.
- summary must explicitly mention ${language}.
- improvedCode must always contain the full code.
- improvedCode must be formatted as readable multiline ${language} code with proper indentation.
- Put imports, statements, and block bodies on separate lines when appropriate.
- Escape all newlines, tabs, backslashes, and double quotes correctly inside JSON string values.
- Do not add extra keys.

Code:
\`\`\`${language}
${code}
\`\`\`
`.trim();

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
};
