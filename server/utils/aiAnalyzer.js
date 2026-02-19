const axios = require("axios");

const analyzeWithAI = async (p1, p2, winnerName) => {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a competitive programming judge. Analyze both codes and provide suggestions."
          },
          {
            role: "user",
            content: `
Player 1 Code:
${p1.code}

Player 2 Code:
${p2.code}

Winner: ${winnerName}

You are a competitive coding judge.

Give a SHORT summary (max 5 lines).
No markdown.
No ###.
No code blocks.
No special characters.
Plain clean text only.

Include:
- Who won and why
- Time taken by both players
- give five bullet points on how the both players code can be improved.

Keep it concise.`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;

  } catch (err) {
    return "AI analysis unavailable.";
  }
};

module.exports = analyzeWithAI;
