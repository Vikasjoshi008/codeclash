const API_URL = import.meta.env.VITE_API_URL;

/* ================= GET QUESTIONS LIST ================= */
export async function getQuestions(language, difficulty) {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${API_URL}/questions?language=${language}&difficulty=${difficulty}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch questions");
  }

  return res.json();
}

/* ================= GET QUESTION BY ORDER ================= */
export async function getQuestionByOrder(language, difficulty, order) {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${API_URL}/questions/${order}?language=${language}&difficulty=${difficulty}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch question");
  }

  return res.json();
}
