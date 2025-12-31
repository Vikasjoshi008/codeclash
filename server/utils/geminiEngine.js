async function generateProblem(level, language) {
  const rules = {
    easy: {
      topics: ["arrays", "strings"],
      constraints: "n <= 1000"
    },
    medium: {
      topics: ["hashmaps", "recursion"],
      constraints: "n <= 10^5"
    },
    hard: {
      topics: ["dynamic programming", "graphs"],
      constraints: "n <= 10^6"
    }
  };

  const rule = rules[level];

  const prompt = `
You are a coding problem generator.

Generate ONE coding problem.

Difficulty: ${level}
Programming Language: ${language}
Topics: ${rule.topics.join(", ")}
Constraints: ${rule.constraints}

VERY IMPORTANT RULES:
- Respond ONLY with valid JSON
- Do NOT add explanation
- Do NOT add markdown
- Do NOT include solution

Respond ONLY with valid JSON.
Keep all values SHORT.

JSON FORMAT:
{
  "title": "string",
  "description": "string (max 2 lines)",
  "input_format": "string",
  "output_format": "string",
  "example": "string",
  "testCases": [
    {
      "input": [],
      "output": ""
    }
  ]
}

`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1200
        },
      })
    }
  );

  const data = await response.json();

  // 🔍 DEBUG (VERY IMPORTANT)
  console.log("🧠 GEMINI RAW RESPONSE:", JSON.stringify(data, null, 2));

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error("Gemini returned no candidates");
  }

  const text = data.candidates[0].content.parts[0].text;

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("Gemini did not return valid JSON");
  }

  function safeParseJSON(text) {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Incomplete JSON from Gemini");
  }

  return JSON.parse(text.slice(firstBrace, lastBrace + 1));
}


  return safeParseJSON(text)
}

module.exports = { generateProblem };
