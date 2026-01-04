require("dotenv").config();
const languageMap = require("./languageMap");

const runCode = async ({ code, input, language }) => {
  const res = await fetch(
    "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
        "X-RapidAPI-Host": process.env.JUDGE0_HOST
      },
      body: JSON.stringify({
        language_id: languageMap[language],
        source_code: code,
        stdin: input
      })
    }
  );

  return res.json();
};

module.exports = runCode;
