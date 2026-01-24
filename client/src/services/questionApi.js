const token = localStorage.getItem("token");

export async function getQuestions(difficulty) {
  const res = await fetch(
    `http://localhost:5000/api/questions?difficulty=${difficulty}`, {
      headers : {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );
  return res.json();
}

export async function getQuestionByOrder(difficulty, order) {
  const res = await fetch(
    `http://localhost:5000/api/questions/${order}?difficulty=${difficulty}`, {
     headers : {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );
  return res.json();
}
