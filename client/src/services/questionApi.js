export async function getQuestions(language, difficulty) {
  const res = await fetch(
    `http://localhost:5000/api/questions?language=${language}&difficulty=${difficulty}`
  );
  return res.json();
}

export async function getQuestion(language, difficulty, order) {
  const res = await fetch(
    `http://localhost:5000/api/questions/${order}?language=${language}&difficulty=${difficulty}`
  );
  return res.json();
}
