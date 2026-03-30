const toolPrompts = {
  planner: {
    schema: `{"title":"string","summary":"string","schedule":[{"day":"string","focus":"string","deliverables":"string","duration":"string"}]}`,
    instructions:
      "Create a realistic study schedule. Keep it concise, practical, and specific. Return only JSON.",
  },
  quiz: {
    schema: `{"title":"string","summary":"string","questions":[{"question":"string","options":["string","string","string","string"],"answer":"string","explanation":"string"}]}`,
    instructions:
      "Create a short multiple-choice quiz based on the study material. Return only JSON.",
  },
  flashcards: {
    schema: `{"title":"string","summary":"string","cards":[{"front":"string","back":"string"}]}`,
    instructions:
      "Convert the material into concise flashcards. Return only JSON.",
  },
  explainer: {
    schema: `{"title":"string","summary":"string","explanation":["string"],"examples":["string"]}`,
    instructions:
      "Explain the concept simply for a student. Return only JSON.",
  },
  breakdown: {
    schema: `{"title":"string","summary":"string","phases":[{"name":"string","goal":"string","estimate":"string","tasks":["string"]}]}`,
    instructions:
      "Break the assignment or exam prep into phases with concrete steps. Return only JSON.",
  },
};

function extractText(payload) {
  if (payload.output_text) return payload.output_text;
  return payload.output
    ?.flatMap((item) => item.content || [])
    ?.map((item) => item.text || "")
    ?.join("") ?? "";
}

function parseJsonText(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("The AI response did not include valid JSON.");
  }
  return JSON.parse(text.slice(start, end + 1));
}

export async function generateStudyArtifact(tool, payload) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const prompt = toolPrompts[tool];
  if (!prompt) {
    throw new Error("Unsupported AI tool.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      max_output_tokens: 1200,
      instructions: `${prompt.instructions} Use compact, startup-grade output quality. JSON schema: ${prompt.schema}`,
      input: JSON.stringify(payload),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${errorText}`);
  }

  const result = await response.json();
  return parseJsonText(extractText(result));
}
