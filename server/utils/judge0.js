const languageMap = require("./languageMap");

const runCode = async ({ code, input, language }) => {
  const res = await fetch(
    "http://localhost:2358/submissions?base64_encoded=false&wait=true",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        language_id: languageMap[language],
        source_code: code,
        stdin: input
      })
    }
  );

  const text = await res.text();

  if (!text || !text.trim()) {
    throw new Error("Judge0 returned empty response");
  }

  return JSON.parse(text);
};

module.exports = runCode;