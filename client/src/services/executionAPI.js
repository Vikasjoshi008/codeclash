export async function runCode(code, questionId, language) {
  const res = await fetch("http://localhost:5000/api/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, questionId, language })
  });

  return res.json();
}
