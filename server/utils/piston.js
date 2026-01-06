const runCode = async ({ code, input, language }) => {
  let pistonLang = language;
  let version = "latest";

  // map frontend language → piston language
  if (language === "javascript") {
    pistonLang = "javascript";
    version = "18.15.0";
  } else if (language === "python") {
    pistonLang = "python";
    version = "3.10.0";
  } else if (language === "cpp") {
    pistonLang = "cpp";
    version = "10.2.0";
  } else if (language === "java") {
    pistonLang = "java";
    version = "15.0.2";
  }

  const response = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: pistonLang,
      version,
      files: [
        {
          name: "main",
          content: code
        }
      ],
      stdin: input ? JSON.stringify(input) : ""
    })
  });

  return response.json();
};

module.exports = runCode;
