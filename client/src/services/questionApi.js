const token = localStorage.getItem("token");

export async function getQuestions(language, difficulty) {
  const res = await fetch(
    `${import.meta.VITE_API_URL}/api/questions?language=${language}&difficulty=${difficulty}`, {
      headers : {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );
  return res.json();
}

export async function getQuestionByOrder(language, difficulty, order) {
  const res = await fetch(
    `${import.meta.VITE_API_URL}/api/questions/${order}?language=${language}&difficulty=${difficulty}`, {
     headers : {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );
  return res.json();
}
