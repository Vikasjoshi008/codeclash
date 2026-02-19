const axios = require("axios");

const analyzeWithAI = async (p1, p2, winnerName) => {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/devstral-2-2512:free",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are a strict competitive programming judge. Respond in plain text only."
          },
          {
            role: "user",
            content: `
Player 1 Code:
${p1.code}

Player 1 Time:
${p1.timeTaken} ms

Player 2 Code:
${p2.code}

Player 2 Time:
${p2.timeTaken} ms

Winner: ${winnerName}

Provide maximum 8 lines total.
No markdown.
No code blocks.
No special characters.
Plain text only.

Structure:
1 line - Who won and why.
1 line - Time comparison.
5 short improvement points for both players combined.
`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    return response.data.choices?.[0]?.message?.content || "No AI response.";
  } catch (err) {
    console.error(err.response?.data || err.message);
    return "AI analysis unavailable.";
  }
};

module.exports = analyzeWithAI;