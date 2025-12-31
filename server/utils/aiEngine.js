const { options } = require("../routes/practice/practiceOnline");

const rules = {
  easy: {
    topics: ["arrays", "strings"],
    constraints: "n <= 1000"
  },
  medium: {
    topics: ["hashmap", "recursion"],
    constraints: "n <= 10^5"
  },
  hard: {
    topics: ["dynamic programming", "graphs"],
    constraints: "n <= 10^6"
  }
};

/* ---------- PROMPT BUILDER ---------- */
function buildPrompt(level, language) {
  const rule = rules[level];

  return `
You are a coding problem generator.

Generate ONE coding problem.

Difficulty: ${level}
Programming Language: ${language}
Topics: ${rule.topics.join(", ")}
Constraints: ${rule.constraints}

VERY IMPORTANT RULES:
- Return ONLY valid JSON
- Do NOT add any text before or after JSON
- Do NOT use markdown
- Do NOT explain anything
- JSON must be complete and valid

JSON FORMAT:
{
  "title": "string",
  "description": "string",
  "input_format": "string",
  "output_format": "string",
  "example": "string"
}
`;
}


/* ---------- AI CALL ---------- */
async function callAI(prompt) {
  const res = await fetch(
    "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.2",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 400,
          temperature: 0.6,
          return_full_text: false

        },
        options: {
            wait_for_model: true
        }
      })
    }
  );

  const data = await res.json();
  // DEBUG LOG (temporary)
  console.log("🧠 HF RAW RESPONSE:", JSON.stringify(data, null, 2));

  // Handle different HF response shapes
  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text;
  }

  if (data.generated_text) {
    return data.generated_text;
  }

  throw new Error("Empty AI response");
}

/* ---------- JSON PARSER ---------- */
function extractJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("No JSON found in AI response");
    }

    return JSON.parse(match[0]);
  } catch (err) {
    console.error("❌ JSON PARSE FAILED");
    console.error("RAW AI RESPONSE:\n", text);
    throw new Error("Invalid AI JSON output");
  }
}


/* ---------- CACHE ---------- */
const cache = {};
const fallbackProblems = {
  easy: {
    title: "Sum of Two Numbers",
    description: "Given two integers, return their sum.",
    input_format: "Two integers a and b",
    output_format: "An integer representing the sum",
    example: "Input: 3 5 → Output: 8"
  },
  medium: {
    title: "Reverse an Array",
    description: "Reverse the given array of integers.",
    input_format: "An array of integers",
    output_format: "Reversed array",
    example: "Input: [1,2,3] → Output: [3,2,1]"
  },
  hard: {
    title: "Find Longest Subarray",
    description: "Find the longest subarray with sum equal to K.",
    input_format: "Array of integers and integer K",
    output_format: "Length of longest subarray",
    example: "Input: [1,2,3,4], K=6 → Output: 3"
  }
};


/* ---------- MAIN FUNCTION ---------- */
async function generateProblem(level, language) {
  const key = `${level}_${language}`;
  if (cache[key]) return cache[key];

  const prompt = buildPrompt(level, language);

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`🧠 AI attempt ${attempt}`);
      const aiText = await callAI(prompt);
      const problem = extractJSON(aiText);

      cache[key] = problem;
      return problem;
    } catch (err) {
      console.warn(`⚠️ AI attempt ${attempt} failed`);
    }
  }

  console.warn("⚠️ Using fallback problem");

  const fallback = {
    ...fallbackProblems[level],
    description: `${fallbackProblems[level].description}\n\nSolve this in ${language}.`
  };

  cache[key] = fallback;
  return fallback;
}

module.exports = { generateProblem };
