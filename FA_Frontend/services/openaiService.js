const fs = require("fs/promises");

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

async function analyzeSubmission({ instruction, message, link, context, imagePath, imageMimeType }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY missing.");
  }

  const content = [
    {
      type: "input_text",
      text: buildPrompt({ instruction, message, link, context, hasImage: Boolean(imagePath) })
    }
  ];

  if (imagePath) {
    content.push({
      type: "input_image",
      image_url: await getImageDataUrl(imagePath, imageMimeType)
    });
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      input: [
        {
          role: "user",
          content
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "scam_analysis",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              riskLevel: { type: "string", enum: ["Low", "Medium", "High", "Unclear"] },
              scamType: { type: "string" },
              redFlags: {
                type: "array",
                items: { type: "string" }
              },
              recommendedAction: { type: "string" }
            },
            required: ["riskLevel", "scamType", "redFlags", "recommendedAction"]
          }
        }
      }
    })
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message || "OpenAI request failed.");
  }

  return normalizeAnalysis(JSON.parse(getOutputText(payload)));
}

function buildPrompt({ instruction, message, link, context, hasImage }) {
  return [
    instruction || "Check this submission for scams.",
    "Assess only the submitted content. If an image is included, inspect the image text and visible scam indicators.",
    "Return a practical scam risk analysis for a Singapore user.",
    "",
    message ? `Message:\n${message}` : "",
    link ? `Link:\n${link}` : "",
    context ? `Additional notes:\n${context}` : "",
    hasImage ? "Image: attached by the user." : ""
  ].filter(Boolean).join("\n\n");
}

async function getImageDataUrl(imagePath, imageMimeType) {
  const data = await fs.readFile(imagePath, "base64");
  return `data:${imageMimeType || "image/png"};base64,${data}`;
}

function getOutputText(payload) {
  if (payload?.output_text) {
    return payload.output_text;
  }

  const text = payload?.output
    ?.flatMap((item) => item.content || [])
    ?.map((item) => item.text || "")
    ?.join("")
    ?.trim();

  if (!text) {
    throw new Error("OpenAI returned no analysis text.");
  }

  return text;
}

function normalizeAnalysis(result) {
  return {
    riskLevel: String(result.riskLevel || "Unclear"),
    scamType: String(result.scamType || "Unclear"),
    redFlags: Array.isArray(result.redFlags) ? result.redFlags.map(String) : [],
    recommendedAction: String(result.recommendedAction || "Verify through official channels before taking action.")
  };
}

function getFriendlyOpenAIError(error) {
  const message = error.message || "";

  if (message.includes("OPENAI_API_KEY")) {
    return "OpenAI is not configured yet. Add OPENAI_API_KEY to your .env file.";
  }

  if (/quota|billing|insufficient/i.test(message)) {
    return "OpenAI could not run the analysis because of billing or quota limits.";
  }

  if (/api key|auth|unauthorized/i.test(message)) {
    return "OpenAI rejected the API key. Check OPENAI_API_KEY in your .env file.";
  }

  return "OpenAI analysis is unavailable right now. Please try again later.";
}

module.exports = {
  analyzeSubmission,
  getFriendlyOpenAIError
};
