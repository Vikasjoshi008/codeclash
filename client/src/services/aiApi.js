export async function fetchAIProblem(level, language) {
  const res = await fetch("http://localhost:5000/api/ai/problem", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ level, language })
  });

  if (!res.ok) {
    throw new Error("Failed to fetch AI problem");
  }

  return res.json();
}
