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
    // store: false — don't keep student content on OpenAI's side beyond the request.
    body: JSON.stringify({ store: false, ...body }),
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
      "Decide whether the supplied image is genuine proof that the student actually worked on or completed THIS specific task (for example their notes, worked problems, an essay draft, a submission confirmation, or study material with visible progress). Check the image against all of the task details: it must match the course and subject in the title, and when the description names specific work (chapters, problem numbers, topics, page counts, a particular assignment), the image should show that work. An image on the right subject but clearly for different work than the description asks for should be rejected. If the description is empty or vague, judge by the title and course and don't penalize missing detail. The student's completion note is context only; the image itself must show the evidence. Reject images unrelated to the task, blank or near-blank pages, memes, selfies, generic stock or web images, and images with no visible evidence of the student's own work. Return only JSON with schema: {\"matches\":boolean,\"confidence\":\"low | medium | high\",\"reason\":\"string\",\"matchedSubject\":\"string\"}. The reason is shown to the student: one short, friendly sentence. If rejected, say what was missing compared to the task. Allow minor wording differences and typical photos or screenshots of student work.",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: [
              `Task title: ${payload.taskTitle || "(none)"}`,
              `Course: ${payload.course || "(none)"}`,
              `Task description (what the student had to do): ${payload.description || "(none)"}`,
              `Student's completion note: ${payload.completionNote || "(none)"}`,
              "Does this image prove the student did this specific task?",
            ].join("\n"),
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
