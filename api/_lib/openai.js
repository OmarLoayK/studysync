const toolPrompts = {
  planner: {
    schema: `{"title":"string","summary":"string","schedule":[{"day":"string","focus":"string","deliverables":"string","duration":"string"}]}`,
    instructions:
      "Create a realistic study schedule. Keep it concise, practical, and specific. Return only JSON.",
  },
  quiz: {
    schema: `{"title":"string","summary":"string","questions":[{"question":"string","type":"multiple-choice | true-false","options":["string"],"answer":"string","explanation":"string"}]}`,
    instructions:
      "Create a quiz based on the study material. Use the requested number of questions and requested format exactly. For true-false questions, the options must be ['True','False']. For multiple-choice questions, provide four plausible options. Return only JSON.",
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

function getModelForTier(tier) {
  if (tier === "power") {
    return process.env.OPENAI_POWER_MODEL || process.env.OPENAI_MODEL || "gpt-4.1";
  }

  return process.env.OPENAI_MODEL || "gpt-4.1-mini";
}

async function requestOpenAi(body) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${errorText}`);
  }

  return response.json();
}

export async function generateStudyArtifact(tool, payload, options = {}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const prompt = toolPrompts[tool];
  if (!prompt) {
    throw new Error("Unsupported AI tool.");
  }

  const result = await requestOpenAi({
      model: getModelForTier(options.tier),
      max_output_tokens: options.tier === "power" ? 1800 : 1200,
      instructions: `${prompt.instructions} Use compact, startup-grade output quality. JSON schema: ${prompt.schema}`,
      input: JSON.stringify(payload),
  });
  return parseJsonText(extractText(result));
}

export async function verifyTaskProofMatch(payload, options = {}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const result = await requestOpenAi({
      model: getModelForTier(options.tier),
      max_output_tokens: 500,
      instructions:
        "Decide whether the supplied study proof is relevant to the task and course. Return only JSON with schema: {\"matches\":boolean,\"confidence\":\"low | medium | high\",\"reason\":\"string\",\"matchedSubject\":\"string\"}. Be strict about subject mismatch, but allow minor wording differences.",
      input: JSON.stringify(payload),
  });
  return parseJsonText(extractText(result));
}

export async function verifyTaskProofImageMatch(payload, options = {}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const result = await requestOpenAi({
    model: getModelForTier(options.tier),
    max_output_tokens: 500,
    instructions:
      "Decide whether the supplied study-proof image is relevant to the task and course. Return only JSON with schema: {\"matches\":boolean,\"confidence\":\"low | medium | high\",\"reason\":\"string\",\"matchedSubject\":\"string\"}. Be strict about subject mismatch, but allow minor wording differences and typical student-work screenshots.",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Task title: ${payload.taskTitle || ""}\nCourse: ${payload.course || ""}\nDescription: ${payload.description || ""}\nJudge whether the image looks like proof for this subject.`,
          },
          {
            type: "input_image",
            image_url: payload.imageUrl,
          },
        ],
      },
    ],
  });
  return parseJsonText(extractText(result));
}
